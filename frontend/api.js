const API = {
    baseURL: 'https://mfm-tournament-api.onrender.com/api',
    teamData: null,

// ========================================
// AUTHENTICATION
// ========================================

async loginCaptain(teamCode, password) {
    const response = await fetch(`${this.baseURL}/teams/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamCode, password })
    });
    
    if (!response.ok) {
        throw new Error('Login failed');
    }
    
    const data = await response.json();
    
    if (data.success) {
        localStorage.setItem('mfm_token', data.token);
        this.teamData = data.team;
        localStorage.setItem('mfm_team_data', JSON.stringify(data.team));
    }
    
    return data;
},

getStoredTeamData() {
    if (this.teamData) return this.teamData;
    
    const stored = localStorage.getItem('mfm_team_data');
    if (stored) {
        this.teamData = JSON.parse(stored);
        return this.teamData;
    }
    
    return null;
},

logoutCaptain() {
    localStorage.removeItem('mfm_token');
    localStorage.removeItem('mfm_team_data');
    this.teamData = null;
},

// ========================================
// PLAYER MANAGEMENT
// ========================================

async getTeamPlayers(gender) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/players?gender=${gender}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch players');
    }
    
    return await response.json();
},

async registerPlayer(playerData) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(playerData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }
    
    return await response.json();
},

async updatePlayer(playerId, playerData) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/players/${playerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(playerData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
    }
    
    return await response.json();
},

async deletePlayer(playerId) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/players/${playerId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
    }
    
    return await response.json();
},

// ========================================
// TEAM MANAGEMENT
// ========================================

async getTeamRoster(teamCode) {
    const response = await fetch(`${this.baseURL}/teams/${teamCode}/roster`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch roster');
    }
    
    return await response.json();
},

async updateTeamSettings(settingsData) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/teams/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
    }
    
    return await response.json();
},

// ========================================
// VOLUNTEER MANAGEMENT
// ========================================

async getVolunteers() {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/volunteers`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
    }
    
    return await response.json();
},

async confirmVolunteer(volunteerId) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/volunteers/${volunteerId}/confirm`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to confirm volunteer');
    }
    
    return await response.json();
},

async removeVolunteer(volunteerId) {
    const token = localStorage.getItem('mfm_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseURL}/volunteers/${volunteerId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to remove volunteer');
    }
    
    return await response.json();
}
};

console.log('✅ API module loaded successfully');