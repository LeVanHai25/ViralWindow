const db = require('./config/db');

async function checkTable() {
    try {
        const [result] = await db.query('SHOW TABLES LIKE "financial_transaction_items"');
        console.log('Table exists:', result.length > 0);

        if (result.length === 0) {
            console.log('Creating financial_transaction_items table...');
            await db.query(`
                CREATE TABLE IF NOT EXISTS financial_transaction_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    transaction_id INT NOT NULL,
                    item_type ENUM('product', 'material', 'service', 'deposit', 'labor', 'transport', 'other') 
                        NOT NULL DEFAULT 'other',
                    item_name VARCHAR(255) NOT NULL,
                    item_code VARCHAR(50) NULL,
                    specification VARCHAR(255) NULL,
                    quantity DECIMAL(15,3) DEFAULT 1,
                    unit VARCHAR(20) DEFAULT 'cai',
                    unit_price DECIMAL(15,2) DEFAULT 0,
                    discount_percent DECIMAL(5,2) DEFAULT 0,
                    amount DECIMAL(15,2) NOT NULL,
                    source_type VARCHAR(50) NULL,
                    source_id INT NULL,
                    note TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (transaction_id) REFERENCES financial_transactions(id) ON DELETE CASCADE,
                    INDEX idx_transaction_id (transaction_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('Table created successfully!');
        }

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

checkTable();
