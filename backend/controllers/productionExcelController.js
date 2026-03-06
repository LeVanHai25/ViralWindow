/**
 * Production Excel Controller - Standard Logic Implementation
 * Synced 100% with Kanban, proper enums and computed fields
 */

const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// ============================================
// ENUMS (Chuẩn hoá)
// ============================================
const STAGES = new Set(["quotation", "design", "estimation", "production", "installation", "handover"]);
const STATUSES = new Set(["draft", "in_progress", "on_hold", "completed", "cancelled"]);

const MATERIAL_GROUPS = ["GLASS", "ALUMINUM", "HARDWARE", "ACCESSORY"];
const MATERIAL_STATUS = new Set(["NONE", "MISSING", "PARTIAL", "ORDERED", "READY", "ARRIVED", "ISSUED", "DELIVERED", "CUSTOMER_PROVIDED"]);
const PENDING_MAT = new Set(["MISSING", "PARTIAL", "ORDERED", "CUSTOMER_PROVIDED"]);

// Material group labels for display
const MATERIAL_GROUP_LABEL = {
    GLASS: "Kính",
    ALUMINUM: "Nhôm",
    HARDWARE: "Phụ kiện",
    ACCESSORY: "Vật tư phụ"
};

// Stage label mapping (for consistency)
const STAGE_LABEL = {
    quotation: "Báo giá",
    design: "Thiết kế",
    estimation: "Bóc tách",
    production: "Sản xuất",
    installation: "Lắp đặt",
    handover: "Bàn giao"
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function startOfTodayLocal() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Normalize material code for consistent lookup
 * Removes dashes, spaces and normalizes to lowercase
 * Example: "K-22" -> "k22", "K 22" -> "k22", "K22" -> "k22"
 */
function normalizeCode(code) {
    if (!code) return '';
    return code.toString().replace(/[-\s]/g, '').toLowerCase().trim();
}

/**
 * Normalize materials to always return 4 groups
 * @param {Array} materials - Raw materials from DB
 * @returns {Array} - Normalized 4 groups
 */
function normalizeMaterials(materials = []) {
    const map = new Map(materials.map(m => [m.group || m.material_type, m]));
    return MATERIAL_GROUPS.map(g => {
        const m = map.get(g);
        if (m) {
            return {
                group: g,
                status: MATERIAL_STATUS.has(m.status) ? m.status : "NONE",
                planDate: m.plan_date || m.planDate || null,
                actualDate: m.actual_date || m.actualDate || null,
                note: m.note || "",
                updatedAt: m.updated_at || m.updatedAt || null,
                updatedBy: m.updated_by || m.updatedBy || null
            };
        }
        return {
            group: g,
            status: "NONE",
            planDate: null,
            actualDate: null,
            note: "",
            updatedAt: null,
            updatedBy: null
        };
    });
}

/**
 * Compute isOverdue flag
 * @param {string|Date} deliveryPlanDate 
 * @param {string} status 
 * @returns {boolean}
 */
function computeIsOverdue(deliveryPlanDate, status) {
    if (!deliveryPlanDate) return false;
    if (status === "completed" || status === "cancelled") return false;
    const today = startOfTodayLocal();
    const d = new Date(deliveryPlanDate);
    d.setHours(0, 0, 0, 0);
    return d < today;
}

/**
 * Compute overall material status with priority: MISSING > PARTIAL > ORDERED > READY > NONE
 * @param {Array} materialsNorm - Normalized 4 groups
 * @returns {string}
 */
function computeMaterialOverallStatus(materialsNorm) {
    const statuses = materialsNorm.map(m => m.status);

    const allNone = statuses.every(s => s === "NONE");
    if (allNone) return "NONE";

    if (statuses.some(s => s === "MISSING")) return "MISSING";
    if (statuses.some(s => s === "PARTIAL")) return "PARTIAL";
    if (statuses.some(s => s === "ORDERED")) return "ORDERED";

    // ISSUED if all groups are ISSUED/DELIVERED/READY
    const allIssued = statuses.every(s => s === "ISSUED");
    if (allIssued) return "ISSUED";

    // READY if all groups are READY, DELIVERED, ARRIVED, or ISSUED
    const allReady = statuses.every(s => (s === "READY" || s === "DELIVERED" || s === "ARRIVED" || s === "ISSUED"));
    if (allReady) return "READY";

    // Fallback safe (has NONE mixed with others)
    return "PARTIAL";
}

/**
 * Compute array of unique material statuses sorted by priority for multi-badge display.
 * Priority order: MISSING > PARTIAL > ORDERED > READY > DELIVERED
 * Also returns details for tooltip (which group has which status).
 * @param {Array} materialsNorm - Normalized 4 groups
 * @returns {Object} { statuses: string[], details: [{group, groupLabel, status}] }
 */
function computeMaterialStatusArray(materialsNorm) {
    // Priority order: most urgent first
    const PRIORITY_ORDER = ["MISSING", "PARTIAL", "ORDERED", "CUSTOMER_PROVIDED", "READY", "ARRIVED", "ISSUED", "DELIVERED", "NONE"];

    // Get unique statuses (excluding NONE unless it's the only one)
    const statusSet = new Set(materialsNorm.map(m => m.status));
    const uniqueStatuses = [...statusSet];

    // If all NONE, return single NONE
    if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "NONE") {
        return {
            statuses: ["NONE"],
            details: materialsNorm.map(m => ({
                group: m.group,
                groupLabel: MATERIAL_GROUP_LABEL[m.group] || m.group,
                status: m.status
            }))
        };
    }

    // Filter out NONE if there are other statuses, then sort by priority
    const filtered = uniqueStatuses.filter(s => s !== "NONE");
    const sorted = filtered.sort((a, b) => {
        return PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b);
    });

    // Build details for tooltip
    const details = materialsNorm.map(m => ({
        group: m.group,
        groupLabel: MATERIAL_GROUP_LABEL[m.group] || m.group,
        status: m.status
    }));

    return {
        statuses: sorted,
        details: details
    };
}


/**
 * Compute minimum material plan date for pending materials
 * @param {Array} materialsNorm - Normalized 4 groups
 * @returns {string|null} - YYYY-MM-DD format or null
 */
function computeMaterialPlanDate(materialsNorm) {
    const dates = materialsNorm
        .filter(m => PENDING_MAT.has(m.status) && m.planDate)
        .map(m => new Date(m.planDate));
    if (!dates.length) return null;
    dates.sort((a, b) => a - b);
    return dates[0].toISOString().slice(0, 10);
}

/**
 * Parse and validate filter parameters
 */
function parseFilters(req) {
    const {
        stage, status, overdue,
        productionUnitId,
        fromDate, toDate,
        q,
        page = 1, pageSize = 50,
        sortBy = "deliveryPlanDate", sortDir = "desc"
    } = req.query;

    // Validate enums
    if (stage && !STAGES.has(stage)) {
        throw new Error("Invalid stage: " + stage);
    }
    if (status && !STATUSES.has(status)) {
        throw new Error("Invalid status: " + status);
    }
    if (overdue && !["true", "false"].includes(String(overdue))) {
        throw new Error("Invalid overdue value");
    }

    return {
        stage: stage || null,
        status: status || null,
        overdue: overdue ? overdue === "true" : null,
        productionUnitId: productionUnitId || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
        q: q || null,
        page: Math.max(1, Number(page) || 1),
        pageSize: Math.min(200, Math.max(1, Number(pageSize) || 50)),
        sortBy,
        sortDir: String(sortDir).toLowerCase() === "asc" ? "ASC" : "DESC"
    };
}

// ============================================
// Category to Material Group Mapping
// material_requests.category -> MATERIAL_GROUPS
// ============================================
const CATEGORY_TO_GROUP = {
    'nhom': 'ALUMINUM',
    'kinh': 'GLASS',
    'phukien': 'HARDWARE',
    'vattu': 'ACCESSORY'
};

/**
 * Get material requests data for projects
 * Reads from purchase_requests table (where design-new.html saves data)
 * Returns: { projectId: { ALUMINUM: {planDate, note}, GLASS: {...}, ... } }
 */
async function getMaterialRequestsData(projectIds) {
    if (!projectIds || projectIds.length === 0) return {};

    // Query from purchase_requests table - this is where design-new.html saves material requests
    const [requests] = await db.query(`
        SELECT 
            project_id,
            required_date,
            nhom_data,
            kinh_data,
            phukien_data,
            vattu_data,
            notes,
            status,
            created_at
        FROM purchase_requests
        WHERE project_id IN (?) AND status != 'rejected'
        ORDER BY created_at DESC
    `, [projectIds]);

    const map = {};

    // Process each purchase request
    requests.forEach(r => {
        const pid = r.project_id;
        if (!pid) return;

        if (!map[pid]) map[pid] = {};

        // Check each category and update if we have data
        // Only take first (most recent due to ORDER BY DESC) request per category

        // ALUMINUM (nhom)
        if (r.nhom_data) {
            try {
                const nhomItems = typeof r.nhom_data === 'string' ? JSON.parse(r.nhom_data) : r.nhom_data;
                if (Array.isArray(nhomItems) && nhomItems.length > 0 && !map[pid]['ALUMINUM']) {
                    map[pid]['ALUMINUM'] = {
                        planDate: r.required_date,
                        note: r.notes || '',
                        requestStatus: r.status,
                        itemCount: nhomItems.length
                    };
                }
            } catch (e) { /* ignore parse errors */ }
        }

        // GLASS (kinh)
        if (r.kinh_data) {
            try {
                const kinhItems = typeof r.kinh_data === 'string' ? JSON.parse(r.kinh_data) : r.kinh_data;
                if (Array.isArray(kinhItems) && kinhItems.length > 0 && !map[pid]['GLASS']) {
                    map[pid]['GLASS'] = {
                        planDate: r.required_date,
                        note: r.notes || '',
                        requestStatus: r.status,
                        itemCount: kinhItems.length
                    };
                }
            } catch (e) { /* ignore parse errors */ }
        }

        // HARDWARE (phukien)
        if (r.phukien_data) {
            try {
                const phukienItems = typeof r.phukien_data === 'string' ? JSON.parse(r.phukien_data) : r.phukien_data;
                if (Array.isArray(phukienItems) && phukienItems.length > 0 && !map[pid]['HARDWARE']) {
                    map[pid]['HARDWARE'] = {
                        planDate: r.required_date,
                        note: r.notes || '',
                        requestStatus: r.status,
                        itemCount: phukienItems.length
                    };
                }
            } catch (e) { /* ignore parse errors */ }
        }

        // ACCESSORY (vattu)
        if (r.vattu_data) {
            try {
                const vattuItems = typeof r.vattu_data === 'string' ? JSON.parse(r.vattu_data) : r.vattu_data;
                if (Array.isArray(vattuItems) && vattuItems.length > 0 && !map[pid]['ACCESSORY']) {
                    map[pid]['ACCESSORY'] = {
                        planDate: r.required_date,
                        note: r.notes || '',
                        requestStatus: r.status,
                        itemCount: vattuItems.length
                    };
                }
            } catch (e) { /* ignore parse errors */ }
        }
    });

    // Also try to read from material_requests table for backwards compatibility
    try {
        const [oldRequests] = await db.query(`
            SELECT 
                project_id,
                category,
                required_date,
                notes,
                status
            FROM material_requests
            WHERE project_id IN (?) AND status != 'rejected'
            ORDER BY required_date ASC
        `, [projectIds]);

        oldRequests.forEach(r => {
            const pid = r.project_id;
            const group = CATEGORY_TO_GROUP[r.category];
            if (!group || !pid) return;

            if (!map[pid]) map[pid] = {};
            // Only set if not already set from purchase_requests
            if (!map[pid][group]) {
                map[pid][group] = {
                    planDate: r.required_date,
                    note: r.notes || '',
                    requestStatus: r.status
                };
            }
        });
    } catch (e) {
        // material_requests table might not exist, ignore error
        console.log('Note: material_requests table not available, using purchase_requests only');
    }

    return map;
}

/**
 * Calculate total aluminum weight from project_materials for multiple projects
 * Công thức: Khối lượng (kg) = Mật độ (kg/m) × Chiều dài (m) × Số cây
 * Returns: { projectId: weightInKg }
 */
async function calculateAluminumWeightFromBOM(projectIds) {
    if (!projectIds || projectIds.length === 0) return {};

    const weights = {};
    projectIds.forEach(pid => { weights[pid] = 0; });

    try {
        // Get all aluminum materials for these projects
        const [materials] = await db.query(`
            SELECT 
                pm.project_id,
                pm.quantity,
                pm.notes
            FROM project_materials pm
            WHERE pm.project_id IN (?) AND pm.material_type = 'aluminum'
        `, [projectIds]);

        materials.forEach(row => {
            const pid = row.project_id;
            let weight = 0;

            // Try to get weight from notes JSON
            if (row.notes) {
                try {
                    const notesData = typeof row.notes === 'string' ? JSON.parse(row.notes) : row.notes;

                    // Priority 1: Check for weight_kg directly (already calculated by frontend)
                    // ✅ Frontend tính và lưu weight_kg = density × length_m × quantity
                    if (notesData.weight_kg && parseFloat(notesData.weight_kg) > 0) {
                        weight = parseFloat(notesData.weight_kg) || 0;
                    }
                    // Priority 2: Calculate from density × length_m × quantity
                    // Công thức: weight = density (kg/m) × length (m) × số cây
                    else if (notesData.density && row.quantity) {
                        const density = parseFloat(notesData.density) || 0;
                        const quantity = parseFloat(row.quantity) || 0;
                        // ✅ Sử dụng length_m mặc định = 1m (cho thanh đã cắt theo BOM)
                        // Nếu là thanh nguyên 6m, frontend sẽ lưu length_m = 6
                        const lengthM = parseFloat(notesData.length_m) || 1;
                        weight = density * lengthM * quantity;
                    }
                    // Fallback: estimate with conservative default (density 0.3 kg/m × 1m)
                    else if (row.quantity) {
                        weight = (parseFloat(row.quantity) || 0) * 0.3 * 1;
                    }
                } catch (e) {
                    // Notes is not valid JSON, use conservative fallback
                    if (row.quantity) {
                        weight = (parseFloat(row.quantity) || 0) * 0.3 * 1;
                    }
                }
            } else if (row.quantity) {
                // No notes, estimate with conservative default (density 0.3 kg/m × 1m)
                weight = (parseFloat(row.quantity) || 0) * 0.3 * 1;
            }

            weights[pid] = (weights[pid] || 0) + weight;
        });

        console.log(`📊 calculateAluminumWeightFromBOM: Calculated weights for ${Object.keys(weights).length} projects`);
    } catch (e) {
        console.warn('Error calculating aluminum weight from BOM:', e.message);
    }

    return weights;
}

/**
 * Calculate material status from project_materials table vs actual inventory stock
 * Data source: project_materials (saved BOM data from design-new.html)
 * Returns: { projectId: { ALUMINUM: 'READY'|'PARTIAL'|'MISSING', ... } }
 */
async function calculateMaterialStatusFromBOM(projectIds) {
    if (!projectIds || projectIds.length === 0) return {};

    const map = {};

    // Initialize all projects with NONE status
    projectIds.forEach(pid => {
        map[pid] = {
            ALUMINUM: 'NONE',
            GLASS: 'NONE',
            HARDWARE: 'NONE',
            ACCESSORY: 'NONE'
        };
    });

    // =============================================
    // Get all project_materials for these projects
    // =============================================
    try {
        const [materials] = await db.query(`
            SELECT 
                pm.project_id,
                pm.material_type,
                pm.material_code,
                pm.material_name,
                pm.quantity
            FROM project_materials pm
            WHERE pm.project_id IN (?)
              AND pm.material_type IN ('aluminum', 'glass', 'accessory', 'phukien')
        `, [projectIds]);

        // Group by project and type
        const byProject = {};
        materials.forEach(row => {
            const pid = row.project_id;
            if (!byProject[pid]) {
                byProject[pid] = { aluminum: [], glass: [], accessory: [], phukien: [] };
            }
            byProject[pid][row.material_type].push(row);
        });

        console.log(`📊 calculateMaterialStatusFromBOM: Found materials for ${Object.keys(byProject).length} projects`);

        // =============================================
        // Get stock data - do this once for efficiency
        // =============================================

        // Aluminum stock
        let aluStock = {};
        try {
            const [aluSys] = await db.query(`SELECT code, quantity_m FROM aluminum_systems`);
            aluSys.forEach(a => {
                aluStock[(a.code || '').toLowerCase()] = parseFloat(a.quantity_m) || 0;
            });
        } catch (e) { }

        const [aluInv] = await db.query(`SELECT item_code, quantity FROM inventory WHERE item_type IN ('aluminum', 'profile', 'frame')`);
        aluInv.forEach(inv => {
            const key = (inv.item_code || '').toLowerCase();
            aluStock[key] = (aluStock[key] || 0) + (parseFloat(inv.quantity) || 0);
        });

        // Glass stock - ✅ FIX: Store both normalized and raw keys for flexible matching
        let glassStock = {};
        try {
            // ✅ FIX: Use 'name' column instead of 'glass_type' (glass_type doesn't exist in glass_items table!)
            const [glassItems] = await db.query(`SELECT code, name, quantity FROM glass_items`);
            glassItems.forEach(g => {
                // Use g.name instead of g.glass_type
                const rawCode = g.code || g.name || '';
                const rawKey = rawCode.toLowerCase();
                const normalizedKey = normalizeCode(rawCode);
                const qty = parseFloat(g.quantity) || 0;

                // Store with both keys for flexible lookup
                glassStock[rawKey] = (glassStock[rawKey] || 0) + qty;
                if (normalizedKey && normalizedKey !== rawKey) {
                    glassStock[normalizedKey] = (glassStock[normalizedKey] || 0) + qty;
                }
            });
            console.log(`📊 calculateMaterialStatusFromBOM: Loaded ${Object.keys(glassStock).length} glass stock keys`);
        } catch (e) {
            console.error('❌ Error loading glass stock:', e.message);
        }

        const [glassInv] = await db.query(`SELECT item_code, quantity FROM inventory WHERE item_type = 'glass'`);
        glassInv.forEach(inv => {
            const rawCode = inv.item_code || '';
            const rawKey = rawCode.toLowerCase();
            const normalizedKey = normalizeCode(rawCode);
            const qty = parseFloat(inv.quantity) || 0;

            // Store with both keys for flexible lookup
            glassStock[rawKey] = (glassStock[rawKey] || 0) + qty;
            if (normalizedKey && normalizedKey !== rawKey) {
                glassStock[normalizedKey] = (glassStock[normalizedKey] || 0) + qty;
            }
        });

        // Accessories stock (for both phukien and accessory)
        const accStock = {};
        const [accessories] = await db.query(`SELECT id, code, name, stock_quantity FROM accessories`);
        accessories.forEach(acc => {
            const keyCode = (acc.code || '').toLowerCase();
            const keyName = (acc.name || '').toLowerCase();
            const stock = parseFloat(acc.stock_quantity) || 0;
            if (keyCode) accStock[keyCode] = stock;
            if (keyName) accStock[keyName] = stock;
        });

        // =============================================
        // Calculate status for each project
        // =============================================
        for (const [projectId, data] of Object.entries(byProject)) {
            // Parse notes to get codes if needed
            const parseCode = (row) => {
                let code = row.material_code;
                if (!code && row.notes) {
                    try {
                        const extra = JSON.parse(row.notes);
                        code = extra.code;
                    } catch (e) { }
                }
                return (code || row.material_name || '').toLowerCase();
            };

            // ALUMINUM status
            if (data.aluminum.length > 0) {
                let hasAny = false, allReady = true;
                const itemStatuses = [];
                data.aluminum.forEach(item => {
                    const code = parseCode(item);
                    const required = parseFloat(item.quantity) || 0;
                    const available = aluStock[code] || 0;
                    if (available > 0) hasAny = true;
                    if (available < required) allReady = false;
                    // Track per-item status
                    const itemStatus = available >= required ? 'READY' : (available > 0 ? 'PARTIAL' : 'MISSING');
                    if (!itemStatuses.includes(itemStatus)) itemStatuses.push(itemStatus);
                });
                map[projectId].ALUMINUM = {
                    status: allReady ? 'READY' : (hasAny ? 'PARTIAL' : 'MISSING'),
                    itemStatuses: itemStatuses
                };
            }

            // GLASS status
            if (data.glass.length > 0) {
                let hasAny = false, allReady = true;
                const itemStatuses = [];
                data.glass.forEach(item => {
                    const code = parseCode(item);
                    const normalizedGlassCode = normalizeCode(code);
                    const required = parseFloat(item.quantity) || 1;
                    // ✅ FIX: Try both normalized and raw code for flexible matching
                    const available = glassStock[normalizedGlassCode] || glassStock[code] || 0;
                    if (available > 0) hasAny = true;
                    if (available < required) allReady = false;
                    // Track per-item status
                    const itemStatus = available >= required ? 'READY' : (available > 0 ? 'PARTIAL' : 'MISSING');
                    if (!itemStatuses.includes(itemStatus)) itemStatuses.push(itemStatus);
                });
                map[projectId].GLASS = {
                    status: allReady ? 'READY' : (hasAny ? 'PARTIAL' : 'MISSING'),
                    itemStatuses: itemStatuses
                };
            }

            // HARDWARE status (phukien = Phụ kiện)
            if (data.phukien.length > 0) {
                let hasAny = false, allReady = true;
                const itemStatuses = [];
                data.phukien.forEach(item => {
                    const code = parseCode(item);
                    const required = parseFloat(item.quantity) || 0;
                    const available = accStock[code] || 0;
                    if (available > 0) hasAny = true;
                    if (available < required) allReady = false;
                    // Track per-item status
                    const itemStatus = available >= required ? 'READY' : (available > 0 ? 'PARTIAL' : 'MISSING');
                    if (!itemStatuses.includes(itemStatus)) itemStatuses.push(itemStatus);
                });
                map[projectId].HARDWARE = {
                    status: allReady ? 'READY' : (hasAny ? 'PARTIAL' : 'MISSING'),
                    itemStatuses: itemStatuses
                };
            }

            // ACCESSORY status (accessory = Vật tư phụ)
            if (data.accessory.length > 0) {
                let hasAny = false, allReady = true;
                const itemStatuses = [];
                data.accessory.forEach(item => {
                    const code = parseCode(item);
                    const required = parseFloat(item.quantity) || 0;
                    const available = accStock[code] || 0;
                    if (available > 0) hasAny = true;
                    if (available < required) allReady = false;
                    // Track per-item status
                    const itemStatus = available >= required ? 'READY' : (available > 0 ? 'PARTIAL' : 'MISSING');
                    if (!itemStatuses.includes(itemStatus)) itemStatuses.push(itemStatus);
                });
                map[projectId].ACCESSORY = {
                    status: allReady ? 'READY' : (hasAny ? 'PARTIAL' : 'MISSING'),
                    itemStatuses: itemStatuses
                };
            }
        }
    } catch (e) {
        console.warn('Error calculating material status from BOM:', e.message);
    }

    return map;
}


// ============================================
// INTERNAL HELPER: Get orders data (shared by listOrders & exportExcel)
// This ensures 100% data consistency between frontend and Excel export
// ============================================
async function getOrdersData(req, options = {}) {
    const f = parseFilters(req);
    const noPagination = options.noPagination || false;

    // Build WHERE clause
    let whereConditions = ["1=1"];
    let params = [];

    // Stage filter
    if (f.stage) {
        whereConditions.push("p.status = ?");
        params.push(f.stage);
    }

    // Status filter (project status)
    if (f.status) {
        whereConditions.push("p.status = ?");
        params.push(f.status);
    } else {
        // Default: exclude cancelled/closed/completed
        whereConditions.push("p.status NOT IN ('cancelled', 'closed', 'completed')");
    }

    // Date range filter (deliveryPlanDate)
    if (f.fromDate) {
        whereConditions.push("p.deadline >= ?");
        params.push(f.fromDate);
    }
    if (f.toDate) {
        whereConditions.push("p.deadline <= ?");
        params.push(f.toDate + ' 23:59:59');
    }

    // Search filter
    if (f.q) {
        whereConditions.push("(p.project_code LIKE ? OR p.project_name LIKE ? OR c.full_name LIKE ?)");
        params.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Main query - get orders with customer/agency data
    let orderQuery = `
        SELECT 
            p.id,
            p.project_code AS orderCode,
            p.project_name AS orderName,
            p.status,
            p.deadline AS deliveryPlanDate,
            p.created_at AS createdAt,
            p.updated_at AS updatedAt,
            c.id AS customerId,
            c.full_name AS customerName,
            c.phone AS customerPhone,
            c.email AS customerEmail,
            c.address AS customerAddress,
            a.id AS branchId,
            a.name AS branchName,
            COALESCE(pas.total_weight_kg, 0) AS summaryWeight,
            p.manual_weight AS manualWeight,
            COALESCE(p.excel_note, '') AS note,
            COALESCE(p.fix_compatible, '') AS fixCompatible,
            COALESCE(p.workforce, '') AS workforce
        FROM projects p
        LEFT JOIN customers c ON c.id = p.customer_id
        LEFT JOIN agencies a ON a.id = c.agency_id
        LEFT JOIN project_aluminum_summary pas ON pas.project_id = p.id
        WHERE ${whereClause}
        ORDER BY p.deadline ${f.sortDir}, p.created_at DESC
    `;

    let queryParams = [...params];
    if (!noPagination) {
        orderQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(f.pageSize, (f.page - 1) * f.pageSize);
    }

    const [orders] = await db.query(orderQuery, queryParams);

    // Count total for pagination
    const [[{ total }]] = await db.query(`
        SELECT COUNT(*) as total 
        FROM projects p 
        LEFT JOIN customers c ON c.id = p.customer_id
        WHERE ${whereClause}
    `, params);

    // Get materials from order_material_status (fallback/manual overrides)
    const orderIds = orders.map(o => o.id);
    let materialsMap = {};
    let materialRequestsMap = {};
    let bomStatusMap = {};
    let aluminumWeightMap = {};

    if (orderIds.length > 0) {
        // 1. Get manual material status overrides from order_material_status
        const [materials] = await db.query(`
            SELECT 
                order_id,
                material_type AS \`group\`,
                status,
                plan_date AS planDate,
                actual_date AS actualDate,
                note,
                featured_products AS featuredProducts,
                quantity,
                updated_at AS updatedAt,
                updated_by AS updatedBy
            FROM order_material_status
            WHERE order_id IN (?)
        `, [orderIds]);

        materials.forEach(m => {
            if (!materialsMap[m.order_id]) materialsMap[m.order_id] = [];
            materialsMap[m.order_id].push(m);
        });

        // 2. Get material requests data (required_date, notes)
        materialRequestsMap = await getMaterialRequestsData(orderIds);

        // 3. Calculate material status from BOM + inventory (real-time check)
        bomStatusMap = await calculateMaterialStatusFromBOM(orderIds);

        // 4. Calculate aluminum weight from BOM
        aluminumWeightMap = await calculateAluminumWeightFromBOM(orderIds);
    }

    // Get company name
    let companyName = 'VIRALWINDOW';
    try {
        const [[company]] = await db.query('SELECT company_name FROM company_settings LIMIT 1');
        if (company && company.company_name) {
            companyName = company.company_name;
        }
    } catch (e) { }

    // Process each order with computed fields
    let data = orders.map(row => {
        // Get stored materials from order_material_status
        const storedMaterials = materialsMap[row.id] || [];

        // Get material request data for this order
        const requestData = materialRequestsMap[row.id] || {};

        // Get BOM-calculated status
        const bomStatus = bomStatusMap[row.id] || {};

        // Merge data with priority logic
        const mergedMaterials = MATERIAL_GROUPS.map(group => {
            const stored = storedMaterials.find(m =>
                (m.group || m.material_type) === group
            );
            const reqData = requestData[group] || {};
            const hasPurchaseRequest = reqData.planDate || reqData.itemCount > 0;

            // Get BOM status object (now has {status, itemStatuses})
            const bomStatusObj = bomStatus[group] || {};
            const bomGroupStatus = typeof bomStatusObj === 'string' ? bomStatusObj : (bomStatusObj.status || 'NONE');
            const bomItemStatuses = Array.isArray(bomStatusObj.itemStatuses) ? bomStatusObj.itemStatuses : [];

            // Calculate final status
            // ✅ Ưu tiên: ISSUED/ARRIVED (đã xuất/nhận kho thực tế) > DELIVERED > READY > BOM check
            let finalStatus = 'NONE';
            if (stored && stored.status === 'ISSUED') {
                // ĐÃ XUẤT KHO → ưu tiên cao nhất (đã hạch toán phiếu xuất)
                finalStatus = 'ISSUED';
            } else if (stored && stored.status === 'ARRIVED') {
                finalStatus = 'ARRIVED';
            } else if (stored && stored.status === 'DELIVERED') {
                finalStatus = 'DELIVERED';
            } else if (stored && stored.status === 'READY') {
                finalStatus = 'READY';
            } else if (bomGroupStatus === 'READY') {
                finalStatus = 'READY';
            } else if (hasPurchaseRequest) {
                if (stored && stored.status === 'ORDERED') {
                    finalStatus = 'ORDERED';
                } else if (bomGroupStatus === 'PARTIAL') {
                    finalStatus = 'PARTIAL';
                } else {
                    finalStatus = 'ORDERED';
                }
            } else if (bomGroupStatus === 'PARTIAL') {
                finalStatus = 'PARTIAL';
            } else if (bomGroupStatus === 'MISSING') {
                finalStatus = 'MISSING';
            } else if (stored && stored.status && MATERIAL_STATUS.has(stored.status)) {
                finalStatus = stored.status;
            }

            // Compute itemStatuses for multi-badge: merge stored status with BOM item statuses
            // ✅ If finalStatus is a terminal state (ISSUED/ARRIVED/DELIVERED), skip BOM merge
            //    BOM shows MISSING because stock was deducted after export — that's expected!
            let itemStatuses;
            if (finalStatus === 'ISSUED' || finalStatus === 'ARRIVED' || finalStatus === 'DELIVERED') {
                itemStatuses = [finalStatus];
            } else {
                itemStatuses = bomItemStatuses.length > 0 ? [...bomItemStatuses] : [];
                // If finalStatus differs from BOM, ensure it's included
                if (finalStatus !== 'NONE' && !itemStatuses.includes(finalStatus)) {
                    itemStatuses.unshift(finalStatus);
                }
                // Sort by priority: MISSING > PARTIAL > ORDERED > CUSTOMER_PROVIDED > READY > ARRIVED > ISSUED > DELIVERED
                const PRIORITY = ['MISSING', 'PARTIAL', 'ORDERED', 'CUSTOMER_PROVIDED', 'READY', 'ARRIVED', 'ISSUED', 'DELIVERED'];
                itemStatuses = [...new Set(itemStatuses)].sort((a, b) =>
                    PRIORITY.indexOf(a) - PRIORITY.indexOf(b)
                );
            }

            return {
                group,
                status: MATERIAL_STATUS.has(finalStatus) ? finalStatus : 'NONE',
                itemStatuses: itemStatuses.length > 0 ? itemStatuses : [finalStatus || 'NONE'], // Array of statuses for multi-badge
                planDate: reqData.planDate || (stored ? stored.planDate : null),
                actualDate: stored ? stored.actualDate : null,
                note: reqData.note || (stored ? stored.note : ''),
                featuredProducts: stored ? stored.featuredProducts : '',
                quantity: stored ? stored.quantity : '',
                updatedAt: stored ? stored.updatedAt : null,
                updatedBy: stored ? stored.updatedBy : null,
                hasPurchaseRequest: hasPurchaseRequest
            };
        });

        // Compute fields
        const isOverdue = computeIsOverdue(row.deliveryPlanDate, row.status);
        const materialOverallStatus = computeMaterialOverallStatus(mergedMaterials);
        const materialStatusData = computeMaterialStatusArray(mergedMaterials); // NEW: multi-status array
        const materialPlanDate = computeMaterialPlanDate(mergedMaterials);

        // Get aluminum weight: prioritize manual > calculated BOM weight > summary table > 0
        const manualWeight = parseFloat(row.manualWeight) || 0;
        const bomWeight = aluminumWeightMap[row.id] || 0;
        const summaryWeight = parseFloat(row.summaryWeight) || 0;
        const finalWeight = manualWeight > 0 ? manualWeight : (bomWeight > 0 ? bomWeight : summaryWeight);

        return {
            id: row.id,
            orderCode: row.orderCode,
            orderName: row.orderName,
            branch: {
                id: row.branchId,
                name: row.branchName || ''
            },
            customer: {
                id: row.customerId,
                name: row.customerName || '',
                phone: row.customerPhone || '',
                email: row.customerEmail || '',
                address: row.customerAddress || ''
            },
            quantity: parseFloat(finalWeight.toFixed(2)) || 0,
            status: row.status,
            createdAt: row.createdAt,
            deliveryPlanDate: row.deliveryPlanDate,
            updatedAt: row.updatedAt,
            note: row.note || '',
            fixCompatible: row.fixCompatible || '',
            workforce: row.workforce || '',

            // Computed fields
            isOverdue,
            materialOverallStatus,
            materialStatuses: materialStatusData.statuses,      // NEW: array of unique statuses (sorted by priority)
            materialStatusDetails: materialStatusData.details,  // NEW: details for tooltip [{group, groupLabel, status}]
            materialPlanDate,
            materials: mergedMaterials
        };
    });

    // Apply overdue filter if provided (computed filter)
    if (f.overdue !== null) {
        data = data.filter(x => x.isOverdue === f.overdue);
    }

    return {
        orders: data,
        meta: {
            page: f.page,
            pageSize: f.pageSize,
            total: total
        },
        companyName
    };
}

// ============================================
// GET /api/production/excel/orders
// List orders for Excel View with computed fields
// ============================================
exports.listOrders = async (req, res) => {
    try {
        const result = await getOrdersData(req);

        res.json({
            success: true,
            data: result.orders,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in listOrders:', error);
        res.status(400).json({
            success: false,
            error: error.message || "Bad Request"
        });
    }
};


// ============================================
// GET /api/production/excel/kpi
// KPI computed from filtered data (not hardcoded)
// ============================================
exports.getKpi = async (req, res) => {
    try {
        const f = parseFilters(req);

        // Build WHERE clause (same as listOrders but no pagination)
        let whereConditions = ["1=1"];
        let params = [];

        if (f.stage) {
            whereConditions.push("p.status = ?");
            params.push(f.stage);
        }

        if (f.status) {
            whereConditions.push("p.status = ?");
            params.push(f.status);
        } else {
            whereConditions.push("p.status NOT IN ('cancelled', 'closed', 'completed')");
        }

        if (f.fromDate) {
            whereConditions.push("p.deadline >= ?");
            params.push(f.fromDate);
        }
        if (f.toDate) {
            whereConditions.push("p.deadline <= ?");
            params.push(f.toDate + ' 23:59:59');
        }

        if (f.q) {
            whereConditions.push("(p.project_code LIKE ? OR p.project_name LIKE ? OR c.full_name LIKE ?)");
            params.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get all orders matching filter (no pagination for KPI)
        const [orders] = await db.query(`
            SELECT 
                p.id,
                p.status,
                p.deadline AS deliveryPlanDate
            FROM projects p
            LEFT JOIN customers c ON c.id = p.customer_id
            WHERE ${whereClause}
        `, params);

        // Get all materials
        const orderIds = orders.map(o => o.id);
        let materialsMap = {};

        if (orderIds.length > 0) {
            const [materials] = await db.query(`
                SELECT order_id, material_type AS \`group\`, status, featured_products AS featuredProducts, quantity
                FROM order_material_status
                WHERE order_id IN (?)
            `, [orderIds]);

            materials.forEach(m => {
                if (!materialsMap[m.order_id]) materialsMap[m.order_id] = [];
                materialsMap[m.order_id].push(m);
            });
        }

        // Compute KPIs
        let totalOrders = 0;
        let overdueCount = 0;
        let missingMaterialCount = 0;
        let inProductionCount = 0;
        let completedCount = 0;

        orders.forEach(row => {
            const materials = normalizeMaterials(materialsMap[row.id] || []);
            const isOverdue = computeIsOverdue(row.deliveryPlanDate, row.status);
            const materialOverallStatus = computeMaterialOverallStatus(materials);

            // Apply overdue filter if specified
            if (f.overdue !== null && isOverdue !== f.overdue) {
                return; // Skip this row
            }

            totalOrders++;

            if (isOverdue) overdueCount++;
            if (materialOverallStatus === "MISSING" || materialOverallStatus === "PARTIAL") {
                missingMaterialCount++;
            }
            if (row.status === "in_progress" || row.status === "production") {
                inProductionCount++;
            }
            if (row.status === "completed") {
                completedCount++;
            }
        });

        res.json({
            success: true,
            data: {
                totalOrders,
                overdue: overdueCount,
                missingMaterial: missingMaterialCount,
                inProduction: inProductionCount,
                completed: completedCount
            }
        });
    } catch (error) {
        console.error('Error in getKpi:', error);
        res.status(400).json({
            success: false,
            error: error.message || "Bad Request"
        });
    }
};

// ============================================
// GET /api/production/excel/orders/:id
// Get single order with full details
// ============================================
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const [[order]] = await db.query(`
            SELECT 
                p.id,
                p.project_code AS orderCode,
                p.project_name AS orderName,
                p.status,
                p.deadline AS deliveryPlanDate,
                p.created_at AS createdAt,
                p.updated_at AS updatedAt,
                c.id AS customerId,
                c.full_name AS customerName,
                a.id AS branchId,
                a.name AS branchName,
                COALESCE(pas.total_weight_kg, 0) AS summaryWeight
            FROM projects p
            LEFT JOIN customers c ON c.id = p.customer_id
            LEFT JOIN agencies a ON a.id = c.agency_id
            LEFT JOIN project_aluminum_summary pas ON pas.project_id = p.id
            WHERE p.id = ?
        `, [id]);

        // Calculate aluminum weight from BOM
        const aluminumWeightMap = await calculateAluminumWeightFromBOM([parseInt(id)]);
        const bomWeight = aluminumWeightMap[parseInt(id)] || 0;
        const summaryWeight = parseFloat(order?.summaryWeight) || 0;
        const finalWeight = bomWeight > 0 ? bomWeight : summaryWeight;

        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }

        // Get materials
        const [materials] = await db.query(`
            SELECT 
                material_type AS \`group\`,
                status,
                plan_date AS planDate,
                actual_date AS actualDate,
                note,
                featured_products AS featuredProducts,
                quantity,
                updated_at AS updatedAt,
                updated_by AS updatedBy
            FROM order_material_status
            WHERE order_id = ?
        `, [id]);

        const normalizedMaterials = normalizeMaterials(materials);
        const isOverdue = computeIsOverdue(order.deliveryPlanDate, order.status);
        const materialOverallStatus = computeMaterialOverallStatus(normalizedMaterials);
        const materialPlanDate = computeMaterialPlanDate(normalizedMaterials);

        res.json({
            success: true,
            data: {
                id: order.id,
                orderCode: order.orderCode,
                orderName: order.orderName,
                branch: { id: order.branchId, name: order.branchName || '' },
                customer: { id: order.customerId, name: order.customerName || '' },
                quantity: parseFloat(finalWeight.toFixed(2)) || 0,
                status: order.status,
                createdAt: order.createdAt,
                deliveryPlanDate: order.deliveryPlanDate,
                updatedAt: order.updatedAt,
                isOverdue,
                materialOverallStatus,
                materialPlanDate,
                materials: normalizedMaterials
            }
        });
    } catch (error) {
        console.error('Error in getOrderDetail:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// PATCH /api/production/excel/orders/:id
// Update order fields (inline editing)
// ============================================
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryPlanDate, note, fixCompatible, workforce } = req.body;
        const userId = req.user?.id || 1;

        const updates = [];
        const params = [];

        if (deliveryPlanDate !== undefined) {
            updates.push('deadline = ?');
            params.push(deliveryPlanDate || null);
        }

        if (note !== undefined) {
            updates.push('excel_note = ?');
            params.push(note || '');
        }

        if (fixCompatible !== undefined) {
            updates.push('fix_compatible = ?');
            params.push(fixCompatible || '');
        }

        if (workforce !== undefined) {
            updates.push('workforce = ?');
            params.push(workforce || '');
        }

        // Handle quantity (manual override for aluminum weight)
        if (req.body.quantity !== undefined) {
            // Parse quantity - remove 'kg' suffix if present
            let quantityValue = req.body.quantity;
            if (typeof quantityValue === 'string') {
                quantityValue = parseFloat(quantityValue.replace(/[^\d.-]/g, '')) || null;
            }
            updates.push('manual_weight = ?');
            params.push(quantityValue);
        }

        if (updates.length > 0) {
            params.push(id);
            await db.query(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        // Log audit event
        await db.query(`
            INSERT INTO order_events (order_id, event_type, event_title, payload_json, created_by)
            VALUES (?, 'UPDATE', 'Cập nhật đơn hàng Excel View', ?, ?)
        `, [id, JSON.stringify(req.body), userId]);

        res.json({ success: true, message: 'Order updated' });
    } catch (error) {
        console.error('Error in updateOrder:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// PATCH /api/production/excel/orders/:id/materials/:group
// Update material status for a specific group
// ============================================
exports.updateMaterialStatus = async (req, res) => {
    try {
        const { id, group } = req.params;
        const { status, planDate, note, featuredProducts, quantity } = req.body;
        const userId = req.user?.id || 1;

        // Validate group
        if (!MATERIAL_GROUPS.includes(group.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: `Invalid material group: ${group}. Must be one of: ${MATERIAL_GROUPS.join(', ')}`
            });
        }

        // Validate status
        if (status && !MATERIAL_STATUS.has(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status: ${status}. Must be one of: NONE, MISSING, PARTIAL, ORDERED, READY, DELIVERED, CUSTOMER_PROVIDED`
            });
        }

        const groupUpper = group.toUpperCase();

        // Use INSERT ON DUPLICATE KEY UPDATE to avoid race conditions
        // Now includes featured_products and quantity columns
        await db.query(`
            INSERT INTO order_material_status (order_id, material_type, status, plan_date, note, featured_products, quantity, updated_by, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                status = COALESCE(VALUES(status), status),
                plan_date = COALESCE(VALUES(plan_date), plan_date),
                note = COALESCE(VALUES(note), note),
                featured_products = COALESCE(VALUES(featured_products), featured_products),
                quantity = COALESCE(VALUES(quantity), quantity),
                updated_by = VALUES(updated_by),
                updated_at = NOW()
        `, [id, groupUpper, status || 'NONE', planDate || null, note || '', featuredProducts || null, quantity || null, userId]);

        // Log audit event
        await db.query(`
            INSERT INTO order_events (order_id, event_type, event_title, payload_json, created_by)
            VALUES (?, 'MATERIAL_UPDATE', ?, ?, ?)
        `, [id, `Cập nhật vật tư ${groupUpper}`, JSON.stringify({ group: groupUpper, status, planDate, note, featuredProducts, quantity }), userId]);

        res.json({ success: true, message: 'Material status updated' });
    } catch (error) {
        console.error('Error in updateMaterialStatus:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET /api/production/excel/orders/:id/history
// Get order history/audit trail
// ============================================
exports.getOrderHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const [events] = await db.query(`
            SELECT 
                event_type,
                event_title,
                payload_json,
                created_at,
                created_by
            FROM order_events
            WHERE order_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `, [id]);

        res.json({
            success: true,
            data: events.map(e => ({
                type: e.event_type,
                title: e.event_title,
                payload: e.payload_json ? JSON.parse(e.payload_json) : {},
                at: e.created_at,
                by: e.created_by
            }))
        });
    } catch (error) {
        console.error('Error in getOrderHistory:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET /api/production/excel/export
// Export to Excel with professional styling using exceljs
// Features: Company header, colored headers, borders, status colors
// ============================================
exports.exportExcel = async (req, res) => {
    try {
        const ExcelJS = require('exceljs');

        // ============================================
        // USE SHARED DATA LOGIC - 100% sync with frontend
        // ============================================
        const result = await getOrdersData(req, { noPagination: true });
        const orders = result.orders;
        const companyName = result.companyName;
        const userName = req.user?.full_name || 'Admin';
        const logoPath = path.join(__dirname, '../assets/LogoViralWindow.png');

        // Material status label and color mapping
        const MATERIAL_STATUS_CONFIG = {
            'NONE': { label: 'Chưa có', color: 'FFE0E0E0', fontColor: 'FF666666' },
            'MISSING': { label: 'Thiếu', color: 'FFFECACA', fontColor: 'FF991B1B' },
            'PARTIAL': { label: 'Thiếu một phần', color: 'FFFEF3C7', fontColor: 'FFB45309' },
            'ORDERED': { label: 'Đã đặt', color: 'FFDBEAFE', fontColor: 'FF1D4ED8' },
            'READY': { label: 'Đã đủ', color: 'FFD1FAE5', fontColor: 'FF047857' },
            'ARRIVED': { label: 'Đã nhận', color: 'FFE0F2FE', fontColor: 'FF0369A1' },
            'ISSUED': { label: 'Đã xuất', color: 'FFECFDF5', fontColor: 'FF059669' },
            'DELIVERED': { label: 'Đã giao', color: 'FF10B981', fontColor: 'FFFFFFFF' },
            'CUSTOMER_PROVIDED': { label: 'Khách cấp', color: 'FFE0E7FF', fontColor: 'FF4F46E5' }
        };

        const MATERIAL_GROUP_LABELS = {
            'GLASS': 'Kính',
            'ALUMINUM': 'Nhôm',
            'HARDWARE': 'Phụ kiện',
            'ACCESSORY': 'Vật tư phụ'
        };

        const formatDateVN = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow ERP';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Theo dõi dự án', {
            properties: { defaultRowHeight: 20 }
        });

        // ============================================
        // HEADER SECTION (Company info, Title, Date)
        // ============================================

        // 1. Inject Professional Logo
        try {
            if (fs.existsSync(logoPath)) {
                const logo = workbook.addImage({
                    filename: logoPath,
                    extension: 'png',
                });
                worksheet.addImage(logo, {
                    tl: { col: 0.1, row: 0.1 },
                    ext: { width: 100, height: 50 },
                    editAs: 'oneCell'
                });
            }
        } catch (logoErr) {
            console.warn('Could not add logo to export:', logoErr.message);
        }

        // Row 1: Company Name
        worksheet.mergeCells('C1:L1');
        const companyCell = worksheet.getCell('C1');
        companyCell.value = companyName.toUpperCase();
        companyCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
        companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;

        // Row 2: Report Title
        worksheet.mergeCells('C2:L2');
        const titleCell = worksheet.getCell('C2');
        titleCell.value = 'BÁO CÁO THEO DÕI DỰ ÁN';
        titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1F2937' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(2).height = 25;

        // Row 3: Metadata (Exporter & Date)
        worksheet.mergeCells('A3:L3');
        const metaCell = worksheet.getCell('A3');
        const now = new Date();
        const dateStr = formatDateVN(now);
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        metaCell.value = `Ngày xuất: ${dateStr} ${timeStr} | Người xuất: ${userName}`;
        metaCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF4B5563' } };
        metaCell.alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.getRow(3).height = 20;

        // Row 4: Empty row for spacing
        worksheet.getRow(4).height = 10;

        // ============================================
        // TABLE HEADERS (Row 5)
        // ============================================
        const headerRow = 5;
        const headers = [
            { key: 'orderCode', header: 'Mã đơn', width: 15 },
            { key: 'orderName', header: 'Đơn hàng', width: 35 },
            { key: 'featuredProducts', header: 'Sản phẩm ĐC', width: 25 },
            { key: 'customer', header: 'CN-Khách hàng', width: 25 },
            { key: 'quantity', header: 'Khối lượng', width: 12 },
            { key: 'workforce', header: 'Nhân lực', width: 15 },
            { key: 'createdAt', header: 'Ngày tạo', width: 12 },
            { key: 'deliveryDate', header: 'Kế hoạch giao', width: 14 },
            { key: 'materialType', header: 'Tình trạng VT', width: 20 },
            { key: 'materialPlanDate', header: 'Lịch giao VT', width: 14 },
            { key: 'fixCompatible', header: 'Fix tổ hợp', width: 15 },
            { key: 'note', header: 'Ghi chú', width: 35 }
        ];

        // Set column widths
        headers.forEach((h, idx) => {
            worksheet.getColumn(idx + 1).width = h.width;
        });

        // Create header row with styling
        const headerRowObj = worksheet.getRow(headerRow);
        headerRowObj.height = 25;

        headers.forEach((h, idx) => {
            const cell = headerRowObj.getCell(idx + 1);
            cell.value = h.header;
            cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E3A8A' }  // Dark blue
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        });

        // ============================================
        // DATA ROWS - Use data from getOrdersData (SAME as frontend!)
        // ============================================
        let currentRow = headerRow + 1;
        let orderIndex = 0;

        // Helper: tính chiều cao dòng động dựa trên nội dung dài nhất
        const COL_WIDTHS = headers.map(h => h.width);
        const CHARS_PER_WIDTH_UNIT = 1.3; // Arial size 10-11, ký tự VN rộng hơn Latin
        const calcRowHeight = (rowValues, lineHeight = 15, minHeight = 28) => {
            let maxLines = 1;
            for (let i = 0; i < rowValues.length; i++) {
                const val = String(rowValues[i] || '');
                if (val.length > 0) {
                    const colCharWidth = Math.floor((COL_WIDTHS[i] || 12) * CHARS_PER_WIDTH_UNIT);
                    const estimatedLines = Math.ceil(val.length / Math.max(colCharWidth, 1));
                    const manualNewlines = (val.match(/\n/g) || []).length;
                    maxLines = Math.max(maxLines, estimatedLines + manualNewlines);
                }
            }
            return Math.max(minHeight, maxLines * lineHeight);
        };

        // Helper to build multi-status label from itemStatuses array
        const buildMultiStatusLabel = (mat) => {
            const itemStatuses = mat.itemStatuses || [mat.status];
            if (!itemStatuses || itemStatuses.length === 0) {
                return MATERIAL_STATUS_CONFIG['NONE'].label;
            }
            // Map each status to label
            const labels = itemStatuses.map(s => {
                const cfg = MATERIAL_STATUS_CONFIG[s] || MATERIAL_STATUS_CONFIG['NONE'];
                return cfg.label;
            });
            // Return unique labels joined
            return [...new Set(labels)].join(' + ');
        };

        // Helper to get primary status config for cell coloring
        const getPrimaryStatusConfig = (mat) => {
            const itemStatuses = mat.itemStatuses || [mat.status];
            // Return config for first (highest priority) status
            const primaryStatus = itemStatuses[0] || mat.status || 'NONE';
            return MATERIAL_STATUS_CONFIG[primaryStatus] || MATERIAL_STATUS_CONFIG['NONE'];
        };

        orders.forEach(order => {
            // Get materials from the order object (already computed by getOrdersData)
            const materials = order.materials || [];

            // Build customer display same as frontend
            const customerDisplay = `${order.branch?.name || ''} - ${order.customer?.name || ''}`.replace(/^ - | - $/g, '');

            // Get featured products from materials (aggregate for main row)
            const featuredProductsDisplay = materials.map(m => m.featuredProducts).filter(f => f).join(', ');

            // Alternate row background color
            const isEvenOrder = orderIndex % 2 === 0;
            const rowBgColor = isEvenOrder ? 'FFFFFFFF' : 'FFF9FAFB';
            const subRowBgColor = isEvenOrder ? 'FFF5F5F5' : 'FFEFEBE9';

            // ============================================
            // MAIN ROW - Order info only (no material status)
            // ============================================
            const mainRow = worksheet.getRow(currentRow);

            // Build overall status display for main row (combine all unique statuses)
            const allStatuses = materials.flatMap(m => m.itemStatuses || [m.status]);
            const uniqueStatuses = [...new Set(allStatuses.filter(s => s && s !== 'NONE'))];
            const overallStatusLabel = uniqueStatuses.length > 0
                ? uniqueStatuses.map(s => (MATERIAL_STATUS_CONFIG[s] || MATERIAL_STATUS_CONFIG['NONE']).label).join(' + ')
                : 'Chưa có';
            const primaryOverallStatus = uniqueStatuses[0] || 'NONE';
            const primaryOverallConfig = MATERIAL_STATUS_CONFIG[primaryOverallStatus] || MATERIAL_STATUS_CONFIG['NONE'];

            const mainRowData = [
                order.orderCode,
                order.orderName,
                featuredProductsDisplay,
                customerDisplay,
                order.quantity > 0 ? order.quantity.toFixed(2) + ' kg' : '',
                order.workforce || '',
                formatDateVN(order.createdAt),
                formatDateVN(order.deliveryPlanDate),
                overallStatusLabel,  // Combined status for main row
                '',  // Lịch giao VT - empty for main row
                order.fixCompatible || '',
                order.note || ''
            ];

            mainRowData.forEach((value, colIdx) => {
                const cell = mainRow.getCell(colIdx + 1);
                cell.value = value;
                cell.font = { name: 'Arial', size: 10, bold: true };
                cell.alignment = { vertical: 'middle', wrapText: true };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: rowBgColor }
                };

                // Center align date columns
                if ([6, 7, 9].includes(colIdx)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
                // Right align quantity
                if (colIdx === 4) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });

            // Tính chiều cao động cho main row
            mainRow.height = calcRowHeight(mainRowData, 15, 28);

            // Style main row status cell
            const mainStatusCell = mainRow.getCell(9);
            mainStatusCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: primaryOverallConfig.color }
            };
            mainStatusCell.font = {
                name: 'Arial',
                size: 10,
                bold: true,
                color: { argb: primaryOverallConfig.fontColor }
            };
            mainStatusCell.alignment = { horizontal: 'center', vertical: 'middle' };

            currentRow++;

            // ============================================
            // SUB-ROWS - One for each material group (4 rows)
            // ============================================
            for (let matIndex = 0; matIndex < materials.length; matIndex++) {
                const mat = materials[matIndex];
                const matStatusLabel = buildMultiStatusLabel(mat);
                const primaryStatusConfig = getPrimaryStatusConfig(mat);
                const materialLabel = MATERIAL_GROUP_LABELS[mat.group] || mat.group;

                const dataRow = worksheet.getRow(currentRow);

                // Sub-row data
                const rowData = [
                    '',  // Mã đơn - empty for sub-row
                    `  ↳ ${materialLabel}`,  // Show material name with arrow
                    mat.featuredProducts || '',  // Material-specific featuredProducts
                    '',  // Customer - empty for sub-row
                    mat.quantity || '',  // Material-specific quantity
                    '',  // Workshop - empty for sub-row
                    '',  // Created at - empty for sub-row
                    '',  // Delivery date - empty for sub-row
                    `${materialLabel} : ${matStatusLabel}`,  // Material status
                    formatDateVN(mat.planDate),  // Lịch giao VT
                    '',  // Fix tổ hợp - empty for sub-row
                    mat.note || ''  // Material note
                ];

                rowData.forEach((value, colIdx) => {
                    const cell = dataRow.getCell(colIdx + 1);
                    cell.value = value;
                    cell.font = { name: 'Arial', size: 9, color: { argb: 'FF666666' } };
                    cell.alignment = { vertical: 'middle', wrapText: true };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                    };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: subRowBgColor }
                    };

                    // Center align date columns
                    if ([6, 7, 9].includes(colIdx)) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                    // Right align quantity
                    if (colIdx === 4) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    }
                });

                // Tính chiều cao động cho sub-row
                dataRow.height = calcRowHeight(rowData, 14, 22);

                // Special styling for Material Status column (column 9)
                const statusCell = dataRow.getCell(9);
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: primaryStatusConfig.color }
                };
                statusCell.font = {
                    name: 'Arial',
                    size: 9,
                    bold: true,
                    color: { argb: primaryStatusConfig.fontColor }
                };
                statusCell.alignment = { horizontal: 'center', vertical: 'middle' };

                currentRow++;
            }

            orderIndex++;
        });

        // ============================================
        // FOOTER (Summary & Signatures)
        // ============================================
        currentRow += 1;
        worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
        const footerSummary = worksheet.getCell(`A${currentRow}`);
        footerSummary.value = `Tổng cộng: ${orders.length} dự án.`;
        footerSummary.font = { name: 'Arial', size: 11, bold: true };
        footerSummary.alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 25;

        currentRow += 2;
        const signRow = currentRow;
        worksheet.getRow(signRow).height = 25;

        // Signature headers
        const signHeaders = [
            { start: 'A', end: 'D', text: 'NGƯỜI LẬP' },
            { start: 'E', end: 'H', text: 'QUẢN LÝ' },
            { start: 'I', end: 'L', text: 'BAN GIÁM ĐỐC' }
        ];

        signHeaders.forEach(s => {
            worksheet.mergeCells(`${s.start}${signRow}:${s.end}${signRow}`);
            const cell = worksheet.getCell(`${s.start}${signRow}`);
            cell.value = s.text;
            cell.font = { name: 'Arial', size: 11, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        currentRow += 1;
        worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
        const italicCell = worksheet.getCell(`A${currentRow}`);
        italicCell.value = '(Ký, ghi rõ họ tên)';
        italicCell.font = { name: 'Arial', size: 10, italic: true };
        italicCell.alignment = { horizontal: 'center', vertical: 'top' };
        worksheet.getRow(currentRow).height = 20;

        currentRow += 4; // Space for signatures

        // Final line info
        worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
        const lastCell = worksheet.getCell(`A${currentRow}`);
        lastCell.value = `Ngày in: ${new Date().toLocaleString('vi-VN')} | Hệ thống ViralWindow ERP`;
        lastCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF9CA3AF' } };
        lastCell.alignment = { horizontal: 'center', vertical: 'bottom' };

        // ============================================
        // WRITE AND SEND
        // ============================================
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=theo_doi_du_an_${new Date().toISOString().slice(0, 10)}.xlsx`);
        res.send(buffer);
    } catch (error) {
        console.error('Error in exportExcel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};



// ============================================
// GET /api/production/excel/orders/:id/materials/:group/details
// Get detailed material items for a specific group with stock info
// Synced with design-new.html Kiểm tra Kho logic
// Data source: project_materials table (saved BOM data)
// ============================================
exports.getMaterialDetails = async (req, res) => {
    try {
        const { id, group } = req.params;
        const groupUpper = (group || '').toUpperCase();

        // Validate group
        if (!MATERIAL_GROUPS.includes(groupUpper)) {
            return res.status(400).json({
                success: false,
                error: `Invalid material group: ${group}. Must be one of: ${MATERIAL_GROUPS.join(', ')}`
            });
        }

        // Map MATERIAL_GROUP to project_materials.material_type
        const groupToMaterialType = {
            'ALUMINUM': 'aluminum',
            'GLASS': 'glass',
            'HARDWARE': 'phukien',     // Phụ kiện (hardware)
            'ACCESSORY': 'accessory'   // Vật tư phụ (gaskets, glue, etc.)
        };

        const materialType = groupToMaterialType[groupUpper];
        let items = [];

        console.log(`📦 getMaterialDetails for project ${id}, group ${groupUpper} (materialType: ${materialType})`);

        // ================================================
        // Get BOM data from project_materials table
        // ================================================
        const [bomRows] = await db.query(`
            SELECT 
                pm.id,
                pm.material_code,
                pm.material_name,
                pm.quantity,
                pm.unit,
                pm.notes
            FROM project_materials pm
            WHERE pm.project_id = ? AND pm.material_type = ?
            ORDER BY pm.material_name
        `, [id, materialType]);

        console.log(`📦 Found ${bomRows.length} items in project_materials`);

        // ================================================
        // Get stock data based on material type
        // ================================================
        let stockMap = {};

        if (groupUpper === 'ALUMINUM') {
            // Get inventory for aluminum
            const [invRows] = await db.query(`
                SELECT item_code, item_name, quantity FROM inventory 
                WHERE item_type IN ('aluminum', 'profile', 'frame')
            `);
            invRows.forEach(inv => {
                const key = (inv.item_code || '').toLowerCase();
                stockMap[key] = (stockMap[key] || 0) + (parseFloat(inv.quantity) || 0);
            });

            // Also check aluminum_systems
            try {
                const [aluSystems] = await db.query(`SELECT code, quantity_m FROM aluminum_systems`);
                aluSystems.forEach(alu => {
                    const key = (alu.code || '').toLowerCase();
                    stockMap[key] = (stockMap[key] || 0) + (parseFloat(alu.quantity_m) || 0);
                });
            } catch (e) {
                console.log('aluminum_systems table not found, skipping');
            }
        }
        else if (groupUpper === 'GLASS') {
            // Get glass inventory
            try {
                // ✅ FIX: Use 'name' column instead of 'glass_type' (glass_type doesn't exist in glass_items table!)
                const [glassRows] = await db.query(`
                    SELECT code, name, quantity FROM glass_items
                `);
                console.log(`📦 Glass stock: Found ${glassRows.length} items in glass_items`);
                glassRows.forEach(g => {
                    // Use g.name instead of g.glass_type
                    const rawCode = g.code || g.name || '';
                    const rawKey = rawCode.toLowerCase();
                    const normalizedKey = normalizeCode(rawCode);
                    const qty = parseFloat(g.quantity) || 0;

                    // Store both raw and normalized keys for flexible lookup
                    stockMap[rawKey] = (stockMap[rawKey] || 0) + qty;
                    if (normalizedKey && normalizedKey !== rawKey) {
                        stockMap[normalizedKey] = (stockMap[normalizedKey] || 0) + qty;
                    }
                });
                console.log(`📦 Glass stockMap keys: ${Object.keys(stockMap).slice(0, 10).join(', ')}`);
            } catch (e) {
                console.log('glass_items table not found, skipping:', e.message);
            }

            // Also check general inventory
            const [invRows] = await db.query(`
                SELECT item_code, item_name, quantity FROM inventory WHERE item_type = 'glass'
            `);
            invRows.forEach(inv => {
                const rawCode = inv.item_code || '';
                const rawKey = rawCode.toLowerCase();
                const normalizedKey = normalizeCode(rawCode);
                const qty = parseFloat(inv.quantity) || 0;

                stockMap[rawKey] = (stockMap[rawKey] || 0) + qty;
                if (normalizedKey && normalizedKey !== rawKey) {
                    stockMap[normalizedKey] = (stockMap[normalizedKey] || 0) + qty;
                }
            });
        }
        else if (groupUpper === 'HARDWARE' || groupUpper === 'ACCESSORY') {
            // Get accessories stock
            const [accRows] = await db.query(`
                SELECT id, code, name, stock_quantity, unit FROM accessories
            `);
            accRows.forEach(acc => {
                const keyCode = (acc.code || '').toLowerCase();
                const keyName = (acc.name || '').toLowerCase();
                const stock = parseFloat(acc.stock_quantity) || 0;
                if (keyCode) stockMap[keyCode] = stock;
                if (keyName) stockMap[keyName] = stock;
                stockMap[`id_${acc.id}`] = stock;
            });

            // Also check inventory for consumables
            const [invRows] = await db.query(`
                SELECT item_code, item_name, quantity FROM inventory 
                WHERE item_type IN ('consumable', 'gasket', 'glue', 'sealant', 'accessory', 'hardware')
            `);
            invRows.forEach(inv => {
                const key = (inv.item_code || '').toLowerCase();
                stockMap[key] = (stockMap[key] || 0) + (parseFloat(inv.quantity) || 0);
            });
        }

        // ================================================
        // Check if this group has been ISSUED (exported via stock document)
        // ================================================
        let groupStoredStatus = null;
        let exportedItemsMap = {};  // code/name → exported qty
        try {
            const [storedRows] = await db.query(
                'SELECT status FROM order_material_status WHERE order_id = ? AND material_type = ?',
                [id, groupUpper]
            );
            if (storedRows.length > 0) {
                groupStoredStatus = storedRows[0].status;
            }

            // If ISSUED, fetch exported quantities from stock_document_lines
            if (groupStoredStatus === 'ISSUED') {
                const [exportLines] = await db.query(`
                    SELECT l.item_code, l.item_name, SUM(l.qty) as total_exported
                    FROM stock_document_lines l
                    JOIN stock_documents d ON l.document_id = d.id
                    WHERE d.doc_type = 'export'
                      AND d.status = 'posted'
                      AND (l.project_id = ? OR d.project_id = ?)
                    GROUP BY l.item_code, l.item_name
                `, [id, id]);
                exportLines.forEach(el => {
                    const codeKey = (el.item_code || '').toLowerCase();
                    const nameKey = (el.item_name || '').toLowerCase();
                    const qty = parseFloat(el.total_exported) || 0;
                    if (codeKey) exportedItemsMap[codeKey] = (exportedItemsMap[codeKey] || 0) + qty;
                    if (nameKey) exportedItemsMap[nameKey] = (exportedItemsMap[nameKey] || 0) + qty;
                    // Also store normalized keys
                    const normCode = normalizeCode(el.item_code || '');
                    const normName = normalizeCode(el.item_name || '');
                    if (normCode) exportedItemsMap[normCode] = (exportedItemsMap[normCode] || 0) + qty;
                    if (normName) exportedItemsMap[normName] = (exportedItemsMap[normName] || 0) + qty;
                });
                console.log(`📦 Export history: Found ${exportLines.length} exported item types for project ${id}`);
            }
        } catch (e) {
            console.warn('Error checking export status:', e.message);
        }

        // ================================================
        // Process BOM items and check against stock + export history
        // ================================================
        for (const row of bomRows) {
            // Parse extra data from notes JSON if available
            let extraData = {};
            try {
                if (row.notes) {
                    extraData = JSON.parse(row.notes);
                }
            } catch (e) { }

            const code = row.material_code || extraData.code || '';
            const name = row.material_name || extraData.name || '';
            const requiredQty = parseFloat(row.quantity) || 0;

            // Find stock quantity - try multiple lookup strategies
            let stockQty = 0;
            const codeKey = code.toLowerCase();
            const nameKey = name.toLowerCase();
            const normalizedCodeKey = normalizeCode(code);
            const normalizedNameKey = normalizeCode(name);

            // ✅ FIX: Try normalized keys first (K-22 -> k22), then raw keys
            if (stockMap[normalizedCodeKey] !== undefined) {
                stockQty = stockMap[normalizedCodeKey];
            } else if (stockMap[codeKey] !== undefined) {
                stockQty = stockMap[codeKey];
            } else if (stockMap[normalizedNameKey] !== undefined) {
                stockQty = stockMap[normalizedNameKey];
            } else if (stockMap[nameKey] !== undefined) {
                stockQty = stockMap[nameKey];
            }

            // ✅ Check export history: if this item was exported, override status
            let exportedQty = 0;
            if (groupStoredStatus === 'ISSUED') {
                exportedQty = exportedItemsMap[normalizedCodeKey]
                    || exportedItemsMap[codeKey]
                    || exportedItemsMap[normalizedNameKey]
                    || exportedItemsMap[nameKey]
                    || 0;
            }

            const isFullyExported = exportedQty >= requiredQty && exportedQty > 0;
            const isPartiallyExported = exportedQty > 0 && exportedQty < requiredQty;

            let shortage, status;
            if (isFullyExported) {
                // Đã xuất đủ → trạng thái = issued, thiếu = 0
                shortage = 0;
                status = 'issued';
                // Show exported qty as "stock" for clarity
                stockQty = exportedQty;
            } else if (isPartiallyExported) {
                // Xuất một phần → check remaining vs stock
                const remaining = requiredQty - exportedQty;
                shortage = Math.max(0, remaining - stockQty);
                status = shortage <= 0 ? 'sufficient' : (stockQty > 0 ? 'partial' : 'partial_issued');
                stockQty = exportedQty + stockQty;  // Show total available (exported + in stock)
            } else {
                // Chưa xuất → check BOM vs live stock
                shortage = Math.max(0, requiredQty - stockQty);
                if (stockQty >= requiredQty) {
                    status = 'sufficient';
                } else if (stockQty > 0) {
                    status = 'partial';
                } else {
                    status = 'shortage';
                }
            }

            items.push({
                code: code || '--',
                name: name || '--',
                unit: row.unit || 'cái',
                required: requiredQty,
                stock: stockQty,
                shortage: shortage,
                status: status,
                exportedQty: exportedQty > 0 ? exportedQty : undefined
            });
        }

        // ================================================
        // Fallback: Get from purchase_requests if no BOM items
        // ================================================
        if (items.length === 0) {
            const categoryMap = {
                'ALUMINUM': 'nhom_data',
                'GLASS': 'kinh_data',
                'HARDWARE': 'phukien_data',
                'ACCESSORY': 'vattu_data'
            };

            const dataColumn = categoryMap[groupUpper];
            if (dataColumn) {
                const [prRows] = await db.query(`
                    SELECT ${dataColumn} as data FROM purchase_requests 
                    WHERE project_id = ? AND ${dataColumn} IS NOT NULL
                    ORDER BY created_at DESC LIMIT 1
                `, [id]);

                if (prRows.length > 0 && prRows[0].data) {
                    try {
                        const prData = typeof prRows[0].data === 'string'
                            ? JSON.parse(prRows[0].data)
                            : prRows[0].data;

                        if (Array.isArray(prData)) {
                            for (const prItem of prData) {
                                const code = prItem.code || prItem.material_code || '';
                                const name = prItem.name || prItem.material_name || prItem.type || '';
                                const requiredQty = parseFloat(prItem.quantity || prItem.panels || 0);

                                const codeKey = code.toLowerCase();
                                const nameKey = name.toLowerCase();
                                let stockQty = stockMap[codeKey] || stockMap[nameKey] || 0;

                                const shortage = Math.max(0, requiredQty - stockQty);

                                items.push({
                                    code: code || '--',
                                    name: name || '--',
                                    unit: prItem.unit || 'cái',
                                    required: requiredQty,
                                    stock: stockQty,
                                    shortage: shortage,
                                    status: stockQty >= requiredQty ? 'sufficient' : stockQty > 0 ? 'partial' : 'shortage'
                                });
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing purchase request data:', e);
                    }
                }
            }
        }

        console.log(`📦 Returning ${items.length} items for ${groupUpper} (storedStatus: ${groupStoredStatus})`);

        // Calculate summary
        const summary = {
            total: items.length,
            sufficient: items.filter(i => i.status === 'sufficient').length,
            partial: items.filter(i => i.status === 'partial' || i.status === 'partial_issued').length,
            shortage: items.filter(i => i.status === 'shortage').length,
            issued: items.filter(i => i.status === 'issued').length
        };

        // Determine overall status for this group
        // ✅ Prioritize stored status (ISSUED) over computed BOM status
        let overallStatus = 'NONE';
        if (groupStoredStatus === 'ISSUED') {
            overallStatus = 'ISSUED';
        } else if (groupStoredStatus === 'ARRIVED') {
            overallStatus = 'ARRIVED';
        } else if (groupStoredStatus === 'DELIVERED') {
            overallStatus = 'DELIVERED';
        } else if (items.length > 0) {
            if (summary.shortage === items.length) {
                overallStatus = 'MISSING';
            } else if (summary.sufficient === items.length) {
                overallStatus = 'READY';
            } else {
                overallStatus = 'PARTIAL';
            }
        }

        res.json({
            success: true,
            data: {
                group: groupUpper,
                groupLabel: MATERIAL_GROUP_LABEL[groupUpper] || groupUpper,
                overallStatus,
                summary,
                items
            }
        });
    } catch (error) {
        console.error('Error in getMaterialDetails:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Export enum constants for use in other modules
module.exports.STAGES = STAGES;
module.exports.STATUSES = STATUSES;
module.exports.MATERIAL_GROUPS = MATERIAL_GROUPS;
module.exports.MATERIAL_STATUS = MATERIAL_STATUS;
