const fs = require('fs');
const path = require('path');

const projectDir = 'd:/ViralWindow_Phan_Mem_Nhom_Kinh/FontEnd';
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));

const allFiles = [];
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                walk(file);
            }
        } else {
            if (file.endsWith('.html') || file.endsWith('.js')) {
                allFiles.push(file);
            }
        }
    });
}
walk(projectDir);

const usage = {};
htmlFiles.forEach(f => {
    usage[f] = {
        count: 0,
        locations: []
    };
});

allFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    htmlFiles.forEach(htmlFile => {
        if (filePath.endsWith(htmlFile)) return;
        if (content.includes(htmlFile)) {
            usage[htmlFile].count++;
            usage[htmlFile].locations.push(path.relative(projectDir, filePath));
        }
    });
});

const menuTemplatePath = path.join(projectDir, 'js/sidebar-menu-template.js');
let menuContent = '';
if (fs.existsSync(menuTemplatePath)) {
    menuContent = fs.readFileSync(menuTemplatePath, 'utf8');
}

let resultStr = "# HTML Usage Analysis Result\n\n";
resultStr += "| HTML File | Refs | In Menu | Related To | Status |\n";
resultStr += "|-----------|------|---------|------------|--------|\n";

htmlFiles.forEach(f => {
    const inMenu = menuContent.includes(f) ? "Yes" : "No";
    let status = "Active";
    if (inMenu === "No" && usage[f].count === 0) {
        status = "Orphan";
    } else if (inMenu === "No" && usage[f].count > 0) {
        status = "Linked (Internal)";
    }

    let related = "System";
    if (f.startsWith('test-') || f.includes('debug') || f.includes('sample') || f.includes('backup') || f.includes('old') || f.includes('v2') & !f.includes('product-catalog-v2')) {
        related = "Test/Backup/Dev";
    }

    resultStr += `| ${f} | ${usage[f].count} | ${inMenu} | ${related} | ${status} |\n`;
});

fs.writeFileSync('d:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/html_analysis_result.md', resultStr);
console.log("Analysis saved to html_analysis_result.md");
