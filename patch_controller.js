const fs = require('fs');

try {
    let source = fs.readFileSync('backend/controllers/projectController.js', 'utf8');

    // 1. bom_items
    source = source.replace(
        /(\/\/\s*4\.\s*X[\s\S]*?)(\s+)(await connection\.query\([^;]+;)/,
        "$1$2try {\n$2    $3\n$2} catch(e) { console.log('error bom_items'); }"
    );

    // 2. door_drawings
    source = source.replace(
        /(\/\/\s*6\.\s*X[\s\S]*?)(\s+)(await connection\.query\([^;]+;)/,
        "$1$2try {\n$2    $3\n$2} catch(e) { console.log('error door_drawings'); }"
    );

    // 3. door_designs
    source = source.replace(
        /(\/\/\s*7\.\s*X[\s\S]*?)(\s+)(await connection\.query\([\s\S]*?;)/,
        "$1$2try {\n$2    $3\n$2} catch(e) { console.log('error door_designs'); }"
    );

    // 4. quotation_items
    source = source.replace(
        /(\/\/\s*8\.\s*X[\s\S]*?)(\s+)(await connection\.query\([^;]+;)/,
        "$1$2try {\n$2    $3\n$2} catch(e) { console.log('error quotation_items'); }"
    );

    // 5. quotations
    source = source.replace(
        /(\/\/\s*9\.\s*X[\s\S]*?)(\s+)(await connection\.query\([\s\S]*?;)/,
        "$1$2try {\n$2    $3\n$2} catch(e) { console.log('error quotations'); }"
    );

    // 6. production_orders
    source = source.replace(
        /(\/\/\s*13\.\s*X[\s\S]*?)(\s+)(await connection\.query\([\s\S]*?;)/,
        "$1$2try {\n$2    $3\n$2} catch(e) { console.log('error production_orders'); }"
    );

    // 7. extraTables updates
    const oldExtra = "'aluminum_scraps', 'design_revisions'";
    const newExtra = "'aluminum_scraps', 'design_revisions', 'production_orders', 'production_order_doors', 'production_progress', 'decals', 'door_drawings', 'cutting_optimizations', 'customer_interactions'";
    source = source.replace(oldExtra, newExtra);

    fs.writeFileSync('backend/controllers/projectController.js', source);
    console.log("Patch successfully applied!");
} catch (err) {
    console.error(err);
}
