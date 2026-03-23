const db = require('./backend/config/db');
async function check() {
  try {
    const [projs] = await db.query("SELECT id FROM projects WHERE project_code = 'VR018'");
    if (projs.length === 0) { console.log('Proj not found'); process.exit(0); }
    const pid = projs[0].id;
    console.log('Project ID:', pid);
    const [rows] = await db.query("SELECT material_type, status FROM order_material_status WHERE order_id = ?", [pid]);
    console.log(rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
