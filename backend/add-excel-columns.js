// Add fix_compatible and excel_note columns to projects table
const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding columns to projects table...\n');

        // Check if columns exist
        const [columns] = await db.query(`SHOW COLUMNS FROM projects`);
        const columnNames = columns.map(c => c.Field);

        // Add fix_compatible if not exists
        if (!columnNames.includes('fix_compatible')) {
            console.log('Adding fix_compatible column...');
            await db.query(`ALTER TABLE projects ADD COLUMN fix_compatible TEXT NULL`);
            console.log('  Done!\n');
        } else {
            console.log('fix_compatible column already exists\n');
        }

        // Add excel_note if not exists (separate from existing note field)
        if (!columnNames.includes('excel_note')) {
            console.log('Adding excel_note column...');
            await db.query(`ALTER TABLE projects ADD COLUMN excel_note TEXT NULL`);
            console.log('  Done!\n');
        } else {
            console.log('excel_note column already exists\n');
        }

        console.log('✅ Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

migrate();
