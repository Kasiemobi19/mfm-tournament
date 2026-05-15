-- MFM Region 1 Tournament Database Schema
-- PostgreSQL

-- Teams/Branches Table
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_code VARCHAR(50) UNIQUE NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    captain_name VARCHAR(100) NOT NULL,
    captain_email VARCHAR(100) UNIQUE NOT NULL,
    captain_phone VARCHAR(20) NOT NULL,
    pastor_name VARCHAR(100) NOT NULL,
    primary_jersey_color VARCHAR(50) NOT NULL,
    primary_jersey_hex VARCHAR(7) NOT NULL,
    secondary_jersey_color VARCHAR(50) DEFAULT 'White',
    secondary_jersey_hex VARCHAR(7) DEFAULT '#FFFFFF',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    age_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    position VARCHAR(50),
    jersey_number INTEGER,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    confirmation_number VARCHAR(50) UNIQUE NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteers Table
CREATE TABLE volunteers (
    volunteer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    branch VARCHAR(100),
    roles TEXT[] NOT NULL,
    experience TEXT,
    available_setup BOOLEAN DEFAULT FALSE,
    available_tournament BOOLEAN DEFAULT FALSE,
    available_cleanup BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_confirmation ON players(confirmation_number);
CREATE INDEX idx_teams_email ON teams(captain_email);
CREATE INDEX idx_teams_code ON teams(team_code);
CREATE INDEX idx_volunteers_email ON volunteers(email);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
