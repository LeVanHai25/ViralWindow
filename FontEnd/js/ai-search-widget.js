/**
 * =====================================================
 * AI SEARCH WIDGET
 * =====================================================
 * Smart Search bar cho mọi trang ViralWindow
 * - Ctrl+K để mở
 * - Nhập câu hỏi tiếng Việt → AI tìm dữ liệu
 */
(function () {
    'use strict';

    const API_BASE = window.API_BASE || '/api';
    const SEARCH_API = `${API_BASE}/ai/search`;

    // =====================================================
    // INJECT STYLES
    // =====================================================
    function injectStyles() {
        if (document.getElementById('ai-search-styles')) return;
        const style = document.createElement('style');
        style.id = 'ai-search-styles';
        style.textContent = `
            /* Overlay */
            #ai-search-overlay {
                position: fixed; inset: 0; z-index: 99995;
                background: rgba(15,23,42,0.6);
                backdrop-filter: blur(4px);
                display: none; align-items: flex-start; justify-content: center;
                padding-top: 12vh;
                animation: ai-search-fade 0.15s ease;
            }
            #ai-search-overlay.open { display: flex; }
            @keyframes ai-search-fade { from{opacity:0} to{opacity:1} }

            /* Search Box */
            .ai-search-box {
                width: 620px; max-width: calc(100vw - 32px);
                background: #fff; border-radius: 16px;
                box-shadow: 0 24px 80px rgba(0,0,0,0.25);
                overflow: hidden;
                animation: ai-search-slide 0.2s ease;
            }
            @keyframes ai-search-slide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

            /* Input */
            .ai-search-input-wrap {
                display: flex; align-items: center; gap: 12px;
                padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
            }
            .ai-search-input-wrap svg { width: 22px; height: 22px; stroke: #94a3b8; flex-shrink: 0; }
            .ai-search-input {
                flex: 1; border: none; outline: none; font-size: 16px;
                color: #1e293b; font-family: inherit;
            }
            .ai-search-input::placeholder { color: #94a3b8; }
            .ai-search-kbd {
                padding: 3px 8px; border-radius: 6px;
                background: #f1f5f9; color: #64748b;
                font-size: 11px; font-weight: 600; border: 1px solid #e2e8f0;
            }

            /* Results */
            .ai-search-results {
                max-height: 420px; overflow-y: auto; padding: 0;
            }
            .ai-search-results::-webkit-scrollbar { width: 4px; }
            .ai-search-results::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

            /* AI Summary */
            .ai-search-summary {
                padding: 16px 20px; background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                font-size: 13.5px; color: #475569; line-height: 1.65;
            }
            .ai-search-summary b { color: #4f46e5; }

            /* Result Items */
            .ai-search-group {
                padding: 8px 20px;
            }
            .ai-search-group-title {
                font-size: 11px; font-weight: 700; color: #94a3b8;
                text-transform: uppercase; letter-spacing: 0.5px;
                padding: 8px 0 4px; margin: 0;
            }
            .ai-search-item {
                padding: 10px 12px; border-radius: 10px;
                cursor: default; display: flex; align-items: center; gap: 10px;
                transition: background 0.1s;
                font-size: 13.5px; color: #334155;
            }
            .ai-search-item:hover { background: #f1f5f9; }
            .ai-search-item-icon {
                width: 32px; height: 32px; border-radius: 8px;
                background: #eff6ff; display: flex; align-items: center;
                justify-content: center; font-size: 16px; flex-shrink: 0;
            }
            .ai-search-item-text { flex: 1; }
            .ai-search-item-title { font-weight: 600; color: #1e293b; }
            .ai-search-item-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

            /* Loading */
            .ai-search-loading {
                padding: 32px 20px; text-align: center;
                color: #94a3b8; font-size: 14px;
            }
            .ai-search-loading .spinner {
                display: inline-block; width: 24px; height: 24px;
                border: 3px solid #e2e8f0; border-top-color: #6366f1;
                border-radius: 50%; animation: ai-spin 0.6s linear infinite;
                margin-bottom: 8px;
            }
            @keyframes ai-spin { to { transform: rotate(360deg); } }
            
            /* Empty */
            .ai-search-empty {
                padding: 32px 20px; text-align: center;
                color: #94a3b8; font-size: 14px;
            }

            /* Footer */
            .ai-search-footer {
                padding: 10px 20px; border-top: 1px solid #e2e8f0;
                display: flex; justify-content: space-between; align-items: center;
                background: #f8fafc; font-size: 12px; color: #94a3b8;
            }
        `;
        document.head.appendChild(style);
    }

    // =====================================================
    // CREATE DOM
    // =====================================================
    let searchTimeout = null;

    function createWidget() {
        injectStyles();

        const overlay = document.createElement('div');
        overlay.id = 'ai-search-overlay';
        overlay.innerHTML = `
            <div class="ai-search-box">
                <div class="ai-search-input-wrap">
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="ai-search-input" id="ai-search-input" 
                           placeholder="Hỏi AI: tìm dự án, tồn kho, tài chính..." autocomplete="off">
                    <span class="ai-search-kbd">ESC</span>
                </div>
                <div class="ai-search-results" id="ai-search-results">
                    <div class="ai-search-empty">
                        🔍 Nhập câu hỏi rồi nhấn Enter để AI tìm kiếm<br>
                        <span style="font-size:12px;color:#b0bec5">Ví dụ: "dự án overdue", "tồn kho nhôm VRA-55", "chi phí tháng 3"</span>
                    </div>
                </div>
                <div class="ai-search-footer">
                    <span>🤖 Powered by AI ViralWindow</span>
                    <span><b>Ctrl+K</b> để mở/đóng</span>
                </div>
            </div>
        `;

        // Close on click outside
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeSearch();
        });

        document.body.appendChild(overlay);

        // Enter to search
        document.getElementById('ai-search-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value);
            }
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }

    // =====================================================
    // OPEN/CLOSE
    // =====================================================
    function openSearch() {
        const overlay = document.getElementById('ai-search-overlay');
        overlay.classList.add('open');
        setTimeout(() => document.getElementById('ai-search-input').focus(), 100);
    }

    function closeSearch() {
        document.getElementById('ai-search-overlay').classList.remove('open');
    }

    // Ctrl+K shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const overlay = document.getElementById('ai-search-overlay');
            if (overlay && overlay.classList.contains('open')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
    });

    // =====================================================
    // PERFORM SEARCH
    // =====================================================
    async function performSearch(query) {
        if (!query || query.trim().length < 2) return;

        const resultsDiv = document.getElementById('ai-search-results');
        resultsDiv.innerHTML = `
            <div class="ai-search-loading">
                <div class="spinner"></div><br>
                🤖 AI đang phân tích câu hỏi...
            </div>
        `;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(SEARCH_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query })
            });

            const result = await response.json();

            if (result.success) {
                displayResults(result.data);
            } else {
                resultsDiv.innerHTML = `<div class="ai-search-empty">❌ ${result.message}</div>`;
            }
        } catch (error) {
            resultsDiv.innerHTML = `<div class="ai-search-empty">❌ Không thể kết nối AI server</div>`;
        }
    }

    // =====================================================
    // DISPLAY RESULTS
    // =====================================================
    const TABLE_ICONS = {
        projects: '📋', stock_documents: '📦', financial_transactions: '💰',
        inventory: '🏪', accessories: '🔩', aluminum_systems: '🏗️',
        customers: '👤', quotations: '📄', material_requests: '📝'
    };

    const TABLE_NAMES = {
        projects: 'Dự án', stock_documents: 'Phiếu kho', financial_transactions: 'Tài chính',
        inventory: 'Kho hàng', accessories: 'Phụ kiện', aluminum_systems: 'Nhôm',
        customers: 'Khách hàng', quotations: 'Báo giá', material_requests: 'Yêu cầu VT'
    };

    function displayResults(data) {
        const resultsDiv = document.getElementById('ai-search-results');
        let html = '';

        // AI Summary
        if (data.ai_summary) {
            html += `<div class="ai-search-summary">${data.ai_summary}</div>`;
        }

        // Results by table
        if (data.results && data.results.length > 0) {
            for (const group of data.results) {
                if (!group.data || group.data.length === 0) continue;

                html += `<div class="ai-search-group">`;
                html += `<div class="ai-search-group-title">${TABLE_ICONS[group.table] || '📌'} ${TABLE_NAMES[group.table] || group.table} (${group.count})</div>`;

                for (const item of group.data.slice(0, 5)) {
                    const title = item.project_name || item.name || item.doc_no || item.item_name || item.customer_name || item.order_code || 'N/A';
                    const sub = item.status || item.doc_type || item.category || item.phone || '';
                    const extra = item.total_amount ? ` — ${Number(item.total_amount).toLocaleString('vi-VN')}đ` : '';
                    
                    html += `
                        <div class="ai-search-item">
                            <div class="ai-search-item-icon">${TABLE_ICONS[group.table] || '📌'}</div>
                            <div class="ai-search-item-text">
                                <div class="ai-search-item-title">${title}${extra}</div>
                                <div class="ai-search-item-sub">${sub}</div>
                            </div>
                        </div>
                    `;
                }
                html += `</div>`;
            }
        }

        if (!html) {
            html = `<div class="ai-search-empty">Không tìm thấy kết quả phù hợp</div>`;
        }

        resultsDiv.innerHTML = html;
    }

    // =====================================================
    // INIT
    // =====================================================
    window.openAISearch = openSearch;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
