const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Create demo config script logic for user
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

if (!envContent.includes('REDIS_URL')) {
    envContent += '\n# UPSTASH REDIS CLOUD FOR AI CACHE\n';
    envContent += 'REDIS_URL=rediss://default:Ab3LAAIjcDE3MTUyYjdkMDg1NTc0NzAxYWE3MDI1ZDgxZmI0MTUzYXAxMA@settled-collie-48459.upstash.io:6379\n';
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Added UPSTASH REDIS_URL to .env');
} else {
    console.log('⚡ REDIS_URL already exists in .env');
}
