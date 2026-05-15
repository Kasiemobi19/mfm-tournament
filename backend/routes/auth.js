const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Captain login
router.post('/login',
    [
        body('teamCode').notEmpty(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const { teamCode, password } = req.body;
            
            console.log('🔐 LOGIN ATTEMPT:', teamCode);
            
            const result = await db.query(
                'SELECT * FROM teams WHERE team_code = $1',
                [teamCode]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const team = result.rows[0];
            
            const passwordMatch = await bcrypt.compare(password, team.password_hash);
            
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const token = jwt.sign(
                {
                    teamId: team.team_id,
                    teamCode: team.team_code,
                    teamName: team.team_name,
                    branchName: team.branch_name,
                    captainName: team.captain_name,
                    pastorName: team.pastor_name,
                    primaryJerseyHex: team.primary_jersey_hex
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            console.log('✅ LOGIN SUCCESSFUL');
            
            res.json({
                success: true,
                token,
                team: {
                    teamId: team.team_id,
                    teamCode: team.team_code,
                    teamName: team.team_name,
                    branchName: team.branch_name,
                    captainName: team.captain_name,
                    captainEmail: team.captain_email,
                    pastorName: team.pastor_name,
                    primaryJerseyColor: team.primary_jersey_color,
                    primaryJerseyHex: team.primary_jersey_hex
                }
            });
        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

module.exports = router;