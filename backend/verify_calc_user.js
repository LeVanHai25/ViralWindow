function verifyCalculation() {
    console.log('🚀 Verifying Quotation Calculation with User Data...');

    // User Data from Screenshot
    const items = [
        { name: 'Vách kính 1', area: 1.0, unitPrice: 1410000, accessoryPrice: 0, quantity: 1, isMaterial: true },
        { name: 'Cửa sổ 2', area: 1.74, unitPrice: 1590000, accessoryPrice: 662000, quantity: 1, isMaterial: false },
        { name: 'Vách kính 3', area: 1.0, unitPrice: 1700000, accessoryPrice: 0, quantity: 1, isMaterial: true }
    ];

    const accessoryDiscountPercent = 10;
    const vatPercent = 0; // VAT removed as per user request
    const shippingFee = 0;
    const generalDiscountPercent = 0;

    // Calculation Logic (same as implemented in frontend/backend)
    let totalMaterial = 0;
    let totalAccessories = 0;

    items.forEach(item => {
        const materialPart = Math.round(item.area * item.unitPrice * item.quantity);
        const accessoryPart = Math.round(item.accessoryPrice * item.quantity);

        totalMaterial += materialPart;
        totalAccessories += accessoryPart;

        console.log(`- Item: ${item.name} | Material: ${materialPart} | Accessory: ${accessoryPart}`);
    });

    const subtotal = totalMaterial + totalAccessories;
    const generalDiscountAmount = Math.round(subtotal * (generalDiscountPercent / 100));
    const accessoryDiscountAmount = Math.round(totalAccessories * (accessoryDiscountPercent / 100));

    const taxableAmount = subtotal - generalDiscountAmount - accessoryDiscountAmount;
    const vatAmount = Math.round(taxableAmount * (vatPercent / 100));
    const finalTotal = taxableAmount + vatAmount + shippingFee;

    console.log('---------------------------');
    console.log(`📊 Result:`);
    console.log(`- Total Material:   ${totalMaterial.toLocaleString()} ₫`);
    console.log(`- Total Accessories: ${totalAccessories.toLocaleString()} ₫`);
    console.log(`- Acc. Discount (10%): -${accessoryDiscountAmount.toLocaleString()} ₫`);
    console.log(`- VAT (0%):          ${vatAmount.toLocaleString()} ₫`);
    console.log(`- FINAL TOTAL:      ${finalTotal.toLocaleString()} ₫`);

    const expectedTotal = 6472400;
    if (finalTotal === expectedTotal) {
        console.log('\n🏆 SUCCESS: Calculation matches user expectations!');
    } else {
        console.error(`\n❌ FAILURE: Mismatch! Expected ${expectedTotal.toLocaleString()} but got ${finalTotal.toLocaleString()}`);
    }
}

verifyCalculation();
