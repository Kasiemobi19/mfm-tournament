const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'mfm-tournament-secret-key-2026';

// POST /api/teams/login
router.post('/login', async (req, res) => {
    try {
        const { teamCode, password } = req.body;
        console.log('🔐 Login attempt:', teamCode);
        
        const db = req.app.get('db');
        
        // Get team from database
        const result = await db.query(
            'SELECT * FROM teams WHERE team_code = $1',
            [teamCode]
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Team not found:', teamCode);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid team code or password' 
            });
        }
        
        const team = result.rows[0];
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, team.password_hash);
        
        if (!passwordMatch) {
            console.log('❌ Invalid password for team:', teamCode);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid team code or password' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { teamId: team.team_id, teamCode: team.team_code },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('✅ Login successful:', teamCode);
        
        res.json({
            success: true,
            token: token,
            team: {
                teamId: team.team_id,
                teamCode: team.team_code,
                teamName: team.team_name,
                branchName: team.branch_name,
                captainName: team.captain_name,
                pastorName: team.pastor_name,
                primaryJerseyColor: team.primary_jersey_color,
                primaryJerseyHex: team.primary_jersey_hex
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed: ' + error.message 
        });
    }
});


// GET team roster (public view)
router.get('/:teamCode/roster', async (req, res) => {
    try {
        const { teamCode } = req.params;
        const db = req.app.get('db');
        
        console.log('📋 Getting roster for team:', teamCode);
        
        // Get team info
        const teamResult = await db.query(
            'SELECT * FROM teams WHERE UPPER(team_code) = UPPER($1)',
            [teamCode]
        );
        
        if (teamResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Team not found' });
        }
        
        const team = teamResult.rows[0];
        console.log('✅ Team found:', team.team_name);
        
        // Get men players - Convert snake_case to camelCase
        const menPlayersRaw = await db.query(
            'SELECT * FROM players WHERE team_id = $1 AND gender = $2 ORDER BY player_id',
            [team.team_id, 'male']
        );
        
        // Convert snake_case to camelCase
        const menPlayers = menPlayersRaw.rows.map(player => ({
            playerId: player.player_id,
            firstName: player.first_name,
            lastName: player.last_name,
            email: player.email,
            phone: player.phone,
            position: player.position,
            jerseyNumber: player.jersey_number,
            confirmationNumber: player.confirmation_number
        }));
        
        // Get women players - Convert snake_case to camelCase
        const womenPlayersRaw = await db.query(
            'SELECT * FROM players WHERE team_id = $1 AND gender = $2 ORDER BY player_id',
            [team.team_id, 'female']
        );
        
        const womenPlayers = womenPlayersRaw.rows.map(player => ({
            playerId: player.player_id,
            firstName: player.first_name,
            lastName: player.last_name,
            email: player.email,
            phone: player.phone,
            position: player.position,
            jerseyNumber: player.jersey_number,
            confirmationNumber: player.confirmation_number
        }));
        
        console.log('✅ Found players - Men:', menPlayers.length, 'Women:', womenPlayers.length);
        
        res.json({
            success: true,
            team: {
                teamName: team.team_name,
                branchName: team.branch_name,
                captainName: team.captain_name,
                pastorName: team.pastor_name,
                primaryJerseyHex: team.primary_jersey_hex,
                menPlayers: menPlayers,
                womenPlayers: womenPlayers
            }
        });
    } catch (error) {
        console.error('❌ Get roster error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /api/teams/settings - Update team settings
router.put('/settings', async (req, res) => {
    try {
        const { captainName, pastorName, primaryJerseyHex } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = req.app.get('db');
        
        console.log('💾 Updating team settings for team:', decoded.teamId);
        
        // Update team
        await db.query(
            'UPDATE teams SET captain_name = $1, pastor_name = $2, primary_jersey_hex = $3 WHERE team_id = $4',
            [captainName, pastorName, primaryJerseyHex, decoded.teamId]
        );
        
        console.log('✅ Team settings updated');
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('❌ Update settings error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET all teams (public view)
router.get('/all', async (req, res) => {
    try {
        const db = req.app.get('db');
        
        // Get all teams with player counts
        const result = await db.query(`
            SELECT 
                t.*,
                COUNT(p.player_id) as player_count
            FROM teams t
            LEFT JOIN players p ON t.team_id = p.team_id
            GROUP BY t.team_id
            ORDER BY t.team_name
        `);
        
        const teams = result.rows.map(team => ({
            teamCode: team.team_code,
            teamName: team.team_name,
            branchName: team.branch_name,
            primaryJerseyHex: team.primary_jersey_hex,
            playerCount: parseInt(team.player_count)
        }));
        
        res.json({ success: true, teams });
    } catch (error) {
        console.error('❌ Get all teams error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;