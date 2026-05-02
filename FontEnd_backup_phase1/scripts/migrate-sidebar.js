/**
 * Script 3: Migrate inline sidebar to shared component
 * Replaces hardcoded <div class="sidebar...">...</div> with <div id="sidebar-container"></div>
 * Run: node FontEnd/scripts/migrate-sidebar.js
 * 
 * IMPORTANT: Run inject-design-tokens.js FIRST to ensure sidebar-loader.js is referenced
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

// Pages that should NOT have sidebar replaced
const SKIP_FILES = [
    'login.html',
    'register.html', 
    'forgot-password.html',
    'reset-password.html',
    '404.html'
];

let modified = 0;
let skipped = 0;
let alreadyMigrated = 0;
let errors = 0;

const files = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.html'));

console.log(`\n🚀 ViralWindow Sidebar Migration`);
console.log(`   Found ${files.length} HTML files\n`);

files.forEach(file => {
    if (SKIP_FILES.includes(file)) {
        console.log(`   ⏭️  ${file} — skip (no sidebar)`);
        skipped++;
        return;
    }

    const filePath = path.join(FRONTEND_DIR, file);
    let html;

    try {
        html = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.log(`   ❌ Cannot read: ${file}`);
        errors++;
        return;
    }

    // Check if already migrated
    if (html.includes('id="sidebar-container"')) {
        console.log(`   ✔️  ${file} — already migrated`);
        alreadyMigrated++;
        return;
    }

    // Check if this page has inline sidebar
    if (!html.includes('class="sidebar')) {
        console.log(`   ⏭️  ${file} — no sidebar found`);
        skipped++;
        return;
    }

    const original = html;

    // Strategy: Find the sidebar div and replace it
    // The sidebar is: <div class="sidebar text-white"> ... </div> followed by main content
    // We need to match the entire sidebar block including nested divs

    // Method: Use regex to find sidebar opening, then count div depth
    const sidebarStart = html.indexOf('<div class="sidebar');
    if (sidebarStart === -1) {
        console.log(`   ⏭️  ${file} — sidebar pattern not found`);
        skipped++;
        return;
    }

    // Find the end of the sidebar div by counting nested divs
    let depth = 0;
    let pos = sidebarStart;
    let sidebarEnd = -1;

    while (pos < html.length) {
        const nextOpen = html.indexOf('<div', pos + 1);
        const nextClose = html.indexOf('</div>', pos + 1);

        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            pos = nextOpen + 4;
        } else {
            if (depth === 0) {
                sidebarEnd = nextClose + '</div>'.length;
                break;
            }
            depth--;
            pos = nextClose + '</div>'.length;
        }
    }

    if (sidebarEnd === -1) {
        console.log(`   ⚠️  ${file} — could not find sidebar end (manual review needed)`);
        errors++;
        return;
    }

    // Extract what we're replacing for logging
    const sidebarBlock = html.slice(sidebarStart, sidebarEnd);
    const sidebarLines = sidebarBlock.split('\n').length;

    // Add breadcrumb container after main-content opening div
    let newHtml = html.slice(0, sidebarStart) + 
        '<!-- Sidebar loaded dynamically by sidebar-loader.js -->\n    <div id="sidebar-container"></div>' + 
        html.slice(sidebarEnd);

    // Add breadcrumb container if not present (after main-content header)
    if (!newHtml.includes('breadcrumb-container')) {
        // Insert after the first page header div in main-content
        newHtml = newHtml.replace(
            /<div class="main-content">/,
            '<div class="main-content">\n        <div id="breadcrumb-container"></div>'
        );
    }

    // Remove redundant inline functions that are now in sidebar-loader.js
    // toggleSidebarUserMenu
    newHtml = newHtml.replace(
        /\s*\/\/\s*Toggle sidebar user menu\s*\n\s*function toggleSidebarUserMenu\(\)\s*\{[\s\S]*?\}\s*/g,
        '\n'
    );

    // handleLogout (only if it matches the simple version)
    // Keep it if it has extra logic beyond the standard version
    newHtml = newHtml.replace(
        /\s*\/\/\s*Handle logout \(shared function\)\s*\n\s*async function handleLogout\(\)\s*\{[\s\S]*?window\.location\.href\s*=\s*'login\.html';\s*\}\s*\}\s*/g,
        '\n'
    );

    // Clean up multiple blank lines
    newHtml = newHtml.replace(/\n{3,}/g, '\n\n');

    if (newHtml !== original) {
        fs.writeFileSync(filePath, newHtml, 'utf-8');
        console.log(`   ✅ ${file} — sidebar removed (${sidebarLines} lines)`);
        modified++;
    } else {
        console.log(`   ⏭️  ${file} — no changes needed`);
        skipped++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Migrated:         ${modified}`);
console.log(`   Already migrated: ${alreadyMigrated}`);
console.log(`   Skipped:          ${skipped}`);
console.log(`   Errors:           ${errors}`);
console.log(`   Total:            ${files.length}`);
console.log(`\n⚠️  REVIEW: Check all modified pages to verify sidebar loads correctly.`);
console.log(`   Test: Open each page in browser and confirm sidebar appears.\n`);
