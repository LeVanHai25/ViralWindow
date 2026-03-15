/**
 * =====================================================
 * AI CONTROLLER (with Smart Fallback)
 * =====================================================
 * Khi Gemini API unavailable → tự tạo insights từ raw data
 * Tất cả label hiển thị bằng tiếng Việt
 */

const aiService = require('../services/aiService');
const aiDataCollector = require('../services/aiDataCollector');

// =====================================================
// VIETNAMESE LABELS - Mapping tiếng Anh → tiếng Việt
// =====================================================
const VI_STATUS = {
    // Project status
    active: 'Đang triển khai', in_progress: 'Đang xử lý', processing: 'Đang xử lý',
    pending: 'Chờ xử lý', completed: 'Hoàn thành', done: 'Hoàn thành',
    cancelled: 'Đã huỷ', new: 'Mới tạo', draft: 'Nháp',
    // Production
    in_production: 'Đang sản xuất', production: 'Sản xuất',
    // Installation & handover
    handover: 'Bàn giao', installation: 'Lắp đặt',
    // Stock
    import: 'Nhập kho', export: 'Xuất kho', transfer: 'Chuyển kho',
    posted: 'Đã duyệt', balanced: 'Đã cân bằng',
    // Finance
    income: 'Thu', expense: 'Chi', revenue: 'Doanh thu',
    // Quotation
    approved: 'Đã duyệt', rejected: 'Từ chối', sent: 'Đã gửi',
    // General
    confirmed: 'Đã xác nhận', received: 'Đã nhận', shipped: 'Đã giao',
};

function vn(status) {
    if (!status) return 'Không xác định';
    const key = String(status).toLowerCase();
    return VI_STATUS[key] || status;
}

// =====================================================
// FALLBACK: Tạo insights từ data thô (không cần AI)
// =====================================================
function generateLocalInsights(context) {
    const items = [];
    const p = context.projects || {};
    const acc = context.accessories || {};
    const alu = context.aluminum || {};
    const inv = context.inventory || {};
    const q = context.quotations || {};
    const mr = context.material_requests || {};

    // Dự án
    if (p.active > 0 || p.overdue > 0) {
        items.push(`<div class="ai-insight-item"><span class="ai-icon">📋</span><span class="ai-text"><b>Dự án:</b> ${p.active || 0} đang triển khai, ${p.completed || 0} hoàn thành, <span style="color:${p.overdue > 0 ? '#dc2626' : '#16a34a'}">${p.overdue || 0} quá hạn</span></span></div>`);
    }

    // Dự án gần đây
    const recent = context.recent_projects || [];
    if (recent.length > 0) {
        const names = recent.slice(0, 3).map(r => r.project_name).join(', ');
        items.push(`<div class="ai-insight-item"><span class="ai-icon">🏗️</span><span class="ai-text"><b>DA mới nhất:</b> ${names}</span></div>`);
    }

    // Kho - cảnh báo
    const totalLow = Number(acc.low_stock || 0) + Number(alu.low_stock || 0) + Number(inv.low_stock || 0);
    if (totalLow > 0) {
        items.push(`<div class="ai-insight-item"><span class="ai-icon">⚠️</span><span class="ai-text"><b>Cảnh báo kho:</b> <span style="color:#dc2626">${totalLow} vật tư sắp hết</span> (PK: ${acc.low_stock || 0}, Nhôm: ${alu.low_stock || 0}, Kính: ${inv.low_stock || 0})</span></div>`);
    } else {
        items.push(`<div class="ai-insight-item"><span class="ai-icon">✅</span><span class="ai-text"><b>Kho hàng:</b> Tất cả vật tư đều đủ số lượng tối thiểu</span></div>`);
    }

    // Tổng kho
    items.push(`<div class="ai-insight-item"><span class="ai-icon">📦</span><span class="ai-text"><b>Tổng kho:</b> ${acc.total_items || 0} phụ kiện, ${alu.total_items || 0} nhôm, ${inv.total_items || 0} kính/vật tư khác</span></div>`);

    // Phiếu kho 7 ngày
    const docs = context.stock_docs_7days || [];
    if (docs.length > 0) {
        const docInfo = docs.map(d => `${d.doc_type === 'import' ? 'Nhập' : d.doc_type === 'export' ? 'Xuất' : d.doc_type}: ${d.count} phiếu (${Number(d.total_value || 0).toLocaleString('vi-VN')}đ)`).join(', ');
        items.push(`<div class="ai-insight-item"><span class="ai-icon">📝</span><span class="ai-text"><b>Kho 7 ngày:</b> ${docInfo}</span></div>`);
    }

    // Tài chính
    const fin = context.financial_30days || [];
    if (fin.length > 0) {
        const finInfo = fin.map(f => {
            const icon = f.transaction_type === 'income' ? '💰' : '💸';
            return `${icon} ${vn(f.transaction_type)}: ${Number(f.total || 0).toLocaleString('vi-VN')}đ (${f.count} giao dịch)`;
        }).join(' | ');
        items.push(`<div class="ai-insight-item"><span class="ai-icon">💰</span><span class="ai-text"><b>Tài chính 30 ngày:</b> ${finInfo}</span></div>`);
    }

    // Báo giá
    if (q.total > 0) {
        items.push(`<div class="ai-insight-item"><span class="ai-icon">📄</span><span class="ai-text"><b>Báo giá:</b> ${q.total} tổng, ${q.pending || 0} chờ duyệt, ${q.approved || 0} đã duyệt (${Number(q.approved_value || 0).toLocaleString('vi-VN')}đ)</span></div>`);
    }

    // Yêu cầu VT
    if (mr.pending > 0) {
        items.push(`<div class="ai-insight-item"><span class="ai-icon">📋</span><span class="ai-text"><b>Yêu cầu vật tư:</b> <span style="color:#f59e0b">${mr.pending} đang chờ xử lý</span></span></div>`);
    }

    return items.join('\n');
}

function generateLocalReport(type, data) {
    const now = new Date().toLocaleDateString('vi-VN');
    const typeNames = { daily: 'Hàng Ngày', weekly: 'Hàng Tuần', monthly: 'Hàng Tháng' };

    let html = `<div class="ai-report">
        <h2>📊 Báo Cáo ${typeNames[type] || type} — ${now}</h2>
        <p class="ai-report-date">Được tạo tự động lúc ${new Date().toLocaleTimeString('vi-VN')}</p>`;

    // Dự án
    const projects = data.projects_updated || [];
    html += `<div class="ai-report-section"><h3>📋 Dự Án (${projects.length})</h3>`;
    if (projects.length > 0) {
        html += '<ul>';
        projects.forEach(p => {
            html += `<li><b>${p.project_name}</b> (${p.project_code || ''}) — ${vn(p.status)}${p.customer_name ? ` — KH: ${p.customer_name}` : ''}${p.total_value ? ` — ${Number(p.total_value).toLocaleString('vi-VN')}đ` : ''}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>Không có dự án cập nhật trong kỳ này.</p>';
    }
    html += '</div>';

    // Phiếu kho
    const stockDocs = data.stock_documents || [];
    html += `<div class="ai-report-section"><h3>📦 Phiếu Kho (${stockDocs.length})</h3>`;
    if (stockDocs.length > 0) {
        html += '<ul>';
        stockDocs.forEach(d => {
            const icon = d.doc_type === 'import' ? '📥' : d.doc_type === 'export' ? '📤' : '📋';
            html += `<li>${icon} ${vn(d.doc_type)} — ${d.doc_no} — ${Number(d.total_value || 0).toLocaleString('vi-VN')}đ — ${vn(d.status)}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>Không có phiếu kho trong kỳ này.</p>';
    }
    html += '</div>';

    // Tài chính
    const fin = data.financial_summary || [];
    html += `<div class="ai-report-section"><h3>💰 Tài Chính</h3>`;
    if (fin.length > 0) {
        let totalIncome = 0, totalExpense = 0;
        html += '<ul>';
        fin.forEach(f => {
            const icon = f.transaction_type === 'income' ? '💰' : '💸';
            const amount = Number(f.total || 0);
            if (f.transaction_type === 'income') totalIncome += amount;
            else totalExpense += amount;
            html += `<li>${icon} ${vn(f.transaction_type)}: <b>${amount.toLocaleString('vi-VN')}đ</b> (${f.count} giao dịch)</li>`;
        });
        const profit = totalIncome - totalExpense;
        html += `<li>📊 <b>Lãi/Lỗ: <span style="color:${profit >= 0 ? '#16a34a' : '#dc2626'}">${profit.toLocaleString('vi-VN')}đ</span></b></li>`;
        html += '</ul>';
    } else {
        html += '<p>Không có giao dịch trong kỳ này.</p>';
    }
    html += '</div>';

    // Kho tồn thấp
    const lowStock = data.low_stock_items || [];
    if (lowStock.length > 0) {
        html += `<div class="ai-report-section"><h3>⚠️ Vật Tư Tồn Thấp (${lowStock.length})</h3><ul>`;
        lowStock.forEach(item => {
            html += `<li>${item.code} — ${item.name} — <span style="color:#dc2626">Còn ${item.qty}</span></li>`;
        });
        html += '</ul></div>';
    }

    html += `<div class="ai-report-summary"><h3>💡 Ghi chú</h3><p>Báo cáo được tạo tự động từ dữ liệu hệ thống. Nhấn <b>Tạo Báo Cáo AI</b> lại để cập nhật.</p></div></div>`;
    return html;
}

function generateLocalSearchSummary(query, results) {
    const total = results.reduce((sum, r) => sum + (r.count || 0), 0);
    if (total === 0) return `Không tìm thấy kết quả cho "<b>${query}</b>".`;
    const groups = results.filter(r => r.count > 0).map(r => {
        const tableNames = { projects: 'Dự án', stock_documents: 'Phiếu kho', financial_transactions: 'Tài chính', inventory: 'Kho', accessories: 'Phụ kiện', aluminum_systems: 'Nhôm', customers: 'Khách hàng', quotations: 'Báo giá', material_requests: 'Yêu cầu VT' };
        return `<b>${tableNames[r.table] || r.table}</b>: ${r.count}`;
    }).join(', ');
    return `Tìm thấy <b>${total}</b> kết quả cho "<b>${query}</b>": ${groups}`;
}

function generateLocalChatReply(message, context) {
    const parts = [];
    const msgLower = message.toLowerCase();

    if (context.accessories_low || context.aluminum_low || context.inventory_low) {
        parts.push('📦 <b>Thông tin kho:</b><ul>');
        if (context.accessories_low?.length > 0) {
            parts.push(`<li>Phụ kiện tồn thấp: ${context.accessories_low.slice(0, 5).map(a => `${a.name} (${a.stock_quantity})`).join(', ')}</li>`);
        }
        if (context.aluminum_low?.length > 0) {
            parts.push(`<li>Nhôm tồn thấp: ${context.aluminum_low.slice(0, 5).map(a => `${a.name} (${a.quantity})`).join(', ')}</li>`);
        }
        if (context.inventory_low?.length > 0) {
            parts.push(`<li>Kính/VT khác: ${context.inventory_low.slice(0, 5).map(a => `${a.item_name} (${a.quantity})`).join(', ')}</li>`);
        }
        parts.push('</ul>');
    }

    if (context.active_projects?.length > 0) {
        parts.push('📋 <b>Dự án đang triển khai:</b><ul>');
        context.active_projects.slice(0, 5).forEach(p => {
            const dl = p.deadline ? new Date(p.deadline).toLocaleDateString('vi-VN') : 'Chưa có';
            parts.push(`<li><b>${p.project_name}</b> — ${vn(p.status)} — Hạn: ${dl}</li>`);
        });
        parts.push('</ul>');
    }

    if (context.financial_summary?.length > 0) {
        parts.push('💰 <b>Tài chính 30 ngày:</b><ul>');
        context.financial_summary.forEach(f => {
            parts.push(`<li>${vn(f.transaction_type)}: ${Number(f.total || 0).toLocaleString('vi-VN')}đ (${f.count} giao dịch)</li>`);
        });
        parts.push('</ul>');
    }

    if (context.recent_quotations?.length > 0) {
        parts.push('📄 <b>Báo giá gần đây:</b><ul>');
        context.recent_quotations.slice(0, 5).forEach(q => {
            parts.push(`<li>${q.customer_name || 'KH'} — ${q.status} — ${Number(q.total_amount || 0).toLocaleString('vi-VN')}đ</li>`);
        });
        parts.push('</ul>');
    }

    if (context.recent_customers?.length > 0) {
        parts.push('👤 <b>Khách hàng gần đây:</b><ul>');
        context.recent_customers.slice(0, 5).forEach(c => {
            parts.push(`<li>${c.full_name} — ${c.phone || ''}</li>`);
        });
        parts.push('</ul>');
    }

    // Item lookup
    Object.keys(context).forEach(key => {
        if (key.startsWith('item_')) {
            const item = context[key];
            parts.push(`🔍 <b>${item.code || item.item_code}:</b> ${item.name || item.item_name} — Tồn: ${item.stock_quantity || item.quantity}`);
        }
    });

    if (parts.length === 0) {
        return '👋 Xin chào! Tôi có thể giúp bạn tra cứu thông tin hệ thống. Hãy hỏi về: <b>tồn kho</b>, <b>dự án</b>, <b>tài chính</b>, <b>báo giá</b>, hoặc <b>khách hàng</b>.';
    }

    return parts.join('\n');
}

// =====================================================
// 1. DASHBOARD INSIGHTS
// =====================================================
exports.getDashboardInsights = async (req, res) => {
    try {
        console.log('🤖 AI Dashboard Insights requested');
        const context = await aiDataCollector.getDashboardContext();

        let insights;
        try {
            insights = await aiService.generateInsights(context);
        } catch (aiError) {
            console.warn('⚠️ Gemini unavailable, using local fallback:', aiError.message);
            insights = generateLocalInsights(context);
        }

        res.json({
            success: true,
            data: {
                insights,
                context_summary: {
                    projects_active: context.projects?.active || 0,
                    projects_overdue: context.projects?.overdue || 0,
                    low_stock_accessories: context.accessories?.low_stock || 0,
                    low_stock_aluminum: context.aluminum?.low_stock || 0,
                },
                generated_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ AI Insights Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================
// 2. SMART SEARCH
// =====================================================
exports.smartSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi tìm kiếm' });
        }

        console.log(`🔍 AI Smart Search: "${query}"`);

        // Parse query: try AI first, fallback to keyword-based
        let parsedQuery;
        try {
            parsedQuery = await aiService.parseSearchQuery(query);
        } catch (aiError) {
            console.warn('⚠️ AI parse fallback');
            parsedQuery = {
                intent: 'search',
                tables: detectTables(query),
                keywords: query.split(/\s+/).filter(w => w.length > 1),
                summary: query
            };
        }

        const searchResults = await aiDataCollector.executeSearch(parsedQuery);

        // Summary: try AI, fallback to local
        let summary;
        try {
            summary = await aiService.chat(`Tóm tắt kết quả tìm kiếm "${query}". Ngắn gọn, HTML.`, [], { search_results: searchResults });
        } catch (aiError) {
            summary = generateLocalSearchSummary(query, searchResults);
        }

        res.json({
            success: true,
            data: {
                query, parsed: parsedQuery, results: searchResults,
                ai_summary: summary,
                total_results: searchResults.reduce((sum, r) => sum + (r.count || 0), 0)
            }
        });
    } catch (error) {
        console.error('❌ Search Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================
// 3. CHATBOT
// =====================================================
exports.chat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        if (!message || message.trim().length < 1) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn' });
        }

        console.log(`💬 AI Chat: "${message.substring(0, 50)}..."`);
        const dataContext = await aiDataCollector.getChatContext(message);

        let reply;
        try {
            reply = await aiService.chat(message, history, dataContext);
        } catch (aiError) {
            console.warn('⚠️ Gemini unavailable, using local chat fallback');
            reply = generateLocalChatReply(message, dataContext);
        }

        res.json({
            success: true,
            data: {
                reply,
                has_data_context: Object.keys(dataContext).length > 0,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Chat Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================
// 4. AUTO REPORTS
// =====================================================
exports.getReport = async (req, res) => {
    try {
        const { type } = req.params;
        if (!['daily', 'weekly', 'monthly', 'custom'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Loại: daily, weekly, monthly' });
        }

        console.log(`📋 AI Report: ${type}`);
        const reportData = await aiDataCollector.getReportData(type);

        let report;
        try {
            report = await aiService.generateReport(type, reportData);
        } catch (aiError) {
            console.warn('⚠️ Gemini unavailable, using local report fallback');
            report = generateLocalReport(type, reportData);
        }

        res.json({
            success: true,
            data: { type, report, raw_data: reportData, generated_at: new Date().toISOString() }
        });
    } catch (error) {
        console.error('❌ Report Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================
// 5. TEST CONNECTION
// =====================================================
exports.testConnection = async (req, res) => {
    try {
        const result = await aiService.testConnection();
        res.json({ success: result.success, message: result.message, api_key_configured: !!process.env.GEMINI_API_KEY });
    } catch (error) {
        res.json({ success: false, message: error.message, api_key_configured: !!process.env.GEMINI_API_KEY });
    }
};

// =====================================================
// HELPER: Detect tables from Vietnamese query
// =====================================================
function detectTables(query) {
    const q = query.toLowerCase();
    const tables = [];
    if (q.includes('dự án') || q.includes('project') || q.includes('công trình')) tables.push('projects');
    if (q.includes('kho') || q.includes('nhập') || q.includes('xuất') || q.includes('phiếu')) tables.push('stock_documents');
    if (q.includes('tài chính') || q.includes('thu') || q.includes('chi') || q.includes('tiền')) tables.push('financial_transactions');
    if (q.includes('phụ kiện') || q.includes('pk')) tables.push('accessories');
    if (q.includes('nhôm') || q.includes('thanh')) tables.push('aluminum_systems');
    if (q.includes('kính') || q.includes('vật tư')) tables.push('inventory');
    if (q.includes('khách') || q.includes('customer')) tables.push('customers');
    if (q.includes('báo giá') || q.includes('quotation')) tables.push('quotations');
    if (q.includes('yêu cầu') || q.includes('vt')) tables.push('material_requests');
    if (tables.length === 0) tables.push('projects', 'accessories', 'aluminum_systems');
    return tables;
}
