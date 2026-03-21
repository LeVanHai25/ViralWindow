const mysql = require('mysql2/promise');
const config = require('./config/db');

async function debug() {
    // get raw config if it's wrapped
    const pool = await mysql.createPool(config.pool || config);
    try {
        console.log("Projects matching VRB018:");
        const [projects] = await pool.query("SELECT id, name FROM projects WHERE name LIKE '%VRB018%'");
        console.log(projects);

        if (projects.length > 0) {
            const pid = projects[0].id;
            console.log(`\nproject_materials for project ${pid}:`);
            const [materials] = await pool.query("SELECT id, material_type, material_name, quantity FROM project_materials WHERE project_id = ?", [pid]);
            console.log(materials);
            
            console.log(`\nbom_items for project ${pid}:`);
            const [bomItems] = await pool.query(`
                SELECT bi.item_type, bi.item_name, bi.quantity 
                FROM bom_items bi
                JOIN door_designs dd ON bi.design_id = dd.id
                WHERE dd.project_id = ?
            `, [pid]);
            console.log(bomItems.slice(0, 10)); // just first 10
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
debug();
