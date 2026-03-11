const mysql = require('mysql2/promise');

async function checkData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'viral_window_db'
    });

    try {
        console.log('--- Content: vw_aluminum_system_config ---');
        const [rows] = await connection.query('SELECT id, system_code, system_name FROM vw_aluminum_system_config');
        console.log(JSON.stringify(rows, null, 2));

        console.log('\n--- Distinct aluminum_system from aluminum_systems ---');
        const [rows2] = await connection.query('SELECT DISTINCT aluminum_system FROM aluminum_systems');
        console.log(JSON.stringify(rows2, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkData();
