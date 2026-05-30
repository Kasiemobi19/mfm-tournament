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

async function addAllMissingColumns() {
    try {
        console.log('🔄 Adding all missing columns to teams table...\n');
        
        const columns = [
            { name: 'captain_email', type: 'VARCHAR(255)' },
            { name: 'captain_phone', type: 'VARCHAR(20)' },
            { name: 'pastor_name', type: 'VARCHAR(255)' },
            { name: 'primary_jersey_color', type: 'VARCHAR(50)', default: 'Blue' },
            { name: 'primary_jersey_hex', type: 'VARCHAR(7)', default: '#0000ff' },
            { name: 'secondary_jersey_color', type: 'VARCHAR(50)' },
            { name: 'secondary_jersey_hex', type: 'VARCHAR(7)' },
            { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
            { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
        ];
        
        for (const col of columns) {
            try {
                const defaultClause = col.default ? ` DEFAULT ${col.default}` : '';
                await pool.query(`
                    ALTER TABLE teams
                    ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${defaultClause};
                `);
                console.log(`✅ Added ${col.name} column`);
            } catch (error) {
                console.log(`⚠️ ${col.name} already exists or error: ${error.message.split('\n')[0]}`);
            }
        }
        
        console.log('\n✅ All database columns updated successfully!');
        console.log('🎉 Database migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error.message);
        process.exit(1);
    }
}

addAllMissingColumns();
