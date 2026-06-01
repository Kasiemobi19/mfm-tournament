const { sendConfirmationEmail } = require('../utils/email');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mfm-tournament-secret-key-2026';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('❌ Invalid token:', err.message);
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// GET /api/players - Get players for logged-in team
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { gender } = req.query;
        const teamId = req.user.teamId;
        
        console.log('📋 Fetching players for team:', teamId, 'Gender:', gender);
        
        const db = req.app.get('db');
        
        const result = await db.query(
            'SELECT * FROM players WHERE team_id = $1 AND gender = $2 ORDER BY player_id DESC',
            [teamId, gender]
        );
        
        console.log('✅ Found', result.rows.length, 'players');
        
        const players = result.rows.map(p => ({
            playerId: p.player_id,
            firstName: p.first_name,
            lastName: p.last_name,
            email: p.email,
            phone: p.phone,
            gender: p.gender,
            position: p.position,
            jerseyNumber: p.jersey_number,
            emergencyContactName: p.emergency_contact_name,
            emergencyContactPhone: p.emergency_contact_phone,
            confirmationNumber: p.confirmation_number
        }));
        
        res.json({ success: true, players });
        
    } catch (error) {
        console.error('❌ Error fetching players:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch players: ' + error.message 
        });
    }
});
// POST /api/players - Register new player
router.post('/', authenticateToken, async (req, res) => {
    try {
        const teamId = req.user.teamId;
        const {
            firstName,
            lastName,
            email,
            phone,
            ageConfirmed,
            gender,
            position,
            jerseyNumber,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;
        
        console.log('➕ Registering new player:', firstName, lastName, 'for team:', teamId);
        
        const db = req.app.get('db');
        
        // Generate confirmation number
        const confirmationNumber = `#REG-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const result = await db.query(
            `INSERT INTO players (
                team_id, first_name, last_name, email, phone, 
                age_confirmed, gender, position, jersey_number,
                emergency_contact_name, emergency_contact_phone,
                confirmation_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                teamId, firstName, lastName, email, phone,
                ageConfirmed, gender, position, jerseyNumber,
                emergencyContactName, emergencyContactPhone,
                confirmationNumber
            ]
        );
        
        const player = result.rows[0];
        console.log('✅ Player registered:', confirmationNumber);
        // Inside the POST / route, AFTER the player INSERT query and BEFORE res.json:

// Get team info
const teamResult = await db.query(
    'SELECT * FROM teams WHERE team_id = $1',
    [teamId]
);

const team = teamResult.rows[0];

// Send registration email
await sendConfirmationEmail({
    playerName: `${firstName} ${lastName}`,
    email: email,
    confirmationNumber: confirmationNumber,
    teamName: team.team_name,
    tournamentDate: 'Friday, July 11, 2026',
    tournamentTime: '2:00 PM'
});

console.log('✅ Player registered and email sent');
        res.json({
            success: true,
            player: {
                playerId: player.player_id,
                firstName: player.first_name,
                lastName: player.last_name,
                confirmationNumber: player.confirmation_number
            }
        });
        
    } catch (error) {
        console.error('❌ Error registering player:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed: ' + error.message 
        });
    }
});

// PUT /api/players/:playerId - Update player
router.put('/:playerId', authenticateToken, async (req, res) => {
    try {
        const { playerId } = req.params;
        const teamId = req.user.teamId;
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            jerseyNumber,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;
        
        console.log('✏️ Updating player:', playerId);
        
        const db = req.app.get('db');
        
        // Verify player belongs to this team
        const checkResult = await db.query(
            'SELECT * FROM players WHERE player_id = $1 AND team_id = $2',
            [playerId, teamId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({ 
                success: false, 
                error: 'Not authorized to edit this player' 
            });
        }
        
        const currentPlayer = checkResult.rows[0];
        
        // Check if email changed and if new email is already taken by another player
        if (email !== currentPlayer.email) {
            const emailCheck = await db.query(
                'SELECT * FROM players WHERE email = $1 AND player_id != $2',
                [email, playerId]
            );
            
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'This email is already registered to another player. Please use a different email.'
                });
            }
        }
        
        const result = await db.query(
            `UPDATE players SET 
                first_name = $1, last_name = $2, email = $3, phone = $4,
                position = $5, jersey_number = $6,
                emergency_contact_name = $7, emergency_contact_phone = $8
            WHERE player_id = $9 AND team_id = $10
            RETURNING *`,
            [
                firstName, lastName, email, phone,
                position, jerseyNumber,
                emergencyContactName, emergencyContactPhone,
                playerId, teamId
            ]
        );
        
        console.log('✅ Player updated');
        
        res.json({ success: true, player: result.rows[0] });
        
    } catch (error) {
        console.error('❌ Error updating player:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Update failed: ' + error.message 
        });
    }
});

// DELETE /api/players/:playerId - Delete player
router.delete('/:playerId', authenticateToken, async (req, res) => {
    try {
        const { playerId } = req.params;
        const teamId = req.user.teamId;
        
        console.log('🗑️ Deleting player:', playerId);
        
        const db = req.app.get('db');
        
        // Verify player belongs to this team
        const checkResult = await db.query(
            'SELECT * FROM players WHERE player_id = $1 AND team_id = $2',
            [playerId, teamId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({ 
                success: false, 
                error: 'Not authorized to delete this player' 
            });
        }
        
        await db.query(
            'DELETE FROM players WHERE player_id = $1 AND team_id = $2',
            [playerId, teamId]
        );
        
        console.log('✅ Player deleted');
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('❌ Error deleting player:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Delete failed: ' + error.message 
        });
    }
});

module.exports = router;