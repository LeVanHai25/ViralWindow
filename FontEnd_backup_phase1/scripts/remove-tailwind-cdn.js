/**
 * Script 2: Remove Tailwind CDN from all HTML files
 * Removes both the <script src="cdn.tailwindcss.com"> and the suppression script
 * Run: node FontEnd/scripts/remove-tailwind-cdn.js
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

let modified = 0;
let skipped = 0;

const files = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.html'));

console.log(`\n🚀 ViralWindow Tailwind CDN Remover`);
console.log(`   Found ${files.length} HTML files\n`);

files.forEach(file => {
    const filePath = path.join(FRONTEND_DIR, file);
    let html;

    try {
        html = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.log(`   ❌ Cannot read: ${file}`);
        return;
    }

    const original = html;

    // 1. Remove Tailwind CDN script tag
    html = html.replace(/\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g, '\n');

    // 2. Remove suppression script block (multiple patterns)
    // Pattern A: Inline <script> block
    html = html.replace(
        /\s*<script>\s*\/\/\s*Suppress TailwindCSS CDN production warning[\s\S]*?<\/script>\s*/g,
        '\n'
    );

    // Pattern B: Simpler suppression
    html = html.replace(
        /\s*<script>\s*if\s*\(typeof window[^<]*tailwind\.suppressWarning\s*=\s*true[^<]*<\/script>\s*/g,
        '\n'
    );

    // 3. Remove Tailwind config script if present
    html = html.replace(
        /\s*<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\}\s*<\/script>\s*/g,
        '\n'
    );

    // 4. Clean up multiple blank lines left behind
    html = html.replace(/\n{3,}/g, '\n\n');

    if (html !== original) {
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`   ✅ ${file} — CDN removed`);
        modified++;
    } else {
        console.log(`   ⏭️  ${file} — no CDN found`);
        skipped++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Modified: ${modified}`);
console.log(`   Skipped:  ${skipped}`);
console.log(`   Total:    ${files.length}`);
console.log(`\n⚠️  IMPORTANT: You must generate tailwind-utilities.css before pages will render correctly.`);
console.log(`   Run: npx tailwindcss -o FontEnd/css/tailwind-utilities.css --content "FontEnd/**/*.html" --minify\n`);
