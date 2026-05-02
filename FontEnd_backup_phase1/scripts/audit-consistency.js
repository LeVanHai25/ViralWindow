/**
 * Script 4: Audit — Scan for inconsistencies across all HTML/CSS files
 * Reports: inline styles, hardcoded colors, font mismatches, missing tokens
 * Run: node FontEnd/scripts/audit-consistency.js
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

const issues = [];
let totalFiles = 0;

// ===== CHECKS =====

function checkFile(file, html) {
    const ctx = { file, html };
    
    checkTailwindCDN(ctx);
    checkHardcodedColors(ctx);
    checkFontStacks(ctx);
    checkInlineStyles(ctx);
    checkSidebarWidth(ctx);
    checkMissingDesignTokens(ctx);
    checkZIndexWars(ctx);
    checkAccessibility(ctx);
    checkScriptLoading(ctx);
    checkLargeFileSize(ctx);
}

function checkTailwindCDN({ file, html }) {
    if (html.includes('cdn.tailwindcss.com')) {
        issues.push({ file, type: '🔴 CRITICAL', issue: 'Still using Tailwind CDN — blocks rendering' });
    }
}

function checkHardcodedColors({ file, html }) {
    // Find inline style colors that should use tokens
    const colorPatterns = [
        { regex: /color:\s*#[0-9a-fA-F]{3,8}/g, name: 'hardcoded text color' },
        { regex: /background(?:-color)?:\s*#[0-9a-fA-F]{3,8}/g, name: 'hardcoded background' },
        { regex: /border(?:-color)?:\s*#[0-9a-fA-F]{3,8}/g, name: 'hardcoded border color' },
    ];

    colorPatterns.forEach(({ regex, name }) => {
        const matches = html.match(regex);
        if (matches && matches.length > 5) {
            issues.push({
                file, type: '⚠️ MEDIUM',
                issue: `${matches.length} instances of ${name} in inline styles (use design tokens)`
            });
        }
    });
}

function checkFontStacks({ file, html }) {
    if (html.includes("'Segoe UI', Tahoma") && !html.includes('design-tokens.css')) {
        issues.push({ file, type: '⚠️ MEDIUM', issue: 'Uses legacy font stack instead of var(--font-sans)' });
    }
    if (html.includes('JetBrains Mono') && !html.includes('fonts.googleapis.com') && !html.includes('design-tokens.css')) {
        issues.push({ file, type: '⚠️ MEDIUM', issue: 'References JetBrains Mono but font is not loaded' });
    }
}

function checkInlineStyles({ file, html }) {
    const inlineStyles = (html.match(/style="[^"]{50,}"/g) || []);
    if (inlineStyles.length > 10) {
        issues.push({
            file, type: '⚠️ MEDIUM',
            issue: `${inlineStyles.length} long inline style attributes (>50 chars) — consider CSS classes`
        });
    }
}

function checkSidebarWidth({ file, html }) {
    if (html.includes('margin-left: 280px') || html.includes('margin-left:280px')) {
        issues.push({ file, type: '🔴 HIGH', issue: 'Hardcoded margin-left: 280px (should be var(--sidebar-width) = 260px)' });
    }
}

function checkMissingDesignTokens({ file, html }) {
    if (!html.includes('design-tokens.css')) {
        issues.push({ file, type: '🔴 HIGH', issue: 'Missing design-tokens.css import' });
    }
}

function checkZIndexWars({ file, html }) {
    const zMatches = html.match(/z-index:\s*(\d+)/g) || [];
    const highZ = zMatches.filter(m => {
        const val = parseInt(m.replace(/\D/g, ''));
        return val > 1000;
    });
    if (highZ.length > 0) {
        issues.push({
            file, type: '⚠️ MEDIUM',
            issue: `${highZ.length} z-index values > 1000 (use z-index scale from tokens)`
        });
    }
}

function checkAccessibility({ file, html }) {
    // Check for images without alt
    const imgsNoAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/g) || []);
    if (imgsNoAlt.length > 0) {
        issues.push({ file, type: '⚠️ MEDIUM', issue: `${imgsNoAlt.length} <img> tags without alt attribute` });
    }

    // Check for buttons without aria-label or text content
    const emptyButtons = (html.match(/<button[^>]*>\s*<svg/g) || []);
    if (emptyButtons.length > 3) {
        issues.push({ file, type: '⚠️ MEDIUM', issue: `${emptyButtons.length} icon-only buttons without aria-label` });
    }
}

function checkScriptLoading({ file, html }) {
    const syncScripts = (html.match(/<script src="[^"]*"(?![^>]*defer|async)[^>]*>/g) || [])
        .filter(s => !s.includes('auth-helper') && !s.includes('modal-system'));
    if (syncScripts.length > 3) {
        issues.push({
            file, type: '⚠️ MEDIUM',
            issue: `${syncScripts.length} render-blocking scripts without defer/async`
        });
    }
}

function checkLargeFileSize({ file }) {
    const filePath = path.join(FRONTEND_DIR, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    if (sizeKB > 200) {
        issues.push({
            file, type: '🔴 HIGH',
            issue: `File size: ${sizeKB} KB — consider splitting inline JS/CSS into external files`
        });
    }
}

// ===== MAIN =====

console.log(`\n🔍 ViralWindow Consistency Audit\n`);

const htmlFiles = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.html'));
totalFiles = htmlFiles.length;

htmlFiles.forEach(file => {
    const html = fs.readFileSync(path.join(FRONTEND_DIR, file), 'utf-8');
    checkFile(file, html);
});

// ===== REPORT =====
console.log(`Scanned ${totalFiles} files\n`);

if (issues.length === 0) {
    console.log('✅ No issues found! Everything looks consistent.\n');
} else {
    // Group by severity
    const critical = issues.filter(i => i.type.includes('CRITICAL'));
    const high = issues.filter(i => i.type.includes('HIGH'));
    const medium = issues.filter(i => i.type.includes('MEDIUM'));

    if (critical.length > 0) {
        console.log(`\n🔴 CRITICAL (${critical.length}):`);
        critical.forEach(i => console.log(`   ${i.file}: ${i.issue}`));
    }

    if (high.length > 0) {
        console.log(`\n🔴 HIGH (${high.length}):`);
        high.forEach(i => console.log(`   ${i.file}: ${i.issue}`));
    }

    if (medium.length > 0) {
        console.log(`\n⚠️  MEDIUM (${medium.length}):`);
        medium.forEach(i => console.log(`   ${i.file}: ${i.issue}`));
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Critical: ${critical.length}`);
    console.log(`   High:     ${high.length}`);
    console.log(`   Medium:   ${medium.length}`);
    console.log(`   Total:    ${issues.length} issues in ${totalFiles} files\n`);
}
