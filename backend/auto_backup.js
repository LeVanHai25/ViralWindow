/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   AUTO BACKUP SYSTEM - ViralWindow Database          ║
 * ║   Senior Software Architect Design                   ║
 * ║                                                      ║
 * ║   Layer 1: Local MySQL → SQL dump file               ║
 * ║   Layer 2: TiDB Cloud  → JSON snapshot              ║
 * ║   Layer 3: Auto-rotation (giữ 7 ngày gần nhất)      ║
 * ║                                                      ║
 * ║   Chạy: node backend/auto_backup.js                  ║
 * ║   Daemon: node backend/auto_backup.js --daemon       ║
 * ╚══════════════════════════════════════════════════════╝
 */
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');

// ── CONFIG ────────────────────────────────────────────────
const CONFIG = {
    // Thư mục lưu backup
    backupDir: path.join('D:\\ViralWindow_Phan_Mem_Nhom_Kinh', 'backup'),
    // Số ngày giữ lại (tự xóa cũ hơn)
    retentionDays: 7,
    // Daemon: chạy backup lúc mấy giờ mỗi ngày (0-23)
    dailyHour: 0,   // 00:00 sáng
    tidbHour:  1,   // 01:00 sáng
};

const LOCAL = {
    host: 'localhost', port: 3306, user: 'root', password: '',
    database: 'viral_window_db', charset: 'utf8mb4', connectTimeout: 10000
};
const TIDB = {
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000, user: '3LmszoG1PiqurSq.root', password: 'Lym4NIfWcVyhJt2V',
    database: 'viral_window_db',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }, connectTimeout: 60000
};

// Bảng không backup (dữ liệu tạm thời)
const SKIP = new Set(['user_sessions','login_history','activity_logs','user_presence']);

// Log file
const LOG = path.join(CONFIG.backupDir, 'backup.log');

// ── UTILITIES ─────────────────────────────────────────────
function timestamp() { return new Date().toLocaleString('vi-VN'); }
function dateTag()   { return new Date().toISOString().replace(/[:.]/g,'-').substring(0,19); }

function log(msg) {
    const line = `[${timestamp()}] ${msg}`;
    console.log(line);
    try {
        if (!fs.existsSync(CONFIG.backupDir)) fs.mkdirSync(CONFIG.backupDir, { recursive: true });
        fs.appendFileSync(LOG, line + '\n');
    } catch(e) {}
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── LAYER 1: LOCAL MySQL → SQL DUMP ─────────────────────
async function backupLocal() {
    log('🔵 [Layer 1] Bắt đầu backup Local MySQL...');
    const conn = await mysql.createConnection(LOCAL);
    await conn.query('SET NAMES utf8mb4');

    const tag     = dateTag();
    const dir     = path.join(CONFIG.backupDir, 'local');
    ensureDir(dir);
    const outFile = path.join(dir, `local_${tag}.sql`);
    const lines   = [];

    lines.push(`-- ViralWindow Local Backup`);
    lines.push(`-- Created: ${timestamp()}`);
    lines.push(`-- Database: viral_window_db\n`);
    lines.push(`SET FOREIGN_KEY_CHECKS=0;`);
    lines.push(`SET NAMES utf8mb4;\n`);

    // Get all tables
    const [tables] = await conn.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA='viral_window_db' AND TABLE_TYPE='BASE TABLE'
         ORDER BY TABLE_NAME`
    );

    let totalRows = 0;
    for (const { TABLE_NAME: t } of tables) {
        if (SKIP.has(t)) continue;
        try {
            // CREATE TABLE
            const [[row]] = await conn.query(`SHOW CREATE TABLE \`${t}\``);
            lines.push(`\n-- Table: ${t}`);
            lines.push(`DROP TABLE IF EXISTS \`${t}\`;`);
            lines.push(row['Create Table'] + ';');

            // INSERT DATA
            const [rows] = await conn.query(`SELECT * FROM \`${t}\``);
            if (rows.length > 0) {
                const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    const vals  = batch.map(row => {
                        const v = Object.values(row).map(val => {
                            if (val === null) return 'NULL';
                            if (val instanceof Date) return `'${val.toISOString().slice(0,19).replace('T',' ')}'`;
                            if (typeof val === 'number') return val;
                            if (typeof val === 'boolean') return val ? 1 : 0;
                            if (Buffer.isBuffer(val)) return `'${val.toString()}'`;
                            return `'${String(val).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}'`;
                        });
                        return `(${v.join(',')})`;
                    }).join(',\n');
                    lines.push(`INSERT INTO \`${t}\` (${cols}) VALUES\n${vals};`);
                }
            }
            totalRows += rows.length;
        } catch(e) { log(`  ⚠️ Skip ${t}: ${e.message.substring(0,60)}`); }
    }

    lines.push(`\nSET FOREIGN_KEY_CHECKS=1;`);
    lines.push(`\n-- END OF BACKUP — Total rows: ${totalRows}`);

    fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
    const size = (fs.statSync(outFile).size / 1024).toFixed(1);
    log(`✅ [Layer 1] Local backup: ${path.basename(outFile)} (${size} KB, ${totalRows} rows)`);

    await conn.end();
    return { file: outFile, rows: totalRows, size };
}

// ── LAYER 2: TiDB → JSON SNAPSHOT ────────────────────────
async function backupTiDB() {
    log('🟢 [Layer 2] Bắt đầu backup TiDB Cloud...');
    let conn;
    try { conn = await mysql.createConnection(TIDB); }
    catch(e) { log(`❌ [Layer 2] Kết nối TiDB thất bại: ${e.message}`); return null; }

    const tag     = dateTag();
    const dir     = path.join(CONFIG.backupDir, 'tidb');
    ensureDir(dir);
    const outFile = path.join(dir, `tidb_${tag}.json`);

    const snapshot = { meta: { created: new Date().toISOString(), source: 'TiDB Cloud' }, tables: {} };

    const [tables] = await conn.query(
        `SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
         WHERE TABLE_SCHEMA='viral_window_db' AND TABLE_TYPE='BASE TABLE'
         ORDER BY TABLE_NAME`
    );

    let totalRows = 0;
    for (const { TABLE_NAME: t } of tables) {
        if (SKIP.has(t)) continue;
        try {
            const [rows] = await conn.query(`SELECT * FROM \`${t}\``);
            snapshot.tables[t] = rows;
            totalRows += rows.length;
        } catch(e) { snapshot.tables[t] = []; }
    }
    snapshot.meta.totalRows = totalRows;

    fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2), 'utf8');
    const size = (fs.statSync(outFile).size / 1024 / 1024).toFixed(2);
    log(`✅ [Layer 2] TiDB backup: ${path.basename(outFile)} (${size} MB, ${totalRows} rows)`);

    await conn.end();
    return { file: outFile, rows: totalRows, size };
}

// ── LAYER 3: AUTO ROTATION ────────────────────────────────
function rotateBackups() {
    log('🔴 [Layer 3] Kiểm tra rotation...');
    const cutoff = Date.now() - CONFIG.retentionDays * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const subDir of ['local', 'tidb']) {
        const dir = path.join(CONFIG.backupDir, subDir);
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql') || f.endsWith('.json'));
        for (const file of files) {
            const fp = path.join(dir, file);
            const stat = fs.statSync(fp);
            if (stat.mtimeMs < cutoff) {
                fs.unlinkSync(fp);
                deleted++;
                log(`  🗑️  Xóa cũ: ${file}`);
            }
        }
    }
    if (deleted === 0) log('  ✅ Không có file cũ cần xóa');
    else log(`  ✅ Đã xóa ${deleted} file cũ (> ${CONFIG.retentionDays} ngày)`);
}

// ── FULL BACKUP CYCLE ─────────────────────────────────────
async function runFullBackup() {
    log('\n' + '═'.repeat(55));
    log('🚀 BẮT ĐẦU BACKUP CYCLE');
    log('═'.repeat(55));
    const t0 = Date.now();

    try { await backupLocal(); } catch(e) { log(`❌ [Layer 1] FAILED: ${e.message}`); }
    try { await backupTiDB(); }  catch(e) { log(`❌ [Layer 2] FAILED: ${e.message}`); }
    rotateBackups();

    // Summary
    const localDir = path.join(CONFIG.backupDir,'local');
    const tidbDir  = path.join(CONFIG.backupDir,'tidb');
    const localCount = fs.existsSync(localDir) ? fs.readdirSync(localDir).length : 0;
    const tidbCount  = fs.existsSync(tidbDir)  ? fs.readdirSync(tidbDir).length  : 0;

    const elapsed = ((Date.now() - t0)/1000).toFixed(1);
    log(`\n🎉 BACKUP HOÀN TẤT — ${elapsed}s`);
    log(`   📁 Local backups: ${localCount} file(s) → ${localDir}`);
    log(`   📁 TiDB backups:  ${tidbCount} file(s)  → ${tidbDir}`);
    log('═'.repeat(55) + '\n');
}

// ── DAEMON MODE (--daemon) ────────────────────────────────
async function daemon() {
    log('🤖 BACKUP DAEMON khởi động');
    log(`   ⏰ Backup Local lúc ${CONFIG.dailyHour}:00 mỗi ngày`);
    log(`   ⏰ Backup TiDB  lúc ${CONFIG.tidbHour}:00 mỗi ngày`);
    log('   Nhấn Ctrl+C để dừng\n');

    let lastLocalDay = -1;
    let lastTidbDay  = -1;

    setInterval(async () => {
        const now  = new Date();
        const hour = now.getHours();
        const day  = now.getDate();

        if (hour === CONFIG.dailyHour && day !== lastLocalDay) {
            lastLocalDay = day;
            log('⏰ Đến giờ backup Local...');
            try { await backupLocal(); rotateBackups(); } catch(e) { log('❌ ' + e.message); }
        }

        if (hour === CONFIG.tidbHour && day !== lastTidbDay) {
            lastTidbDay = day;
            log('⏰ Đến giờ backup TiDB...');
            try { await backupTiDB(); } catch(e) { log('❌ ' + e.message); }
        }
    }, 60 * 1000); // Check mỗi 1 phút
}

// ── RESTORE HELPER ────────────────────────────────────────
async function listBackups() {
    console.log('\n📋 DANH SÁCH BACKUP:\n');
    for (const [label, subDir] of [['Local SQL', 'local'], ['TiDB JSON', 'tidb']]) {
        const dir = path.join(CONFIG.backupDir, subDir);
        if (!fs.existsSync(dir)) { console.log(`  [${label}] Chưa có backup`); continue; }
        const files = fs.readdirSync(dir).sort().reverse().slice(0, 7);
        console.log(`  📂 ${label} (${dir}):`);
        for (const f of files) {
            const stat = fs.statSync(path.join(dir, f));
            const size = stat.size > 1024*1024
                ? (stat.size/1024/1024).toFixed(2)+' MB'
                : (stat.size/1024).toFixed(1)+' KB';
            console.log(`    • ${f} — ${size} — ${stat.mtime.toLocaleString('vi-VN')}`);
        }
        console.log('');
    }
}

// ── ENTRY POINT ───────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--daemon')) {
    // Chạy daemon + backup ngay lần đầu
    runFullBackup().then(() => daemon());
} else if (args.includes('--list')) {
    listBackups();
} else {
    // Chạy backup 1 lần
    runFullBackup().then(() => process.exit(0)).catch(e => {
        log('FATAL: ' + e.message); process.exit(1);
    });
}
