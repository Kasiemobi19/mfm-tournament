require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mfm_tournament',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});

async function addMissingColumns() {
    try {
        console.log('🔄 Adding missing columns...');
        
        // Add captain_email column if it doesn't exist
        await pool.query(`
            ALTER TABLE teams
            ADD COLUMN IF NOT EXISTS captain_email VARCHAR(255);
        `);
        console.log('✅ Added captain_email column');
        
        // Add captain_phone column if it doesn't exist
        await pool.query(`
            ALTER TABLE teams
            ADD COLUMN IF NOT EXISTS captain_phone VARCHAR(20);
        `);
        console.log('✅ Added captain_phone column');
        
        console.log('✅ All missing columns added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding columns:', error);
        process.exit(1);
    }
}

addMissingColumns();
