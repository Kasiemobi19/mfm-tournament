#!/bin/bash

echo "=========================================="
echo "MFM Tournament System - Quick Setup"
echo "=========================================="

# Colors for output
GREEN='\033[0:32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "\n${GREEN}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi
echo "Node.js version: $(node --version)"

# Check PostgreSQL
echo -e "\n${GREEN}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Please install PostgreSQL 13+ first.${NC}"
    exit 1
fi
echo "PostgreSQL is installed"

# Install backend dependencies
echo -e "\n${GREEN}Installing backend dependencies...${NC}"
cd backend
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

# Setup environment file
echo -e "\n${GREEN}Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please edit it with your configuration.${NC}"
    echo -e "${RED}IMPORTANT: Update DB_PASSWORD, JWT_SECRET, and EMAIL settings in .env${NC}"
else
    echo ".env file already exists"
fi

# Database setup
echo -e "\n${GREEN}Would you like to setup the database now? (y/n)${NC}"
read -r setup_db

if [ "$setup_db" = "y" ]; then
    echo "Please enter PostgreSQL password:"
    read -s db_password
    
    echo -e "\n${GREEN}Creating database...${NC}"
    PGPASSWORD=$db_password psql -U postgres -c "CREATE DATABASE mfm_tournament;" 2>/dev/null
    
    echo -e "${GREEN}Running schema...${NC}"
    PGPASSWORD=$db_password psql -U postgres -d mfm_tournament -f ../database/schema.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database setup complete!${NC}"
    else
        echo -e "${RED}Database setup failed. Please run manually.${NC}"
    fi
fi

# Generate JWT secret
echo -e "\n${GREEN}Generating JWT secret...${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "Generated JWT Secret (add to .env): $JWT_SECRET"

echo -e "\n${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Update database password and email settings"
echo "3. Run: cd backend && npm run dev"
echo "4. In another terminal: cd frontend && python3 -m http.server 8080"
echo "5. Access: http://localhost:8080"
echo ""
echo "Default captain login: mfm2026"
echo ""

cd ..
