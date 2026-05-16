/**
 * AUTO SYNC DAEMON — Local XAMPP → TiDB Cloud
 * Tự động đồng bộ mỗi 30 phút
 * 
 * Chạy nền: node backend/auto_sync_tidb.js
 * Dừng: Ctrl+C
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const SYNC_INTERVAL_MINUTES = 30; // Đổi số này để thay đổi tần suất

const LOCAL = {
    host: 'localhost', port: 3306, user: 'root', password: '',
    database: 'viral_window_db', charset: 'utf8mb4', connectTimeout: 10000
};
const TIDB = {
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000, user: '3LmszoG1PiqurSq.root', password: 'Lym4NIfWcVyhJt2V',
    database: 'viral_window_db',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectTimeout: 60000
};

const SKIP_TABLES = new Set([
    'user_sessions', 'login_history', 'activity_logs', 'audit_logs',
    'notifications', 'password_resets', 'project_activity_logs',
    'user_presence', 'event_types'
]);

const LOG_FILE = path.join(__dirname, 'auto_sync.log');

function log(msg) {
    const ts = new Date().toLocaleString('vi-VN');
    const line = `[${ts}] ${msg}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

async function patchCols(tidb, local, table) {
    try {
        const [lc] = await local.query(`DESCRIBE \`${table}\``);
        const [tc] = await tidb.query(`DESCRIBE \`${table}\``);
        const existing = new Set(tc.map(c => c.Field));
        for (const col of lc) {
            if (!existing.has(col.Field)) {
                try { await tidb.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col.Field}\` ${col.Type} DEFAULT NULL`); }
                catch(e) {}
            }
        }
    } catch(e) {}
}

async function syncTable(local, tidb, tableName) {
    const [rows] = await local.query(`SELECT * FROM \`${tableName}\``);
    if (rows.length === 0) return 0;
    await patchCols(tidb, local, tableName);
    await tidb.query(`TRUNCATE TABLE \`${tableName}\``);
    const batch = 100;
    for (let i = 0; i < rows.length; i += batch) {
        const slice = rows.slice(i, i + batch);
        const cols = Object.keys(slice[0]).map(c => `\`${c}\``).join(',');
        const ph = slice.map(() => `(${Object.keys(slice[0]).map(() => '?').join(',')})`).join(',');
        const vals = slice.flatMap(r => Object.values(r));
        await tidb.query(`INSERT INTO \`${tableName}\` (${cols}) VALUES ${ph}`, vals);
    }
    return rows.length;
}

async function runSync() {
    let local, tidb;
    try {
        local = await mysql.createConnection(LOCAL);
        tidb  = await mysql.createConnection(TIDB);
    } catch(e) {
        log(`❌ Kết nối thất bại: ${e.message}`);
        return { ok: 0, fail: 0, error: e.message };
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS=0');
    await tidb.query("SET SESSION sql_mode=''");
    await local.query('SET NAMES utf8mb4');

    const [tables] = await local.query(`
        SELECT TABLE_NAME FROM information_schema.TABLES
        WHERE TABLE_SCHEMA='viral_window_db' AND TABLE_TYPE='BASE TABLE'
    `);

    let ok = 0, fail = 0, skip = 0;
    for (const { TABLE_NAME: t } of tables) {
        if (SKIP_TABLES.has(t)) { skip++; continue; }
        try {
            const count = await syncTable(local, tidb, t);
            ok++;
        } catch(e) {
            fail++;
        }
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS=1');
    await local.end().catch(() => {});
    await tidb.end().catch(() => {});
    return { ok, fail, skip, total: tables.length };
}

// ─── Main Loop ────────────────────────────────────────────────
async function main() {
    console.clear();
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   AUTO SYNC: Local XAMPP → TiDB Production  ║');
    console.log(`║   Tần suất: mỗi ${SYNC_INTERVAL_MINUTES} phút                    ║`);
    console.log('║   Nhấn Ctrl+C để dừng                        ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    log('🚀 Auto-sync daemon khởi động');

    let syncCount = 0;

    const doSync = async () => {
        syncCount++;
        log(`🔄 Bắt đầu đồng bộ lần #${syncCount}...`);
        const start = Date.now();
        try {
            const result = await runSync();
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            log(`✅ Xong lần #${syncCount}: ${result.ok} bảng OK | ${result.fail} lỗi | ${result.skip} bỏ qua | ${elapsed}s`);
        } catch(e) {
            log(`❌ Lỗi lần #${syncCount}: ${e.message}`);
        }
        const nextTime = new Date(Date.now() + SYNC_INTERVAL_MINUTES * 60000);
        log(`⏰ Lần sync tiếp theo: ${nextTime.toLocaleTimeString('vi-VN')}\n`);
    };

    // Chạy ngay lần đầu
    await doSync();

    // Sau đó chạy theo lịch
    setInterval(doSync, SYNC_INTERVAL_MINUTES * 60 * 1000);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
