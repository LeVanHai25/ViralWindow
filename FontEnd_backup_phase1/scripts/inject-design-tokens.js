/**
 * Script 1: Inject design-tokens.css into all HTML files
 * Run: node FontEnd/scripts/inject-design-tokens.js
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');
const CSS_LINKS = [
    '<link rel="stylesheet" href="css/design-tokens.css">',
    '<link rel="stylesheet" href="css/components.css">'
];
const COMPONENT_SCRIPTS = [
    '<script src="js/components/sidebar-loader.js" defer></script>',
    '<script src="js/components/breadcrumbs.js" defer></script>',
    '<script src="js/components/loading-states.js" defer></script>'
];

// Files to skip (no sidebar, standalone pages)
const SKIP_FILES = ['login.html', 'register.html', 'forgot-password.html', 'reset-password.html', '404.html'];

let modified = 0;
let skipped = 0;
let errors = 0;

const files = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.html'));

console.log(`\n🚀 ViralWindow Design System Injector`);
console.log(`   Found ${files.length} HTML files\n`);

files.forEach(file => {
    const filePath = path.join(FRONTEND_DIR, file);
    let html;

    try {
        html = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.log(`   ❌ Cannot read: ${file}`);
        errors++;
        return;
    }

    let changed = false;

    // 1. Inject design-tokens.css (after <meta charset>)
    if (!html.includes('design-tokens.css')) {
        const insertPoint = html.indexOf('<meta charset="UTF-8">');
        if (insertPoint !== -1) {
            const after = insertPoint + '<meta charset="UTF-8">'.length;
            const injection = '\n    ' + CSS_LINKS.join('\n    ');
            html = html.slice(0, after) + injection + html.slice(after);
            changed = true;
        }
    }

    // 2. Inject components.css if not already present
    if (!html.includes('components.css') && html.includes('design-tokens.css')) {
        html = html.replace(
            '<link rel="stylesheet" href="css/design-tokens.css">',
            '<link rel="stylesheet" href="css/design-tokens.css">\n    <link rel="stylesheet" href="css/components.css">'
        );
        changed = true;
    }

    // 3. Inject component scripts (skip login-type pages)
    if (!SKIP_FILES.includes(file)) {
        COMPONENT_SCRIPTS.forEach(script => {
            const scriptName = script.match(/src="([^"]+)"/)[1];
            if (!html.includes(scriptName)) {
                // Insert before </head>
                html = html.replace('</head>', `    ${script}\n</head>`);
                changed = true;
            }
        });
    }

    if (changed) {
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`   ✅ ${file}`);
        modified++;
    } else {
        console.log(`   ⏭️  ${file} (already has tokens)`);
        skipped++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Modified: ${modified}`);
console.log(`   Skipped:  ${skipped}`);
console.log(`   Errors:   ${errors}`);
console.log(`   Total:    ${files.length}\n`);
