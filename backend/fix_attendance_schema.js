const db = require('./config/db');

async function fixDB() {
    try {
        console.log("Checking and adding agency_id to work_shifts...");
        try {
            await db.query('ALTER TABLE work_shifts ADD COLUMN agency_id INT DEFAULT NULL');
            console.log("Added agency_id to work_shifts");
        } catch(e) { console.log(e.message); }

        console.log("Checking and adding agency_id to attendance_records...");
        try {
            await db.query('ALTER TABLE attendance_records ADD COLUMN agency_id INT DEFAULT NULL');
            console.log("Added agency_id to attendance_records");
        } catch(e) { console.log(e.message); }
        
        console.log("Done");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

fixDB();
