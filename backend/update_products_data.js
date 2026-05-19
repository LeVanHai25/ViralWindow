const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'FontEnd', 'js', 'products-data.js');
let fileContent = fs.readFileSync(filePath, 'utf8');

const prefixComments = fileContent.substring(0, fileContent.indexOf('const PRODUCTS_DATA'));
fileContent = fileContent.replace(/\/\/.*\n/g, ''); 
const match = fileContent.match(/const PRODUCTS_DATA\s*=\s*(\[[\s\S]*?\]);/);

if (match) {
    const PRODUCTS_DATA = JSON.parse(match[1]);

    // Map logical names to shorter codes
    const nameToCode = {
        'CỬA ĐI MỞ QUAY': 'CD_MQ',
        'CỬA SỔ MỞ QUAY': 'CS_MQ',
        'CỬA SỔ MỞ HẤT': 'CS_MH',
        'CỬA SỔ MỞ TRƯỢT': 'CS_MT',
        'CỬA ĐI MỞ TRƯỢT': 'CD_MT',
        'VÁCH KÍNH CỐ ĐỊNH': 'VK_CD',
        'CỬA ĐI MỞ QUAY TRƯỢT  VR100': 'CD_MQT',
        'CỬA SỔ MỞ QUAY/HẤT': 'CS_MQH',
        'CỬA SỔ MỞ QUAY/LẬT': 'CS_MQL',
        'CỬA SỔ MỞ QUAY  MỞ HẤT Ở GIỮA MỞ QUAY 2 BÊN': 'CS_MQ_MIX'
    };

    PRODUCTS_DATA.forEach(p => {
        let originalName = p.name.split('\n')[0].trim().toUpperCase();
        let baseType = originalName.split(/dùng nhôm|Dùng nhôm|DÙNG NHÔM/i)[0].trim();
        baseType = baseType.replace(/\d+\s*CÁNH/i, '').trim();
        baseType = baseType.replace(/\d+\s*CANH/i, '').trim();
        
        // Custom fallbacks
        if (baseType.includes('VÁCH KÍNH CỐ ĐỊNH')) baseType = 'VÁCH KÍNH CỐ ĐỊNH';

        p.groupName = baseType;
        p.groupCode = nameToCode[baseType] || 'OTHER';
    });

    const newFileContent = prefixComments + 'const PRODUCTS_DATA = ' + JSON.stringify(PRODUCTS_DATA, null, 2) + ';\n';
    fs.writeFileSync(filePath, newFileContent, 'utf8');
    console.log('Successfully updated products-data.js with new groups.');
} else {
    console.log('Could not parse PRODUCTS_DATA');
}
