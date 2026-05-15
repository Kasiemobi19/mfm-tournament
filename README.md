# MFM Region 1 Soccer Tournament Registration System

Full-stack application for managing team registrations, player rosters, and volunteer sign-ups for the MFM Region 1 Soccer Tournament.

## 📋 **Table of Contents**
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## ✨ **Features**

### For Team Captains:
- Secure login with JWT authentication
- Register up to 12 players per team (men's tournament)
- Register women players for opening match
- View and manage team roster
- Update team settings (jersey colors, pastor info)
- Real-time registration confirmations

### For Volunteers:
- Self-service registration
- Multiple role selection (Media/Logistics, Medical, Welfare, Referee)
- Availability scheduling

### Public Features:
- View all registered teams
- View detailed team rosters
- Tournament information display

## 🛠️ **Technology Stack**

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- JWT authentication
- Bcrypt password hashing
- Nodemailer for emails

**Frontend:**
- Vanilla JavaScript
- HTML5/CSS3
- Fetch API for backend communication

## 📦 **Prerequisites**

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager
- SMTP email service (Gmail, SendGrid, etc.)

## 🚀 **Installation**

### 1. Clone or extract the project
```bash
cd mfm-tournament
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mfm_tournament
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3000
JWT_SECRET=generate_a_random_secret_key_here

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 🗄️ **Database Setup**

### 1. Create database
```bash
psql -U postgres
CREATE DATABASE mfm_tournament;
\q
```

### 2. Run schema
```bash
psql -U postgres -d mfm_tournament -f ../database/schema.sql
```

### 3. Create initial team accounts
```sql
-- Default password for all teams: "mfm2026"
-- Teams should change this after first login

INSERT INTO teams (team_code, team_name, branch_name, captain_name, captain_email, captain_phone, pastor_name, primary_jersey_color, primary_jersey_hex, password_hash) VALUES
('TORONTO1', 'Toronto - Team 1', 'Toronto (North)', 'Pastor Samuel Adeyemi', 'captain.toronto1@mfm.org', '(416) 555-0001', 'Pastor David Okonkwo', 'Red', '#dc143c', '$2b$10$K7hFqZ1XnXjNvC5W8F.3g.RYdOz0Fv3rJhH6kF8vNxT5YZ0W8vN5e');

-- Repeat for other teams...
-- Password hash for "mfm2026" shown above
```

## ⚙️ **Configuration**

### Email Setup (Gmail Example)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

### JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🏃 **Running the Application**

### Development Mode
```bash
# Backend
cd backend
npm run dev

# Frontend (simple HTTP server)
cd frontend
python3 -m http.server 8080
# Or use: npx http-server -p 8080
```

### Production Mode
```bash
cd backend
npm start
```

Access the application:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## 📚 **API Documentation**

### Authentication Endpoints

#### POST /api/auth/login
Login as team captain
```json
Request:
{
  "teamCode": "TORONTO1",
  "password": "mfm2026"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "team": { ... }
}
```

### Player Endpoints (Requires Authentication)

#### POST /api/players/register
Register a new player
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "(416) 555-1234",
  "ageConfirmed": true,
  "gender": "male",
  "position": "Forward",
  "jerseyNumber": 10
}
```

#### GET /api/players
Get all players for authenticated team

#### PUT /api/players/:playerId
Update player information

#### DELETE /api/players/:playerId
Remove player from roster

### Team Endpoints

#### GET /api/teams
Get all teams (public)

#### GET /api/teams/:teamCode
Get team roster (public)

#### PUT /api/teams/settings
Update team settings (requires auth)

### Volunteer Endpoints

#### POST /api/volunteers/register
Register as volunteer

#### GET /api/volunteers
Get all volunteers

## 🌐 **Deployment**

### Option 1: Heroku
```bash
# Install Heroku CLI
# Login and create app
heroku create mfm-tournament

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_USER=your_email

# Deploy
git push heroku main
```

### Option 2: DigitalOcean / AWS / Azure
1. Set up a Linux server (Ubuntu recommended)
2. Install Node.js and PostgreSQL
3. Clone/upload project files
4. Set up environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name mfm-tournament
pm2 save
pm2 startup
```

### Option 3: Vercel (Frontend) + Railway (Backend)
- Deploy frontend to Vercel
- Deploy backend + database to Railway
- Update CORS settings

## 🔒 **Security Notes**

- Change default password ("mfm2026") immediately after deployment
- Use HTTPS in production
- Keep JWT_SECRET secure and random
- Regularly update dependencies
- Implement rate limiting in production
- Use environment variables for all sensitive data

## 📧 **Support**

For issues or questions, contact: tournament@mfmontario.org

## 📄 **License**

Copyright © 2026 MFM Region 1, Ontario. All rights reserved.
