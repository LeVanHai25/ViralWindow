const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'viral_window_db'
    });

    try {
        const [columns] = await connection.query('DESCRIBE aluminum_systems');
        console.log('Columns in aluminum_systems:');
        columns.forEach(c => console.log(`- ${c.Field} (${c.Type})`));

        const [configColumns] = await connection.query('DESCRIBE vw_aluminum_system_config');
        console.log('\nColumns in vw_aluminum_system_config:');
        configColumns.forEach(c => console.log(`- ${c.Field} (${c.Type})`));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSchema();
