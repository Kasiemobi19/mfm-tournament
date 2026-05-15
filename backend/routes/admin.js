const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Simple admin authentication (hardcoded for now)
const ADMIN_PASSWORD = 'mfm_admin_2026'; // Change this!

// Middleware to check admin password
const checkAdminAuth = (req, res, next) => {
    const adminPass = req.headers['x-admin-password'];
    
    if (adminPass !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized - Invalid admin password' });
    }
    
    next();
};

// Get all teams (admin view with passwords)
router.get('/teams', checkAdminAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                team_id,
                team_code,
                team_name,
                branch_name,
                captain_name,
                captain_email,
                captain_phone,
                pastor_name,
                primary_jersey_color,
                primary_jersey_hex,
                created_at
            FROM teams
            ORDER BY team_name
        `);
        
        res.json({
            success: true,
            teams: result.rows
        });
    } catch (error) {
        console.error('Admin get teams error:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Create new team
router.post('/teams/create',
    checkAdminAuth,
    [
        body('teamCode').notEmpty().withMessage('Team code is required')
            .isLength({ min: 3, max: 50 }).withMessage('Team code must be 3-50 characters')
            .matches(/^[A-Z0-9]+$/).withMessage('Team code must be uppercase letters/numbers only'),
        body('teamName').notEmpty().withMessage('Team name is required'),
        body('branchName').notEmpty().withMessage('Branch name is required'),
        body('captainName').notEmpty().withMessage('Captain name is required'),
        body('captainEmail').isEmail().withMessage('Valid captain email is required'),
        body('captainPhone').notEmpty().withMessage('Captain phone is required'),
        body('pastorName').notEmpty().withMessage('Pastor name is required'),
        body('primaryJerseyColor').optional(),
        body('primaryJerseyHex').optional()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const {
                teamCode,
                teamName,
                branchName,
                captainName,
                captainEmail,
                captainPhone,
                pastorName,
                primaryJerseyColor = 'Blue',
                primaryJerseyHex = '#0000ff'
            } = req.body;
            
            // Check if team code already exists
            const checkCode = await db.query(
                'SELECT team_id FROM teams WHERE team_code = $1',
                [teamCode]
            );
            
            if (checkCode.rows.length > 0) {
                return res.status(400).json({ error: 'Team code already exists' });
            }
            
            // Check if email already exists
            const checkEmail = await db.query(
                'SELECT team_id FROM teams WHERE captain_email = $1',
                [captainEmail]
            );
            
            if (checkEmail.rows.length > 0) {
                return res.status(400).json({ error: 'Captain email already exists' });
            }
            // Use custom password or generate random one
     const randomPassword = req.body.customPassword ||(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8));
            
            // Hash the password
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            
            // Insert team
            const result = await db.query(
                `INSERT INTO teams (
                    team_code, team_name, branch_name, captain_name, captain_email,
                    captain_phone, pastor_name, primary_jersey_color, primary_jersey_hex,
                    password_hash
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING team_id, team_code, team_name, captain_email`,
                [
                    teamCode, teamName, branchName, captainName, captainEmail,
                    captainPhone, pastorName, primaryJerseyColor, primaryJerseyHex,
                    passwordHash
                ]
            );
            
            res.status(201).json({
                success: true,
                team: result.rows[0],
                temporaryPassword: randomPassword,
                message: 'Team created successfully! Save this password - it cannot be retrieved later.'
            });
        } catch (error) {
            console.error('Admin create team error:', error);
            res.status(500).json({ error: 'Failed to create team' });
        }
    }
);

// Reset team password
router.post('/teams/:teamCode/reset-password',
    checkAdminAuth,
    async (req, res) => {
        try {
            const { teamCode } = req.params;
            
            // Check if team exists
            const teamCheck = await db.query(
                'SELECT team_id FROM teams WHERE team_code = $1',
                [teamCode]
            );
            
            if (teamCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }
            
            // Generate new random password
            const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            
            // Hash it
            const passwordHash = await bcrypt.hash(newPassword, 10);
            
            // Update password
            await db.query(
                'UPDATE teams SET password_hash = $1 WHERE team_code = $2',
                [passwordHash, teamCode]
            );
            
            res.json({
                success: true,
                teamCode,
                newPassword,
                message: 'Password reset successfully! Save this password - it cannot be retrieved later.'
            });
        } catch (error) {
            console.error('Admin reset password error:', error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    }
);

// Delete team
router.delete('/teams/:teamCode',
    checkAdminAuth,
    async (req, res) => {
        try {
            const { teamCode } = req.params;
            
            const result = await db.query(
                'DELETE FROM teams WHERE team_code = $1 RETURNING team_name',
                [teamCode]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }
            
            res.json({
                success: true,
                message: `Team ${result.rows[0].team_name} deleted successfully`
            });
        } catch (error) {
            console.error('Admin delete team error:', error);
            res.status(500).json({ error: 'Failed to delete team' });
        }
    }
);

module.exports = router;