/**
 * Script 5: Add defer to non-critical scripts across all pages
 * Run: node FontEnd/scripts/optimize-scripts.js
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

// Scripts that MUST remain synchronous (auth redirect depends on them)
const SYNC_SCRIPTS = [
    'auth-helper.js',
    'modal-system.js'  // Some pages call VWModal immediately
];

// Scripts that should be deferred
const DEFER_CANDIDATES = [
    'user-settings.js',
    'config.js',
    'vw-modal.js',
    'permission-guard.js',
    'success-notification.js',
    'notification-system.js',
    'notification-header.js',
    'sidebar-enterprise.js',
    'sidebar-chat-menu.js',
    'ai-chatbot-widget.js',
    'ai-search-widget.js'
];

let modified = 0;

const files = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.html'));

console.log(`\n🚀 ViralWindow Script Optimizer`);
console.log(`   Adding defer to non-critical scripts\n`);

files.forEach(file => {
    const filePath = path.join(FRONTEND_DIR, file);
    let html;
    try {
        html = fs.readFileSync(filePath, 'utf-8');
    } catch (e) { return; }

    const original = html;

    DEFER_CANDIDATES.forEach(script => {
        // Match <script src="...script.js"></script> without defer
        const regex = new RegExp(
            `(<script\\s+src="[^"]*${script.replace('.', '\\.')}")(>)`,
            'g'
        );
        html = html.replace(regex, (match, p1, p2) => {
            if (match.includes('defer') || match.includes('async')) return match;
            return `${p1} defer${p2}`;
        });
    });

    if (html !== original) {
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`   ✅ ${file}`);
        modified++;
    }
});

console.log(`\n📊 Modified: ${modified} files\n`);
