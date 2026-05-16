/**
 * BI-DIRECTIONAL SYNC DAEMON
 * Local XAMPP ↔ TiDB Cloud (Production)
 * 
 * Chiến lược: "Last Modified Wins" — bên nào có updated_at mới hơn thì thắng
 * Cho bảng không có updated_at: bên nào nhiều rows hơn thì thắng
 * 
 * Chạy: node backend/bidirectional_sync.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const SYNC_INTERVAL_MINUTES = 15; // Đồng bộ mỗi 15 phút

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

// Bảng hệ thống - không đồng bộ
const SKIP_TABLES = new Set([
    'user_sessions', 'login_history', 'activity_logs', 'audit_logs',
    'notifications', 'password_resets', 'project_activity_logs',
    'user_presence', 'event_types'
]);

const LOG_FILE = path.join(__dirname, 'bidirectional_sync.log');

function log(msg) {
    const ts = new Date().toLocaleString('vi-VN');
    const line = `[${ts}] ${msg}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── Lấy thời điểm cập nhật mới nhất của bảng ────────────────
async function getLastUpdate(conn, tableName) {
    try {
        const [[row]] = await conn.query(
            `SELECT MAX(updated_at) as last_upd, COUNT(*) as cnt FROM \`${tableName}\``
        );
        return { lastUpdate: row.last_upd, count: row.cnt };
    } catch(e) {
        try {
            const [[row]] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            return { lastUpdate: null, count: row.cnt };
        } catch(e2) { return { lastUpdate: null, count: 0 }; }
    }
}

// ─── Patch cột thiếu ─────────────────────────────────────────
async function patchCols(target, source, table) {
    try {
        const [sc] = await source.query(`DESCRIBE \`${table}\``);
        const [tc] = await target.query(`DESCRIBE \`${table}\``);
        const existing = new Set(tc.map(c => c.Field));
        for (const col of sc) {
            if (!existing.has(col.Field)) {
                try { await target.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col.Field}\` ${col.Type} DEFAULT NULL`); }
                catch(e) {}
            }
        }
    } catch(e) {}
}

// ─── Copy toàn bộ bảng từ source → target ────────────────────
async function copyTable(source, target, tableName) {
    const [rows] = await source.query(`SELECT * FROM \`${tableName}\``);
    if (rows.length === 0) { await target.query(`TRUNCATE TABLE \`${tableName}\``); return 0; }
    
    await patchCols(target, source, tableName);
    await target.query(`TRUNCATE TABLE \`${tableName}\``);
    
    const batchSize = 100;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const cols = Object.keys(batch[0]).map(c => `\`${c}\``).join(',');
        const ph = batch.map(() => `(${Object.keys(batch[0]).map(() => '?').join(',')})`).join(',');
        const vals = batch.flatMap(r => Object.values(r));
        try {
            await target.query(`INSERT INTO \`${tableName}\` (${cols}) VALUES ${ph}`, vals);
            inserted += batch.length;
        } catch(e) {
            // Thử insert từng row
            for (const row of batch) {
                try {
                    const rcols = Object.keys(row).map(c => `\`${c}\``).join(',');
                    const rph = Object.values(row).map(() => '?').join(',');
                    await target.query(`INSERT INTO \`${tableName}\` (${rcols}) VALUES (${rph})`, Object.values(row));
                    inserted++;
                } catch(e2) {}
            }
        }
    }
    return inserted;
}

// ─── Sync 1 bảng theo chiến lược Last-Modified-Wins ──────────
async function syncTableBidirectional(local, tidb, tableName) {
    const localInfo = await getLastUpdate(local, tableName);
    const tidbInfo  = await getLastUpdate(tidb, tableName);

    let direction = null;

    if (localInfo.lastUpdate && tidbInfo.lastUpdate) {
        // Cả 2 có updated_at — so sánh thời gian
        const localTime = new Date(localInfo.lastUpdate).getTime();
        const tidbTime  = new Date(tidbInfo.lastUpdate).getTime();
        if (Math.abs(localTime - tidbTime) < 1000) return { dir: 'equal', rows: localInfo.count };
        direction = localTime > tidbTime ? 'local→tidb' : 'tidb→local';
    } else {
        // Không có updated_at — so sánh số rows
        if (localInfo.count === tidbInfo.count) return { dir: 'equal', rows: localInfo.count };
        direction = localInfo.count > tidbInfo.count ? 'local→tidb' : 'tidb→local';
    }

    if (direction === 'local→tidb') {
        const count = await copyTable(local, tidb, tableName);
        return { dir: '↑ Local→TiDB', rows: count };
    } else {
        const count = await copyTable(tidb, local, tableName);
        return { dir: '↓ TiDB→Local', rows: count };
    }
}

// ─── Main Sync Run ────────────────────────────────────────────
async function runBidirectionalSync() {
    let local, tidb;
    try {
        local = await mysql.createConnection(LOCAL);
        tidb  = await mysql.createConnection(TIDB);
    } catch(e) {
        log(`❌ Kết nối thất bại: ${e.message}`);
        return;
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS=0');
    await tidb.query("SET SESSION sql_mode=''");
    await local.query('SET FOREIGN_KEY_CHECKS=0');
    await local.query('SET NAMES utf8mb4');

    const [tables] = await local.query(`
        SELECT TABLE_NAME FROM information_schema.TABLES
        WHERE TABLE_SCHEMA='viral_window_db' AND TABLE_TYPE='BASE TABLE'
        ORDER BY TABLE_NAME
    `);

    const stats = { up: 0, down: 0, equal: 0, skip: 0, error: 0 };

    for (const { TABLE_NAME: t } of tables) {
        if (SKIP_TABLES.has(t)) { stats.skip++; continue; }
        try {
            const result = await syncTableBidirectional(local, tidb, t);
            if (result.dir === 'equal') stats.equal++;
            else if (result.dir.includes('Local→TiDB')) { stats.up++; }
            else if (result.dir.includes('TiDB→Local')) { stats.down++; }
        } catch(e) {
            stats.error++;
        }
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS=1');
    await local.query('SET FOREIGN_KEY_CHECKS=1');
    await local.end().catch(() => {});
    await tidb.end().catch(() => {});

    return stats;
}

// ─── Main Loop ────────────────────────────────────────────────
async function main() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   BI-DIRECTIONAL SYNC: Local XAMPP ↔ TiDB Cloud     ║');
    console.log(`║   Chiến lược: Last-Modified-Wins | Mỗi ${SYNC_INTERVAL_MINUTES} phút       ║`);
    console.log('║   Nhấn Ctrl+C để dừng                                ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    log('🚀 Bidirectional sync daemon khởi động');

    let syncCount = 0;

    const doSync = async () => {
        syncCount++;
        log(`🔄 Sync 2 chiều lần #${syncCount}...`);
        const start = Date.now();
        try {
            const stats = await runBidirectionalSync();
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            log(`✅ Lần #${syncCount}: ↑ Lên TiDB: ${stats.up} | ↓ Từ TiDB: ${stats.down} | ═ Giống nhau: ${stats.equal} | ⏭ Bỏ qua: ${stats.skip} | ${elapsed}s`);
        } catch(e) {
            log(`❌ Lỗi lần #${syncCount}: ${e.message}`);
        }
        const nextTime = new Date(Date.now() + SYNC_INTERVAL_MINUTES * 60000);
        log(`⏰ Lần tiếp theo: ${nextTime.toLocaleTimeString('vi-VN')}\n`);
    };

    await doSync();
    setInterval(doSync, SYNC_INTERVAL_MINUTES * 60 * 1000);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
