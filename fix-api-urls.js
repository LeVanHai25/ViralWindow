const fs = require('fs');
const filepath = 'd:/ViralWindow_Phan_Mem_Nhom_Kinh/FontEnd/js/work-plan.js';
let content = fs.readFileSync(filepath, 'utf8');

const constants = `
const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : window.location.origin + '/api');
const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin;
`;

if (!content.includes('API_BASE')) {
    content = content.replace('const WorkPlanModule = {', constants + '\nconst WorkPlanModule = {');
    
    // Replace API paths
    content = content.replace(/'\/api\/work-plans\/users'/g, '`${API_BASE}/work-plans/users`');
    content = content.replace(/'\/api\/work-plans'/g, '`${API_BASE}/work-plans`');
    content = content.replace(/`\/api\/work-plans/g, '`${API_BASE}/work-plans');
    
    // Replace socket init
    content = content.replace(/io\(\{ auth: \{ token \} \}\)/g, 'io(SOCKET_URL, { auth: { token } })');
    
    fs.writeFileSync(filepath, content);
    console.log('Successfully updated URLs in ' + filepath);
} else {
    console.log('URLs already updated in ' + filepath);
}
