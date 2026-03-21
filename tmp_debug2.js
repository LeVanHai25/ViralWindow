const http = require('http');

http.get('http://127.0.0.1:3000/api/projects', (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(raw);
            const p = data.data.find(x => x.name && x.name.includes('VRB018'));
            if (!p) {
                console.log('Project VRB018 not found.');
                return;
            }
            console.log('Found Project:', p.id, p.name);
            
            http.get(`http://127.0.0.1:3000/api/production/excel/orders/${p.id}/materials/ACCESSORY/details`, (r2) => {
                let r2raw = '';
                r2.on('data', c => r2raw += c);
                r2.on('end', () => {
                    console.log('\nACCESSORY details:', JSON.parse(r2raw));
                });
            });

            http.get(`http://127.0.0.1:3000/api/project-materials/${p.id}/bom-data`, (r3) => {
                let r3raw = '';
                r3.on('data', c => r3raw += c);
                r3.on('end', () => {
                   const d3 = JSON.parse(r3raw);
                   console.log('\ngetBOMData vattu count:', d3.data.vattu ? d3.data.vattu.length : 0);
                   console.log('getBOMData phukien count:', d3.data.phukien ? d3.data.phukien.length : 0);
                });
            });
        } catch (e) {
            console.error(e);
        }
    });
});
