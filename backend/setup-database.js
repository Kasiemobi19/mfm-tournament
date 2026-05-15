require('dotenv').config();
const { Pool } = require('pg');

// Database connection using your Render credentials
const pool = new Pool({
    connectionString: 'postgresql://tournament_admin:ROxj0N4ANXqDxGMJjjX6FJhE978RuDKD@dpg-d83lgrfavr4c7385f000-a.oregon-postgres.render.com/mfm_tournament_u137',
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔗 Connected to database!');
        
        // Create teams table
        console.log('📊 Creating teams table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS teams (
                team_id SERIAL PRIMARY KEY,
                team_code VARCHAR(20) UNIQUE NOT NULL,
                team_name VARCHAR(100) NOT NULL,
                branch_name VARCHAR(100) NOT NULL,
                captain_name VARCHAR(100) NOT NULL,
                pastor_name VARCHAR(100) NOT NULL,
                password_hash TEXT NOT NULL,
                primary_jersey_color VARCHAR(50),
                primary_jersey_hex VARCHAR(7),
                secondary_jersey_color VARCHAR(50) DEFAULT 'White',
                secondary_jersey_hex VARCHAR(7) DEFAULT '#FFFFFF'
            );
        `);
        
        // Create players table
        console.log('📊 Creating players table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS players (
                player_id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(team_id),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                age_confirmed BOOLEAN NOT NULL,
                gender VARCHAR(10) NOT NULL,
                position VARCHAR(50),
                jersey_number INTEGER,
                emergency_contact_name VARCHAR(100),
                emergency_contact_phone VARCHAR(20),
                confirmation_number VARCHAR(50) UNIQUE
            );
        `);
        
        // Create volunteers table
        console.log('📊 Creating volunteers table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS volunteers (
                volunteer_id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                branch VARCHAR(100) NOT NULL,
                roles TEXT[] NOT NULL,
                experience TEXT,
                confirmation_number VARCHAR(50) UNIQUE,
                status VARCHAR(20) DEFAULT 'pending'
            );
        `);
        
        // Insert sample team
        console.log('👥 Inserting sample team...');
        await client.query(`
            INSERT INTO teams (team_code, team_name, branch_name, captain_name, pastor_name, password_hash, primary_jersey_hex)
            VALUES ('TORONTO1', 'Toronto - Team 1', 'Toronto Regional Head Quarters', 'Kasie Maduabunachukwu', 'Pastor Gbenga Agbode', '$2b$10$xVGZqN5YmH0F8vKN8iZxHe.kZx5mTKxO8FsHtPKYW9KqGxQYqJZJO', '#800080')
            ON CONFLICT (team_code) DO NOTHING;
        `);
        
        console.log('✅ Database setup complete!');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();