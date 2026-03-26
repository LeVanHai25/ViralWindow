const db = require('./config/db.js');

async function upgradeDB() {
    try {
        console.log("Checking columns in company_config...");
        const [cols] = await db.query('SHOW COLUMNS FROM company_config');
        const colNames = cols.map(c => c.Field);

        let alterQuery = 'ALTER TABLE company_config ';
        let adds = [];
        
        if (!colNames.includes('office_lat')) adds.push('ADD COLUMN office_lat DECIMAL(10,8) NULL');
        if (!colNames.includes('office_lng')) adds.push('ADD COLUMN office_lng DECIMAL(11,8) NULL');
        if (!colNames.includes('office_radius')) adds.push('ADD COLUMN office_radius INT DEFAULT 100');
        if (!colNames.includes('allowed_ips')) adds.push('ADD COLUMN allowed_ips VARCHAR(255) NULL');

        if (adds.length > 0) {
            alterQuery += adds.join(', ');
            console.log("Executing:", alterQuery);
            await db.query(alterQuery);
            console.log("Database upgraded successfully with Geofencing columns!");
        } else {
            console.log("Geofencing columns already exist.");
        }
    } catch(err) {
        console.error("Failed to upgrade DB:", err);
    }
    process.exit();
}

upgradeDB();
