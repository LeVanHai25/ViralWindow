const https = require('https');

const BASE = 'https://viralwindow.onrender.com/api';

function request(path, method='GET', body=null, token=null) {
    return new Promise((resolve) => {
        const url = new URL(BASE + path);
        const opts = {
            hostname: url.hostname, port: 443, path: url.pathname + url.search,
            method, headers: {'Content-Type':'application/json'}
        };
        if (token) opts.headers['Authorization'] = 'Bearer ' + token;
        if (body) opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        const req = https.request(opts, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch(e) { resolve({ status: res.statusCode, body: data.substring(0,100) }); }
            });
        });
        req.on('error', e => resolve({ status: 0, error: e.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function status(label, res, dataKey) {
    if (res.error) { console.log(`  ❌ ${label}: ${res.error}`); return; }
    const ok = res.body?.success || res.status === 200;
    const count = dataKey && res.body?.[dataKey] ? (Array.isArray(res.body[dataKey]) ? res.body[dataKey].length : '✓') : '';
    const info = count ? ` (${count} items)` : '';
    console.log(`  ${ok ? '✅' : '❌'} ${label}: HTTP ${res.status}${info}${!ok ? ' — ' + (res.body?.message || JSON.stringify(res.body).substring(0,60)) : ''}`);
    return ok;
}

async function main() {
    console.log('\n🔍 PRODUCTION API HEALTH CHECK\n' + '='.repeat(50));
    console.log('🌐 ' + BASE + '\n');

    // 1. LOGIN
    const login = await request('/auth/login', 'POST', {email:'hai2504le@gmail.com', password:'abc123'});
    status('LOGIN', login);
    const token = login.body?.data?.token;
    if (!token) { console.log('\n❌ Không có token, dừng kiểm tra.\n'); return; }
    console.log('  🔑 Token: OK\n');

    // 2. CORE MODULES
    console.log('📋 CORE MODULES:');
    const proj = await request('/projects', 'GET', null, token);
    status('Projects', proj, 'data');

    const custs = await request('/customers', 'GET', null, token);
    status('Customers', custs, 'data');

    const quots = await request('/quotations', 'GET', null, token);
    status('Quotations', quots, 'data');

    const fin = await request('/financial/transactions', 'GET', null, token);
    status('Financial', fin, 'data');

    // 3. CHAT (was crashing)
    console.log('\n💬 CHAT MODULE (was broken):');
    const chat = await request('/chat/conversations', 'GET', null, token);
    status('Chat Conversations', chat, 'data');

    // 4. PURCHASE REQUESTS (was crashing)
    console.log('\n🛒 PURCHASE REQUESTS (was broken):');
    const pr = await request('/purchase-requests', 'GET', null, token);
    status('Purchase Requests', pr, 'data');

    const prCount = await request('/purchase-requests/pending-count', 'GET', null, token);
    status('Pending Count', prCount);

    // 5. WAREHOUSE
    console.log('\n🏭 WAREHOUSE & PRODUCTION:');
    const stock = await request('/stock-documents', 'GET', null, token);
    status('Stock Documents', stock, 'data');

    const mfg = await request('/production/orders', 'GET', null, token);
    status('Production Orders', mfg, 'data');

    // 6. DASHBOARD
    console.log('\n📊 DASHBOARD:');
    const dash = await request('/dashboard/summary', 'GET', null, token);
    status('Dashboard Summary', dash);

    // 7. USERS
    console.log('\n👥 USERS:');
    const users = await request('/users', 'GET', null, token);
    status('Users List', users, 'data');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Kiểm tra hoàn tất!\n');
}

main().catch(e => { console.error('FATAL:', e.message); });
