const { sendVolunteerRegistrationEmail } = require('../utils/email');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mfm-tournament-secret-key-2026';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// POST /api/volunteers/register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, branch, roles, experience,
                availableSetup, availableTournament, availableCleanup } = req.body;
        const db = req.app.get('db');
        
        // Check if email already exists
        const existingVolunteer = await db.query(
            'SELECT * FROM volunteers WHERE email = $1',
            [email]
        );
        
        if (existingVolunteer.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'This email is already registered. Please use a different email address.' 
            });
        }
        
        const confirmationNumber = 'VOL-' + Date.now();
        
        const result = await db.query(
            `INSERT INTO volunteers (first_name, last_name, email, phone, branch, roles, 
             experience, confirmation_number, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *`,
            [firstName, lastName, email, phone, branch, roles, experience || '', confirmationNumber]
        );

        // Send confirmation email
        await sendVolunteerRegistrationEmail({
            firstName,
            lastName,
            email,
            phone,
            branch,
            roles: Array.isArray(roles) ? roles : [roles],
            confirmationNumber,
            tournamentDate: 'Friday, July 11, 2026',
            tournamentTime: '2:00 PM'
        });
        
        console.log('✅ Volunteer registered and email sent');
        
        res.json({ success: true, confirmationNumber });
    } catch (error) {
        console.error('❌ Volunteer registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/volunteers - Get volunteers by branch (requires authentication)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = req.app.get('db');
        
        // Get team info to determine branch
        const teamResult = await db.query(
            'SELECT branch_name FROM teams WHERE team_id = $1',
            [req.user.teamId]
        );
        
        if (teamResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Team not found' });
        }
        
        const branchName = teamResult.rows[0].branch_name;
        
        // Extract base branch name (e.g., "Toronto" from "Toronto Regional Head Quarters")
        let baseBranch = branchName.split(' ')[0].toLowerCase();
        
        console.log('📋 Fetching volunteers for branch:', baseBranch);
        
        // Get all volunteers from this branch
        const result = await db.query(
            `SELECT * FROM volunteers 
             WHERE LOWER(branch) LIKE $1 
             ORDER BY registered_at DESC`,
            [`%${baseBranch}%`]
        );
        
        console.log('✅ Found', result.rows.length, 'volunteers');
        
        const volunteers = result.rows.map(v => ({
            volunteerId: v.volunteer_id,
            firstName: v.first_name,
            lastName: v.last_name,
            email: v.email,
            phone: v.phone,
            branch: v.branch,
            roles: v.roles,
            experience: v.experience,
            availableSetup: v.available_setup,
            availableTournament: v.available_tournament,
            availableCleanup: v.available_cleanup,
            confirmationNumber: v.confirmation_number,
            status: v.status,
            registeredAt: v.registered_at
        }));
        
        res.json({ success: true, volunteers });
        
    } catch (error) {
        console.error('❌ Error fetching volunteers:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch volunteers: ' + error.message 
        });
    }
});

// PUT /api/volunteers/:volunteerId/confirm
router.put('/:volunteerId/confirm', authenticateToken, async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const db = req.app.get('db');
        
        // Update status
        const result = await db.query(
            'UPDATE volunteers SET status = $1 WHERE volunteer_id = $2 RETURNING *',
            ['confirmed', volunteerId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Volunteer not found' });
        }
        
        const volunteer = result.rows[0];
        
        // Send confirmation email
        await sendVolunteerRegistrationEmail({
            firstName: volunteer.first_name,
            lastName: volunteer.last_name,
            email: volunteer.email,
            phone: volunteer.phone,
            branch: volunteer.branch,
            roles: Array.isArray(volunteer.roles) ? volunteer.roles : [volunteer.roles],
            confirmationNumber: volunteer.confirmation_number,
            tournamentDate: 'Friday, July 11, 2026',
            tournamentTime: '1:00 PM'
        });
        
        console.log('✅ Volunteer confirmed and email sent');
        
        res.json({ success: true, message: 'Volunteer confirmed and email sent' });
    } catch (error) {
        console.error('❌ Confirm error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/volunteers/:volunteerId - Remove volunteer
router.delete('/:volunteerId', authenticateToken, async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const db = req.app.get('db');
        
        console.log('🗑️ Removing volunteer:', volunteerId);
        
        const result = await db.query(
            'DELETE FROM volunteers WHERE volunteer_id = $1 RETURNING *',
            [volunteerId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Volunteer not found' });
        }
        
        res.json({ success: true, message: 'Volunteer removed successfully' });
        
    } catch (error) {
        console.error('❌ Error removing volunteer:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to remove volunteer: ' + error.message 
        });
    }
});

module.exports = router;
