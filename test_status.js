const db = require('./backend/config/db');
async function check() {
  try {
    const [rows] = await db.query("SELECT * FROM order_material_status WHERE order_id = 18");
    console.log(rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
