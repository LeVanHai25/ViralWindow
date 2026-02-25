// Force clear Node.js require cache và restart backend
const fs = require('fs');
const { exec } = require('child_process');

console.log('\n=== FORCE CLEAR CACHE & RESTART ===\n');

// Step 1: Kill all Node processes
console.log('[1/3] Killing all Node.js processes...');
exec('taskkill /F /IM node.exe', (err) => {
    if (err && !err.message.includes('not found')) {
        console.log('⚠️  Error killing processes:', err.message);
    } else {
        console.log('✅ All Node processes killed');
    }

    setTimeout(() => {
        // Step 2: Clear npm cache (optional but helps)
        console.log('\n[2/3] Clearing npm cache...'

        );
        exec('npm cache clean --force', { cwd: __dirname }, (err2) => {
            if (err2) {
                console.log('⚠️  Cache clean failed (OK to continue)');
            } else {
                console.log('✅ Cache cleared');
            }

            setTimeout(() => {
                // Step 3: Start server
                console.log('\n[3/3] Starting backend server...');
                console.log('Running: npm start');
                console.log('\n⏳ Opening new terminal window...\n');

                const startCmd = 'start cmd /k "cd /d ' + __dirname + ' && npm start"';
                exec(startCmd, (err3) => {
                    if (err3) {
                        console.error('❌ Failed to start:', err3.message);
                    } else {
                        console.log('✅ Server starting in new window!');
                        console.log('\n📝 Next steps:');
                        console.log('1. Wait for server log: "🔥 API Server đang chạy..."');
                        console.log('2. Test API again: node test-api-direct.js');
                        console.log('3. Check for logs: 🔍 [GET /auth/me] User ID: ...');
                    }

                    setTimeout(() => process.exit(0), 2000);
                });
            }, 2000);
        });
    }, 2000);
});
