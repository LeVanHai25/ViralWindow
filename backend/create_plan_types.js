const db = require('./config/db');

async function run() {
    try {
        await db.query(`DROP TABLE IF EXISTS work_plan_types`);
        await db.query(`
            CREATE TABLE work_plan_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type_code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                color VARCHAR(50) NOT NULL,
                bg_class VARCHAR(50) NOT NULL,
                border_class VARCHAR(50) NOT NULL,
                hex_bg VARCHAR(20) NOT NULL,
                bg VARCHAR(50) NOT NULL,
                is_active INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("work_plan_types table ensured.");

        // Insert default data if empty
        const [rows] = await db.query('SELECT COUNT(*) as count FROM work_plan_types');
        if (rows[0].count === 0) {
            const defaults = [
                ['meeting', 'Họp công ty', '<i class="fa-solid fa-users"></i>', 'text-teal-700', 'bg-teal-500', 'border-teal-400', '#e6fffa', 'bg-teal-100'],
                ['client', 'Gặp khách hàng', '<i class="fa-solid fa-handshake"></i>', 'text-amber-700', 'bg-amber-500', 'border-amber-400', '#fef3c7', 'bg-amber-100'],
                ['survey', 'Đo đạc / Khảo sát', '<i class="fa-solid fa-ruler-combined"></i>', 'text-rose-700', 'bg-rose-500', 'border-rose-400', '#ffe4e6', 'bg-rose-100'],
                ['supervision', 'Giám sát CT', '<i class="fa-solid fa-helmet-safety"></i>', 'text-orange-700', 'bg-orange-500', 'border-orange-400', '#ffedd5', 'bg-orange-100'],
                ['internal', 'Công việc nội bộ', '<i class="fa-solid fa-list-check"></i>', 'text-slate-700', 'bg-slate-500', 'border-slate-400', '#f1f5f9', 'bg-slate-200']
            ];
            for (let d of defaults) {
                await db.query(`INSERT INTO work_plan_types (type_code, name, icon, color, bg_class, border_class, hex_bg, bg) VALUES (?,?,?,?,?,?,?,?)`, d);
            }
            console.log("Inserted default plan types.");
        } else {
            console.log("Table work_plan_types already has data.");
        }
        process.exit(0);
    } catch (e) {
        console.error("FULL ERROR:", e);
        if(e.sqlMessage) console.error("SQL_MESSAGE:", e.sqlMessage);
        if(e.sqlState) console.error("SQL_STATE:", e.sqlState);
        process.exit(1);
    }
}
run();
