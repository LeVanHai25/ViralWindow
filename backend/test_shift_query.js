require('dotenv').config();
const jwt = require('jsonwebtoken');
const fs = require('fs');

async function test() {
    const token = jwt.sign({ id: 1, full_name: 'Test', role_name: 'Admin' }, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    try {
        const res = await fetch('http://localhost:3001/api/attendance/summary?month=3&year=2026', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        });
        const data = await res.json();
        fs.writeFileSync('error_dump.json', JSON.stringify(data, null, 2));
        console.log("Status:", res.status, "Dumped to error_dump.json");
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

test();
