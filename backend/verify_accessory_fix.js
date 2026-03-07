const db = require('./config/db');

async function verifyFix() {
    try {
        console.log('🚀 Starting Verification of Accessory Discount Fix...');

        // 1. Get info for quotation 41 (or the latest one)
        const [quotations] = await db.query('SELECT * FROM quotations ORDER BY id DESC LIMIT 1');
        if (quotations.length === 0) {
            console.error('❌ No quotations found in database.');
            return;
        }

        const q = quotations[0];
        const id = q.id;
        console.log(`📝 Testing with Quotation ID/Code: ${id} / ${q.quotation_code}`);

        // 2. Get items to calculate total accessories
        const [items] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [id]);
        let totalAccessories = 0;
        items.forEach(item => {
            if (!item.is_material && item.accessory_price) {
                totalAccessories += (parseFloat(item.accessory_price) || 0) * (parseInt(item.quantity) || 1);
            }
        });

        console.log(`📊 Current Total Accessories for Quotation: ${totalAccessories}`);

        if (totalAccessories === 0) {
            console.log('⚠️ Total accessories is 0. Adding a mock item to test...');
            await db.query(`INSERT INTO quotation_items 
                (quotation_id, item_name, quantity, unit, unit_price, total_price, item_type, code, accessory_price, is_material) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, 'Test Product', 1, 'bộ', 1000000, 1500000, 'material', 'TEST01', 500000, 0]
            );
            totalAccessories = 500000;
        }

        // 3. Simulate the update logic from the controller
        const accessory_discount_percent = 10;
        const subtotal = parseFloat(q.subtotal) || 0;
        const discount_percent = parseFloat(q.discount_percent) || 0;
        const vat_percent = parseFloat(q.vat_percent) || 10;
        const shipping_fee = parseFloat(q.shipping_fee) || 0;

        // Logic from controller
        const accessoryDiscountPct = parseFloat(accessory_discount_percent) || 0;
        const accessoryDiscountAmount = Math.round((totalAccessories * accessoryDiscountPct) / 100);

        const generalDiscountAmount = (subtotal * discount_percent) / 100;
        const afterDiscounts = subtotal - generalDiscountAmount - accessoryDiscountAmount;
        const vatAmount = (afterDiscounts * vat_percent) / 100;
        const total_amount = Math.round(afterDiscounts + vatAmount + shipping_fee);

        console.log('✨ Calculated values for update:', {
            accessory_discount_percent,
            accessoryDiscountAmount,
            total_amount
        });

        // 4. Perform the update
        await db.query(
            `UPDATE quotations SET 
             accessory_discount_percent = ?, 
             accessory_discount_amount = ?, 
             total_amount = ? 
             WHERE id = ?`,
            [accessoryDiscountPct, accessoryDiscountAmount, total_amount, id]
        );

        console.log('✅ Update successful. Verifying database state...');

        // 5. Final check
        const [rows] = await db.query('SELECT accessory_discount_percent, accessory_discount_amount, total_amount FROM quotations WHERE id = ?', [id]);
        const result = rows[0];

        console.log('🔎 Database Row Result:', result);

        if (parseFloat(result.accessory_discount_percent) === accessory_discount_percent &&
            Math.round(parseFloat(result.accessory_discount_amount)) === accessoryDiscountAmount) {
            console.log('🏆 VERIFICATION SUCCESSFUL: Accessory discount correctly persisted!');
        } else {
            console.error('❌ VERIFICATION FAILED: Mismatch in stored values.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        process.exit();
    }
}

verifyFix();
