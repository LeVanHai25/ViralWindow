const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'viral_window_db'
    });

    try {
        const [columns1] = await connection.query('DESCRIBE aluminum_systems');
        console.log('--- aluminum_systems ---');
        console.log(JSON.stringify(columns1, null, 2));

        const [columns2] = await connection.query('DESCRIBE vw_aluminum_system_config');
        console.log('\n--- vw_aluminum_system_config ---');
        console.log(JSON.stringify(columns2, null, 2));

        const [rows] = await connection.query('SELECT * FROM vw_aluminum_system_config LIMIT 5');
        console.log('\n--- Content: vw_aluminum_system_config ---');
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSchema();
