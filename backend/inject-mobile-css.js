/**
 * Auto-inject mobile-responsive.css into all HTML files
 * Run: node inject-mobile-css.js
 */
const fs = require('fs');
const path = require('path');

const fontEndDir = path.join(__dirname, '..', 'FontEnd');
const cssLink = '<link rel="stylesheet" href="css/mobile-responsive.css">';
const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">';

let modifiedCount = 0;
let skippedCount = 0;
let viewportCount = 0;

// Get all HTML files
const htmlFiles = fs.readdirSync(fontEndDir).filter(f => f.endsWith('.html'));
console.log(`Found ${htmlFiles.length} HTML files\n`);

for (const file of htmlFiles) {
    const filePath = path.join(fontEndDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Add viewport meta if missing
    if (!content.includes('viewport')) {
        content = content.replace(/<head>/i, `<head>\n    ${viewportMeta}`);
        viewportCount++;
        modified = true;
    }

    // 2. Add mobile-responsive.css if not already present
    if (!content.includes('mobile-responsive.css')) {
        // Insert before </head>
        if (content.includes('sidebar-enterprise.css')) {
            // Insert after sidebar-enterprise.css link
            content = content.replace(
                /(<link[^>]*sidebar-enterprise\.css[^>]*>)/i,
                `$1\n    ${cssLink}`
            );
        } else {
            // Insert before </head>
            content = content.replace('</head>', `    ${cssLink}\n</head>`);
        }
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        modifiedCount++;
        console.log(`✅ ${file}`);
    } else {
        skippedCount++;
        console.log(`⏭️  ${file} (already has mobile CSS)`);
    }
}

console.log(`\n=============================`);
console.log(`Modified: ${modifiedCount} files`);
console.log(`Skipped:  ${skippedCount} files`);
console.log(`Viewport added: ${viewportCount} files`);
console.log(`=============================`);
