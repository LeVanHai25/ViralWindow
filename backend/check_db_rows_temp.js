const mysql = require("mysql2/promise");
const fs = require('fs');
const path = require('path');

async function checkTables() {
    // Manually load .env if needed, or just use defaults
    const dbConfig = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'viral_window_db',
        port: 3306
    };

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [tables] = await connection.query("SHOW TABLES");
        const tableKey = Object.keys(tables[0])[0];

        console.log("| Table Name | Row Count | Status |");
        console.log("|------------|-----------|--------|");

        for (const row of tables) {
            const tableName = row[tableKey];
            try {
                const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                const count = countResult[0].count;
                let status = count > 0 ? "Active" : "Empty";
                console.log(`| ${tableName} | ${count} | ${status} |`);
            } catch (e) {
                console.log(`| ${tableName} | ERROR | ${e.message} |`);
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await connection.end();
    }
}

checkTables();
