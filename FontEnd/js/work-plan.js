/**
 * Work Plan Module Logic (Premium Overhaul - Perfected Version)
 * ViralWindow - Management Calendar & Tasks
 */

const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : window.location.origin + '/api');
const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin;

const WorkPlanModule = {
    calendar: null,
    plans: [],
    users: [],
    currentPlanId: null,
    selectedPlanId: null,
    socket: null,
    currentUser: null,
    
    // View State
    currentView: 'dashboard', 
    filterType: 'all',
    filterStatus: 'all',
    searchQuery: '',

    init: async function() {
        this.currentUser = window.AuthHelper && window.AuthHelper.getUser() ? window.AuthHelper.getUser() : { id: 999, full_name: 'Test Administrator' };

        this.bindEvents();
        this.initMiniCalendar();

        const calEl = document.getElementById('calendar');
        this.calendar = new FullCalendar.Calendar(calEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'title',
                right: 'prev,next today dayGridMonth,timeGridWeek'
            },
            locale: 'vi',
            buttonText: { today: 'Hôm nay', month: 'Tháng', week: 'Tuần' },
            events: [],
            eventClick: (info) => {
                this.openDetailPanel(info.event.id);
            },
            dateClick: (info) => {
                this.openCreateModal(info.dateStr);
            },
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false },
            eventContent: this.renderCalendarEvent.bind(this)
        });
        
        await this.loadUsers();
        await this.loadCustomers(); // Added
        await this.loadProjects();   // Added
        await this.loadPlans();
        this.initSocket();
    },

    bindEvents: function() {
        document.querySelectorAll('#main-tabs .nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('#main-tabs .nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.switchMainView(tab.dataset.view);
            });
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = btn.dataset.filter;
                const val = btn.dataset.value;
                if (type === 'type') {
                    document.querySelectorAll('[data-filter="type"]').forEach(b => { b.classList.remove('active', 'bg-teal-50', 'text-teal-700', 'font-semibold'); b.classList.add('text-gray-600'); });
                    btn.classList.add('active', 'bg-teal-50', 'text-teal-700', 'font-semibold');
                    btn.classList.remove('text-gray-600');
                    this.filterType = val;
                } else if (type === 'status') {
                    document.querySelectorAll('[data-filter="status"]').forEach(b => { b.classList.remove('active', 'bg-gray-100', 'font-semibold', 'text-gray-700'); b.classList.add('text-gray-600'); });
                    btn.classList.add('active', 'bg-gray-100', 'font-semibold', 'text-gray-700');
                    btn.classList.remove('text-gray-600');
                    this.filterStatus = val;
                }
                this.renderAllViews();
                this.closeDetailPanel();
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderAllViews();
            });
        }
    },

    initMiniCalendar: function() {
        const today = new Date();
        document.getElementById('mini-cal-month').innerText = `Tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
        const grid = document.getElementById('mini-cal-grid');
        let html = '';
        for(let i=1; i<=31; i++) {
            if (i === today.getDate()) {
                html += `<div class="w-6 h-6 flex items-center justify-center bg-teal-600 text-white rounded-full mx-auto cursor-pointer shadow-sm">${i}</div>`;
            } else {
                html += `<div class="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full mx-auto cursor-pointer">${i}</div>`;
            }
        }
        grid.innerHTML = html;
    },

    switchMainView: function(viewName) {
        if (viewName !== 'detail') {
            this.previousMainView = viewName;
        }
        this.currentView = viewName;
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('view-' + viewName).classList.add('active');

        if (viewName === 'calendar' && this.calendar) {
            setTimeout(() => this.calendar.render(), 50);
        }
        if (viewName !== 'detail') {
            this.renderAllViews();
        }
    },

    // ===================================
    // DATA LAYER
    // ===================================
    loadUsers: async function() {
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/users`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.users = data.data || [];
                this.renderUserCheckboxes();
            }
        } catch (e) { console.error(e); }
    },

    loadCustomers: async function() {
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/customers`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.customers = data.data || [];
                const sel = document.getElementById('p_customer_name');
                if(sel) {
                    sel.innerHTML = '<option value="">-- Chọn khách hàng --</option>' + this.customers.map(c => `<option value="${c.id}">${c.full_name} - ${c.phone||''}</option>`).join('');
                }
            }
        } catch (e) { console.error(e); }
    },

    loadProjects: async function() {
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/projects`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.projects = data.data || [];
                const sel = document.getElementById('p_project_id');
                if(sel) {
                    sel.innerHTML = '<option value="">-- Chọn dự án --</option>' + this.projects.map(p => `<option value="${p.id}">[${p.project_code}] ${p.project_name || p.customer_name}</option>`).join('');
                }
            }
        } catch (e) { console.error(e); }
    },
    
    loadPlans: async function() {
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.plans = data.data || [];
            }
        } catch (e) {
            console.error('Lỗi tải kế hoạch:', e);
        } finally {
            this.renderAllViews();
            if(this.selectedPlanId) this.openDetailPanel(this.selectedPlanId, true);
        }
    },

    getFilteredPlans: function() {
        return this.plans.filter(p => {
            const matchType = this.filterType === 'all' || p.type === this.filterType;
            const matchStatus = this.filterStatus === 'all' || p.status === this.filterStatus;
            let matchSearch = true;
            if (this.searchQuery) {
                const txt = `${p.title} ${p.location} ${p.customer_name}`.toLowerCase();
                matchSearch = txt.includes(this.searchQuery);
            }
            return matchType && matchStatus && matchSearch;
        });
    },

    renderAllViews: function() {
        const filtered = this.getFilteredPlans();
        const total = this.plans.length;
        
        const el = document.getElementById('header-total-plans');
        if (el) el.textContent = `${filtered.length} kế hoạch`;

        // Sidebar Stats
        let counts = { meeting: 0, client: 0, survey: 0, supervision: 0, internal: 0, all: total };
        this.plans.forEach(p => { if (counts[p.type] !== undefined) counts[p.type]++; });
        
        ['all', 'meeting', 'client', 'survey', 'supervision', 'internal'].forEach(k => {
            const cEl = document.getElementById('count-' + k);
            if(cEl) cEl.textContent = counts[k];
        });

        this.updateCalendarData(filtered);

        if (this.currentView === 'dashboard') {
            this.renderDashboard(filtered, total);
        } else if (this.currentView === 'list') {
            this.renderList(filtered);
        }
    },

    // ===================================
    // DASHBOARD VIEW (Premium Design)
    // ===================================
    renderDashboard: function(plans, rawTotal) {
        const container = document.getElementById('view-dashboard');
        
        const completed = this.plans.filter(p => p.status === 'completed').length;
        const in_progress = this.plans.filter(p => p.status === 'in_progress').length;
        const urgent = this.plans.filter(p => p.priority === 'urgent').length;
        const pct = rawTotal === 0 ? 0 : Math.round((completed / rawTotal) * 100);

        // Upcoming plans
        let upcoming = this.plans.filter(p => new Date(p.start_time) >= new Date()).sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
        let todayPlans = upcoming.filter(p => new Date(p.start_time).toDateString() === new Date().toDateString());

        let html = `
            <div class="grid grid-cols-4 gap-5 mb-8">
                <div class="kpi-card">
                    <div class="kpi-title flex items-center gap-2"><div class="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center"><i class="fa-regular fa-calendar"></i></div> Tổng kế hoạch</div>
                    <div class="kpi-value text-teal-700">${rawTotal}</div>
                    <div class="kpi-sub">trong hệ thống</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title flex items-center gap-2"><div class="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center"><i class="fa-regular fa-circle-check"></i></div> Hoàn thành</div>
                    <div class="flex items-end gap-3"><div class="kpi-value text-green-600">${pct}%</div><div class="text-sm font-bold text-gray-400 mb-1">${completed} / ${rawTotal}</div></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title flex items-center gap-2"><div class="w-8 h-8 rounded bg-amber-50 text-amber-500 flex items-center justify-center"><i class="fa-solid fa-rotate"></i></div> Đang diễn ra</div>
                    <div class="kpi-value text-amber-600">${in_progress}</div>
                    <div class="kpi-sub">cần theo dõi</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title flex items-center gap-2"><div class="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center"><i class="fa-regular fa-bell"></i></div> Khẩn cấp</div>
                    <div class="kpi-value text-red-600">${urgent}</div>
                    <div class="kpi-sub">ưu tiên cao</div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
                <!-- LEfT COL: Hôm Nay & Sắp Tới -->
                <div class="col-span-2 flex flex-col gap-6">
                    <!-- Hôm nay -->
                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-gray-800 flex items-center gap-2"><i class="fa-regular fa-sun text-amber-500"></i> Hôm nay <span class="text-xs text-gray-400 font-normal">Thứ Ba, 24 tháng 3</span></h3>
                            <span class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">${todayPlans.length}</span>
                        </div>
                        <div class="flex flex-col gap-3">
                            ${this.renderTodayRows(todayPlans)}
                        </div>
                    </div>

                    <!-- Sắp tới -->
                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="font-bold text-gray-800 flex items-center gap-2 mb-1"><i class="fa-regular fa-clock text-orange-500"></i> Sắp tới</h3>
                                <p class="text-xs text-gray-400">Các kế hoạch chưa bắt đầu</p>
                            </div>
                        </div>
                        <div class="flex flex-col gap-3">
                            ${this.renderUpcomingRows(upcoming)}
                        </div>
                    </div>
                </div>

                <!-- RIGHT COL: Stats -->
                <div class="flex flex-col gap-6">
                    <!-- Trạng thái -->
                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <h3 class="font-bold text-gray-800 mb-1 text-sm"><i class="fa-solid fa-chart-pie text-teal-600 mr-2"></i> Trạng thái</h3>
                        <p class="text-xs text-gray-400 mb-5">Phân loại tiến độ dự án</p>
                        ${this.renderStatusBars(this.plans, rawTotal)}
                    </div>
                    
                    <!-- Phân bổ theo loại -->
                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <h3 class="font-bold text-gray-800 mb-1 text-sm"><i class="fa-solid fa-chart-simple text-amber-600 mr-2"></i> Theo loại</h3>
                        <p class="text-xs text-gray-400 mb-4">Mật độ kế hoạch</p>
                        ${this.renderTypeStats(this.plans, rawTotal)}
                    </div>
                </div>
            </div>
            
            <!-- Employee Workload Table -->
            <div class="bg-white border rounded-xl p-5 shadow-sm mt-6 mb-10">
                <h3 class="font-bold text-gray-800 mb-1 text-sm"><i class="fa-solid fa-users-gear text-blue-600 mr-2"></i> Khối lượng công việc</h3>
                <p class="text-xs text-gray-400 mb-4">Số kế hoạch đang active & leader của từng nhân sự</p>
                
                <table class="w-full text-left font-medium text-sm text-gray-700">
                    <thead>
                        <tr class="text-[10px] text-gray-400 uppercase border-b border-gray-100">
                            <th class="pb-3 w-1/3">Nhân viên</th>
                            <th class="pb-3 text-center">Active</th>
                            <th class="pb-3 text-center">Hoàn thành</th>
                            <th class="pb-3 text-center">Tổng</th>
                            <th class="pb-3 w-1/4">Tải</th>
                        </tr>
                    </thead>
                    <tbody id="workload-table">
                        ${this.renderWorkloadTable(this.plans)}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    },

    renderStatusBars: function(plans, total) {
        if(total === 0) return '<div class="text-xs text-center text-gray-400 py-4">Chưa có dữ liệu</div>';
        const st = { 
            planned: { c:0, color: 'bg-teal-500', name: 'Đã lên lịch', icon: 'fa-regular fa-calendar-check' }, 
            in_progress: { c:0, color: 'bg-amber-500', name: 'Đang diễn ra', icon: 'fa-solid fa-rotate' }, 
            completed: { c:0, color: 'bg-green-500', name: 'Hoàn thành', icon: 'fa-regular fa-circle-check' }, 
            cancelled: { c:0, color: 'bg-red-500', name: 'Đã hủy', icon: 'fa-solid fa-xmark' }
        };
        plans.forEach(p => { if(st[p.status]) st[p.status].c++; });

        let html = '';
        Object.keys(st).forEach(k => {
            const row = st[k];
            const pct = Math.round((row.c/total)*100);
            html += `
                <div class="mb-4">
                    <div class="flex justify-between text-xs font-bold text-gray-700 mb-1.5"><span class="flex items-center gap-2"><i class="${row.icon} w-4 text-center text-gray-400"></i> ${row.name}</span> <div class="flex items-center gap-3"><span>${row.c}</span><span class="text-[10px] w-6 text-right text-gray-400 font-normal">${pct}%</span></div></div>
                    <div class="prog-bar"><div class="prog-bar-fill ${row.color}" style="width: ${pct}%"></div></div>
                </div>
            `;
        });
        return html;
    },

    renderTypeStats: function(plans, total) {
        if(total === 0) return '<div class="text-xs text-center text-gray-400 py-4">Chưa có dữ liệu</div>';
        const st = { 
            meeting: { c:0, color: 'text-teal-600', bg: 'bg-teal-100', name: 'Hợp công ty', icon: 'fa-users' }, 
            client: { c:0, color: 'text-amber-600', bg: 'bg-amber-100', name: 'Gặp khách hàng', icon: 'fa-handshake' }, 
            survey: { c:0, color: 'text-rose-600', bg: 'bg-rose-100', name: 'Đo đạc / Khảo sát', icon: 'fa-ruler-combined' }, 
            supervision: { c:0, color: 'text-orange-600', bg: 'bg-orange-100', name: 'Giám sát CT', icon: 'fa-helmet-safety' },
            internal: { c:0, color: 'text-slate-600', bg: 'bg-slate-200', name: 'Nội bộ', icon: 'fa-list-check' },
        };
        plans.forEach(p => { if(st[p.type]) st[p.type].c++; });

        let html = '<div class="flex flex-col gap-3">';
        Object.keys(st).sort((a,b)=>st[b].c - st[a].c).forEach(k => {
            const row = st[k];
            if (row.c === 0) return;
            const pct = Math.round((row.c/total)*100);
            html += `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full ${row.bg} ${row.color} flex items-center justify-center text-sm"><i class="fa-solid ${row.icon}"></i></div>
                        <span class="text-xs font-bold text-gray-700">${row.name}</span>
                    </div>
                    <div class="text-xs font-bold text-gray-700 flex items-center gap-2">${row.c} <span class="text-[10px] text-gray-400 font-normal w-6 text-right">${pct}%</span></div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    renderTodayRows: function(plans) {
        if (plans.length === 0) return '<div class="text-xs text-gray-400 italic py-2">Hôm nay không có lịch trình nào.</div>';
        let html = '';
        plans.forEach(p => {
            const tc = this.getTypeConfig(p.type);
            const st = new Date(p.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
            html += `
                <div class="flex border-l-4 ${tc.borderClass} pl-3 py-1 cursor-pointer hover:bg-gray-50 transition" onclick="WorkPlanModule.openDetailPanel(${p.id})">
                    <div class="w-16 flex flex-col justify-start">
                        <span class="text-sm font-bold text-gray-800">${st}</span>
                        ${p.status==='in_progress' ? '<span class="text-[9px] text-amber-600 font-bold">Đang diễn ra</span>':''}
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800">${p.title}</div>
                        <div class="text-xs text-gray-500 flex items-center gap-4 mt-1">
                            <span class="${tc.color} font-semibold">${tc.icon} ${tc.name}</span>
                            ${p.location ? '<span><i class="fa-solid fa-location-dot"></i> ' + p.location + '</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        return html;
    },

    renderUpcomingRows: function(plans) {
        let upcoming = plans.filter(p => new Date(p.start_time).toDateString() !== new Date().toDateString());
        if (upcoming.length === 0) return '<div class="text-xs text-gray-400 italic py-2">Không có lịch trình sắp tới.</div>';
        
        let html = '';
        upcoming.slice(0, 5).forEach(p => {
            const tc = this.getTypeConfig(p.type);
            const d = new Date(p.start_time);
            const df = d.getDate() + '/' + (d.getMonth()+1);
            
            const diffDays = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
            let subtext = diffDays === 1 ? 'Ngày mai' : `Còn ${diffDays} ngày`;

            html += `
                <div class="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-gray-300 transition" onclick="WorkPlanModule.openDetailPanel(${p.id})">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg ${tc.bg} ${tc.color}">${tc.icon}</div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800 line-clamp-1">${p.title}</div>
                        <div class="text-xs text-gray-500 flex items-center gap-3 mt-1">
                            <span class="font-bold text-gray-700">${df}</span>
                            <span class="${p.priority === 'urgent' ? 'text-red-600 font-bold' : ''}">${p.priority === 'urgent' ? 'Khẩn cấp' : (p.priority === 'high' ? 'Cao' : 'Bình thường')}</span>
                            <span>• ${subtext}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        return html;
    },

    renderWorkloadTable: function(plans) {
        const userStats = {};
        this.users.forEach(u => userStats[u.id] = { name: u.full_name || u.username, active: 0, done: 0, total: 0 });

        plans.forEach(p => {
            if (!p.participants) return;
            p.participants.forEach(pa => {
                const uid = pa.user_id;
                if (!userStats[uid]) userStats[uid] = { name: pa.full_name || 'NV', active: 0, done: 0, total: 0 };
                userStats[uid].total++;
                if (p.status === 'completed') userStats[uid].done++;
                else if (p.status === 'planned' || p.status === 'in_progress') userStats[uid].active++;
            });
        });

        let html = '';
        const sorted = Object.values(userStats).sort((a,b) => b.total - a.total).slice(0, 5);
        if (sorted.length === 0) return '<tr><td colspan="5" class="py-4 text-center text-xs text-gray-400">Chưa có báo cáo nhân sự</td></tr>';

        sorted.forEach(u => {
            const loadPct = u.total > 0 ? (u.active / 10) * 100 : 0;
            const barPct = Math.min(loadPct, 100);
            const barColor = barPct > 80 ? 'bg-red-500' : (barPct > 50 ? 'bg-amber-500' : 'bg-teal-500');

            html += `
                <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <td class="py-3 items-center gap-2 flex">
                        <div class="w-6 h-6 rounded-full bg-slate-200 flex justify-center items-center text-[10px] font-bold text-slate-600">${u.name.charAt(0)}</div>
                        <span class="font-bold text-xs truncate w-32">${u.name}</span>
                    </td>
                    <td class="py-3 text-center text-amber-600 font-bold">${u.active}</td>
                    <td class="py-3 text-center text-green-600 font-bold">${u.done}</td>
                    <td class="py-3 text-center text-gray-800 font-bold">${u.total}</td>
                    <td class="py-3">
                        <div class="w-full bg-gray-100 rounded-full h-1.5"><div class="h-1.5 rounded-full ${barColor}" style="width: ${barPct}%"></div></div>
                    </td>
                </tr>
            `;
        });
        return html;
    },

    // ===================================
    // LIST VIEW
    // ===================================
    renderList: function(plans) {
        const container = document.getElementById('view-list');
        if (plans.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center p-20 text-gray-400">
                <i class="fa-solid fa-folder-open text-6xl mb-4 text-gray-200"></i>
                <h3 class="text-lg font-bold text-gray-500">Chưa có kế hoạch nào</h3>
            </div>`;
            return;
        }

        const grouped = {};
        plans.sort((a,b) => new Date(b.start_time) - new Date(a.start_time)).forEach(p => {
            const dateStr = p.start_time.split('T')[0];
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(p);
        });

        const todayStr = new Date().toISOString().split('T')[0];
        
        let html = '';
        Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a)).forEach(dateStr => {
            const groupPlans = grouped[dateStr];
            let label = '';
            
            const d = new Date(dateStr);
            const wday = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()];
            const dText = `${d.getDate()} tháng ${d.getMonth()+1}, ${d.getFullYear()}`;
            
            if (dateStr === todayStr) label = '<span class="text-teal-600">Hôm nay</span>';
            else label = wday;

            html += `
                <div class="border-b border-gray-200 pb-2 mb-4 mt-8 flex justify-between items-baseline">
                    <span class="text-[15px] font-extrabold text-gray-800">${label} <span class="text-xs font-normal text-gray-400 ml-2">${dText}</span></span>
                    <span class="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">${groupPlans.length} kế hoạch</span>
                </div>
            `;

            groupPlans.forEach(p => {
                const tc = this.getTypeConfig(p.type);
                const st = new Date(p.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                const et = p.end_time ? new Date(p.end_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '';
                
                let avatarsHtml = '<div class="flex flex-row-reverse justify-end -space-x-2 space-x-reverse mt-2">';
                if (p.participants && p.participants.length > 0) {
                    p.participants.slice(0, 4).forEach(pa => {
                        avatarsHtml += `<div class="w-6 h-6 rounded-full border-2 border-white bg-slate-300 text-white flex items-center justify-center text-[10px] font-bold font-mono shadow-sm">${(pa.full_name || pa.username || '?').charAt(0).toUpperCase()}</div>`;
                    });
                    if (p.participants.length > 4) avatarsHtml += `<div class="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-gray-500 flex items-center justify-center text-[9px] font-bold shadow-sm">+${p.participants.length - 4}</div>`;
                }
                avatarsHtml += '</div>';

                let priorityBadge = p.priority === 'urgent' ? 
                    '<span class="px-2 py-1 rounded text-[10px] font-bold bg-red-50 text-red-600 flex items-center gap-1"><i class="fa-solid fa-arrow-up"></i> Khẩn cấp</span>' : 
                    (p.priority === 'high' ? '<span class="px-2 py-1 rounded text-[10px] font-bold bg-orange-50 text-orange-600 flex items-center gap-1"><i class="fa-solid fa-arrow-up"></i> Cao</span>' : '');

                let statusBadge = '';
                if (p.status === 'completed') statusBadge = '<span class="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold flex items-center gap-1"><i class="fa-solid fa-check"></i> Hoàn thành</span>';
                else if (p.status === 'in_progress') statusBadge = '<span class="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">Đang diễn ra</span>';
                else if (p.status === 'planned') statusBadge = '<span class="px-3 py-1.5 rounded-lg text-gray-600 text-xs font-bold border border-gray-200">Đã lên lịch</span>';

                const isSelected = this.selectedPlanId === p.id;
                const selClass = isSelected ? 'border-teal-500 shadow-md transform scale-[1.01]' : 'border-gray-200 hover:shadow-md hover:border-gray-300';

                html += `
                    <div class="bg-white border rounded-xl flex mb-3 transition-all duration-200 cursor-pointer overflow-hidden ${selClass}" 
                         onclick="WorkPlanModule.openDetailPanel(${p.id})">
                        <div class="w-1.5 ${tc.bgClass}"></div>
                        <div class="flex-1 p-4 flex items-start gap-6">
                            <div class="w-12 text-center shrink-0">
                                <span class="block text-sm font-bold text-gray-800">${st}</span>
                                ${et ? `<span class="block text-xs text-gray-400 mt-1">${et}</span>` : ''}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-[15px] font-bold text-gray-800 mb-1 flex items-center gap-2 truncate">
                                    <span class="${tc.color}">${tc.icon}</span> ${p.title}
                                </div>
                                <div class="text-xs text-gray-500 flex items-center gap-4">
                                    ${p.location ? `<span class="flex items-center gap-1 truncation"><i class="fa-solid fa-location-dot text-gray-400"></i> ${p.location}</span>` : ''}
                                    ${p.customer_name ? `<span class="flex items-center gap-1 truncation"><i class="fa-regular fa-user text-gray-400"></i> ${p.customer_name}</span>` : ''}
                                </div>
                                ${avatarsHtml}
                            </div>
                            <div class="flex items-center gap-3 shrink-0">
                                ${priorityBadge}
                                ${statusBadge}
                            </div>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    },

    // ===================================
    // RIGHT DETAIL PANEL
    // ===================================
    openDetailPanel: function(planId, keepSilent = false) {
        if (!planId) return;
        this.selectedPlanId = planId;
        const plan = this.plans.find(p => p.id == planId);
        if (!plan) return;

        // Switch to detail view
        this.switchMainView('detail');

        const bodyEl = document.getElementById('detail-body');
        bodyEl.innerHTML = '';
        
        let participantsHtml = '<div class="text-center text-gray-500 text-sm mt-5">Không có thành viên tham gia.</div>';
        if (plan.participants && plan.participants.length > 0) {
            participantsHtml = '<div class="grid grid-cols-2 gap-3 mt-4">';
            plan.participants.forEach(pa => {
                participantsHtml += `
                    <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-lg shadow-inner shrink-0">${(pa.full_name || pa.username || '?').charAt(0).toUpperCase()}</div>
                        <div class="min-w-0">
                            <div class="text-[13px] font-bold text-gray-800 truncate leading-snug">${pa.full_name || pa.username}</div>
                            <div class="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><i class="fa-solid fa-briefcase text-gray-400"></i> ${pa.role || 'Thành viên'}</div>
                        </div>
                    </div>
                `;
            });
            participantsHtml += '</div>';
        }

        
        const tc = this.getTypeConfig(plan.type);
        const st = new Date(plan.start_time).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'});
        
        const statuses = [
            {v: 'planned', label: 'Đã lên lịch'},
            {v: 'in_progress', label: 'Đang diễn ra'},
            {v: 'completed', label: 'Hoàn thành'},
            {v: 'cancelled', label: 'Đã hủy'}
        ];
        
        let statusPillsHtml = '';
        statuses.forEach(s => {
            if (s.v === plan.status) {
                statusPillsHtml += `<button class="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-teal-50 text-teal-700 border border-teal-200 shadow-sm" onclick="WorkPlanModule.updatePlanStatus(${plan.id}, '${s.v}')">${s.label}</button>`;
            } else {
                statusPillsHtml += `<button class="px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-white text-gray-500 border border-gray-200 hover:border-gray-300 transition" onclick="WorkPlanModule.updatePlanStatus(${plan.id}, '${s.v}')">${s.label}</button>`;
            }
        });

        let priorityBadge = '';
        if (plan.priority === 'urgent') priorityBadge = `<span class="px-2 py-0.5 rounded text-red-600 bg-red-50 text-[10px] font-bold border border-red-100 flex items-center gap-1"><i class="fa-solid fa-star-of-life text-[8px]"></i> Khẩn cấp</span>`;
        else if (plan.priority === 'high') priorityBadge = `<span class="px-2 py-0.5 rounded text-orange-600 bg-orange-50 text-[10px] font-bold border border-orange-100 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-[8px]"></i> Cao</span>`;

        let currentStatusObj = statuses.find(s => s.v === plan.status) || statuses[0];
        let statusBadge = `<span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">${currentStatusObj.label}</span>`;
        if (plan.status === 'in_progress') statusBadge = `<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">Đang diễn ra</span>`;
        if (plan.status === 'completed') statusBadge = `<span class="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">Hoàn thành</span>`;
        if (plan.status === 'cancelled') statusBadge = `<span class="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">Đã hủy</span>`;

        let projectHtml = '';
        if (plan.project_id || plan.customer_name) {
            projectHtml = `
            <div class="mb-5 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-wide">
                    <i class="fa-solid fa-building text-gray-400"></i> CÔNG TRÌNH / KHÁCH
                </div>
                <div class="bg-white p-4">
                    <h4 class="text-[14px] font-extrabold text-gray-800 mb-2 truncate" title="${plan.customer_name || 'ID: ' + plan.project_id}">${plan.customer_name || 'Dự án ID: ' + plan.project_id}</h4>
                    <div class="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1.5">
                        <span>Tiến độ</span>
                        <span>0%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-teal-500 rounded-full" style="width: 0%"></div>
                    </div>
                </div>
            </div>`;
        }

        const dateObj = new Date(plan.start_time);
        const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][dateObj.getDay()];
        const dateStr = dateObj.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'});
        
        const startTimeStr = dateObj.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
        let endTimeStr = '';
        let durationStr = '';
        if (plan.end_time) {
            const endObj = new Date(plan.end_time);
            endTimeStr = endObj.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
            const diffMs = endObj - dateObj;
            if(diffMs > 0) {
                const diffHours = Math.floor(diffMs / 3600000);
                const diffMins = Math.round((diffMs % 3600000) / 60000);
                durationStr = `(${diffHours > 0 ? diffHours + 'h' : ''}${diffMins > 0 ? diffMins + 'p' : ''})`;
            }
        }

        let defaultLocation = plan.location || (plan.project_id ? 'Tại công trình' : 'Không xác định');
        
        let dateTimeHtml = `
            <div class="bg-gray-50 rounded-xl p-4 border border-teal-50 flex flex-col gap-4 mb-5 shadow-sm relative overflow-hidden">
                <div class="absolute -right-6 -bottom-6 text-teal-600/5 text-9xl pointer-events-none transform -rotate-12"><i class="fa-regular fa-calendar-check"></i></div>
                <div class="flex items-start gap-4">
                    <div class="text-teal-600 mt-0.5"><i class="fa-regular fa-calendar-check text-lg"></i></div>
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Ngày</div>
                        <div class="text-[14px] font-extrabold text-gray-800">${dayOfWeek}, ${dateStr}</div>
                    </div>
                </div>
                
                <div class="flex items-start gap-4">
                    <div class="text-teal-600 mt-0.5"><i class="fa-regular fa-clock text-lg"></i></div>
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Thời gian</div>
                        <div class="text-[14px] font-extrabold text-gray-800">${startTimeStr} ${endTimeStr ? '— ' + endTimeStr : ''} <span class="text-gray-400 text-xs font-normal">${durationStr}</span></div>
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <div class="text-teal-600 mt-0.5"><i class="fa-solid fa-location-dot text-lg"></i></div>
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Địa điểm</div>
                        <div class="text-[13px] font-semibold text-gray-800 leading-snug">${defaultLocation}</div>
                        ${plan.location ? `<a href="https://maps.google.com/?q=${encodeURIComponent(plan.location)}" target="_blank" class="text-[11px] text-teal-600 font-bold hover:underline flex items-center gap-1 mt-1"><i class="fa-solid fa-map"></i> Xem bản đồ</a>` : ''}
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <div class="text-orange-500 mt-0.5"><i class="fa-regular fa-bell text-lg"></i></div>
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Nhắc nhở</div>
                        <div class="text-[13px] font-bold text-gray-800">15 phút trước</div>
                    </div>
                </div>
            </div>
        `;

        bodyEl.innerHTML = `
<div class="h-full flex flex-col bg-slate-50 relative">
    <!-- Header Area -->
    <div style="background-color: ${tc.hexBg};" class="px-6 pt-6 pb-5 shrink-0 relative transition-colors duration-300 border-b border-gray-200/50 shadow-sm">
        
        <button class="flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-teal-700 transition mb-5 hover:-translate-x-1" onclick="WorkPlanModule.closeDetailPanel()">
            <i class="fa-solid fa-arrow-left"></i> Quay lại danh sách
        </button>
        
        <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl ${tc.bgClass} text-white flex items-center justify-center shadow-md text-2xl font-bold shrink-0">
                    ${tc.icon}
                </div>
                <div class="min-w-0">
                    <h3 class="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">${tc.name}</h3>
                    <div class="flex flex-wrap items-center gap-2">
                       ${statusBadge}
                       ${priorityBadge}
                    </div>
                </div>
            </div>
            
            <div class="flex gap-2 shrink-0">
                <button class="h-10 px-4 flex items-center justify-center gap-2 rounded-xl border-2 border-teal-500 text-teal-600 font-bold hover:bg-teal-50 transition shadow-sm bg-white text-sm" onclick="WorkPlanModule.openEditModal(${plan.id})">
                    <i class="fa-solid fa-pen"></i> Sửa Kế Hoạch
                </button>
                <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50 transition shadow-sm bg-white" title="Xóa" onclick="WorkPlanModule.deletePlan(${plan.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
        
        <h2 class="text-2xl font-extrabold text-gray-800 leading-snug mb-5">${plan.title}</h2>
        
        <div class="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-3">
            <span>Tiến độ checklist</span>
            <span>0/5</span>
        </div>
        
        <!-- Status Pills -->
        <div class="flex gap-2 overflow-x-auto mini-scroll pb-2 mt-1">
            ${statusPillsHtml}
        </div>
    </div>

    <!-- Tabs Row -->
    <div class="flex border-b border-gray-100 bg-white shrink-0 overflow-x-auto mini-scroll shadow-sm relative w-full px-2" id="detailTabsRow">
        <button class="flex items-center justify-center px-4 py-3 border-b-2 border-teal-500 text-teal-600 transition shrink-0 gap-2" onclick="WorkPlanModule.switchDetailTab('info', this)">
            <i class="fa-solid fa-circle-info text-sm"></i>
            <span class="text-[11px] font-bold whitespace-nowrap">Thông tin</span>
        </button>
        <button class="flex items-center justify-center px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition shrink-0 gap-2" onclick="WorkPlanModule.switchDetailTab('logs', this); WorkPlanModule.loadLogs(${plan.id})">
            <i class="fa-regular fa-file-alt text-sm"></i>
            <span class="text-[11px] font-bold whitespace-nowrap">Nhật ký</span>
        </button>
        <button class="flex items-center justify-center px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition shrink-0 gap-2" onclick="WorkPlanModule.switchDetailTab('checklist', this); WorkPlanModule.loadChecklist(${plan.id})">
            <i class="fa-solid fa-calendar-check text-sm"></i>
            <span class="text-[11px] font-bold whitespace-nowrap">Checklist</span>
        </button>
        <button class="flex items-center justify-center px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition shrink-0 gap-2" onclick="WorkPlanModule.switchDetailTab('members', this)">
            <i class="fa-solid fa-users text-sm"></i>
            <span class="text-[11px] font-bold whitespace-nowrap">Thành viên</span>
        </button>
        <button class="flex items-center justify-center px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition shrink-0 gap-2" onclick="WorkPlanModule.switchDetailTab('discussion', this); WorkPlanModule.openDiscussionTab(${plan.id})">
            <i class="fa-regular fa-comments text-sm"></i>
            <span class="text-[11px] font-bold whitespace-nowrap">Thảo luận</span>
        </button>
    </div>

    <!-- Content Area (Scrollable) -->
    <div class="flex-1 overflow-y-auto p-4 scrollable-body bg-white relative z-0">
        
        <!-- Tab: Thông tin -->
        <div id="detailTab-info" class="detail-tab-content">
            ${projectHtml}
            ${dateTimeHtml}

            <!-- Tags -->
            <div class="mb-5 border-b border-gray-100 pb-5 pt-3">
                <div class="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">🏷️ Tags</div>
                <div class="flex flex-wrap gap-1.5">
                    <span class="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[11px] font-bold shadow-sm">#${plan.type}</span>
                    ${plan.priority === 'urgent' ? '<span class="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-[11px] font-bold shadow-sm">#khẩn_cấp</span>':''}
                </div>
            </div>

            <!-- Description -->
            <div class="mb-5 pb-5">
                <div class="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 mb-2 uppercase tracking-wide"><i class="fa-regular fa-file-lines"></i> MÔ TẢ & GHI CHÚ</div>
                <div class="bg-gray-50 rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap ${!plan.description && !plan.meeting_note ? 'italic text-gray-400 text-center':''} shadow-sm">${plan.description || plan.meeting_note || 'Chưa có mô tả chi tiết...'}</div>
            </div>
        </div>

        <!-- Tab: Nhật ký -->
        <div id="detailTab-logs" class="detail-tab-content hidden">
            <div id="detailLogsList" class="flex flex-col gap-4 mb-4">
                <div class="text-center text-gray-400 italic text-xs my-5"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải nhật ký...</div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100">
                <textarea id="newLogInput" placeholder="Nhập tiến độ hoặc vấn đề phát sinh mới..." class="w-full text-sm p-3 border border-gray-200 rounded-lg outline-none focus:border-teal-500 min-h-[80px] mb-2 bg-gray-50 focus:bg-white transition"></textarea>
                <div class="flex justify-end gap-2">
                    <select id="newLogAction" class="text-xs border border-gray-200 rounded-lg px-2 outline-none text-gray-600">
                        <option value="Báo cáo tiến độ">Báo cáo tiến độ</option>
                        <option value="Gặp sự cố">Gặp sự cố</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                    </select>
                    <button class="bg-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-teal-700 transition" onclick="WorkPlanModule.addLog(${plan.id})"><i class="fa-solid fa-paper-plane mr-1.5"></i>Lưu nhật ký</button>
                </div>
            </div>
        </div>

        <!-- Tab: Checklist -->
        <div id="detailTab-checklist" class="detail-tab-content hidden">
            <div class="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-[11px] font-extrabold text-teal-800 uppercase">Tiến độ Checklist</h4>
                    <div class="text-xs font-bold text-teal-700"><span id="checklistProgressText">0%</span> (0/0)</div>
                </div>
                <div class="w-full h-2 bg-white rounded-full overflow-hidden border border-teal-100/50">
                    <div id="checklistProgressBar" class="h-full bg-teal-500 rounded-full transition-all duration-500 relative" style="width: 0%">
                        <div class="absolute inset-0 bg-white/20 w-full h-full skew-x-12 animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div id="detailChecklistList" class="flex flex-col gap-2 mb-4 mini-scroll max-h-[250px] overflow-y-auto pr-1">
                <div class="text-center text-gray-400 italic text-xs my-5"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải checklist...</div>
            </div>
            <div class="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                <input type="text" id="newChecklistInput" placeholder="Thêm việc cần làm..." class="w-full text-sm p-3 pr-10 outline-none" onkeypress="if(event.key === 'Enter') WorkPlanModule.addChecklistItem(${plan.id})">
                <button class="absolute right-1 top-1 bottom-1 w-10 text-teal-600 hover:bg-teal-50 rounded-lg transition flex items-center justify-center font-bold" onclick="WorkPlanModule.addChecklistItem(${plan.id})">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>

        <!-- Tab: Thành viên -->
        <div id="detailTab-members" class="detail-tab-content hidden">
            ${participantsHtml}
        </div>
        
        <!-- Tab: Thảo luận (Discussion / Chat) -->
        <div id="detailTab-discussion" class="detail-tab-content hidden flex-col h-[600px] border border-gray-100 rounded-xl overflow-hidden mt-2 shadow-sm bg-gray-50 relative">
            <div class="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><i class="fa-regular fa-comment-dots"></i></div>
                    <div>
                        <h4 class="text-[13px] font-bold text-gray-800">Trao đổi nội bộ</h4>
                        <div class="text-[10px] text-teal-600 font-semibold italic" id="chatSubtitle">Đang kết nối...</div>
                    </div>
                </div>
            </div>
            <div class="flex-1 p-4 overflow-y-auto scrollable-body mini-scroll pb-4 flex flex-col pt-6" id="chatArea">
                <div class="text-center text-gray-400 mt-5"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải...</div>
            </div>
            <div class="p-3 bg-white border-t flex gap-2 shrink-0 relative z-10 w-full">
                <input type="text" id="chatInput" placeholder="Nhập tin nhắn..." class="flex-1 text-sm p-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition" onkeypress="if(event.key === 'Enter') WorkPlanModule.sendComment()">
                <button class="w-[48px] h-[48px] rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow flex items-center justify-center transition" onclick="WorkPlanModule.sendComment()">
                    <i class="fa-solid fa-paper-plane text-sm xl"></i>
                </button>
            </div>
        </div>

    </div>
        <!-- Chat Float Button -->
        <button class="absolute -top-[52px] right-4 w-[46px] h-[46px] rounded-full bg-teal-600 text-white flex items-center justify-center shadow-[0_5px_15px_rgba(13,148,136,0.3)] hover:bg-teal-700 hover:-translate-y-1 transition-all" onclick="WorkPlanModule.openChatModal(${plan.id})">
            <i class="fa-regular fa-comment-dots text-lg"></i>
        </button>
    </div>
</div>
        `;
    },

    switchDetailTab: function(tabStr, btnEl) {
        document.querySelectorAll('.detail-tab-content').forEach(el => el.classList.add('hidden'));
        document.getElementById('detailTabsRow').querySelectorAll('button').forEach(b => {
            b.classList.remove('border-teal-500', 'text-teal-600');
            b.classList.add('border-transparent', 'text-gray-400');
        });

        const target = document.getElementById('detailTab-' + tabStr);
        if(target) target.classList.remove('hidden');

        btnEl.classList.remove('border-transparent', 'text-gray-400');
        btnEl.classList.add('border-teal-500', 'text-teal-600');
    },

    loadLogs: async function(planId) {
        const container = document.getElementById('detailLogsList');
        if (!container) return;
        container.innerHTML = '<div class="text-center text-gray-400 italic text-[11px] my-5"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải nhật ký...</div>';
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${planId}/logs`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.renderLogs(data.data || []);
            }
        } catch (e) {}
    },

    renderLogs: function(logs) {
        const container = document.getElementById('detailLogsList');
        if (!container) return;
        if (logs.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 italic text-[11px] my-5 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3">Chưa có nhật ký tiến độ nào.</div>';
            return;
        }

        let html = '';
        logs.forEach(l => {
            const timeStr = new Date(l.created_at).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'});
            let iconObj = {c:'bg-blue-100 text-blue-600', i:'fa-info'};
            if(l.action === 'Hoàn thành') iconObj = {c:'bg-green-100 text-green-600', i:'fa-check'};
            if(l.action === 'Gặp sự cố') iconObj = {c:'bg-red-100 text-red-600', i:'fa-triangle-exclamation'};

            html += `
                <div class="flex gap-3">
                    <div class="flex flex-col items-center">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconObj.c} text-[10px] mt-0.5 border border-white shadow-sm ring-2 ring-gray-50"><i class="fa-solid ${iconObj.i}"></i></div>
                        <div class="w-[2px] h-full bg-gray-100 my-1 rounded-full"></div>
                    </div>
                    <div class="flex-1 pb-4">
                        <div class="flex items-center justify-between mb-1.5 line-height-none">
                            <span class="text-xs font-bold text-gray-800 tracking-tight">${l.action}</span>
                            <span class="text-[10px] text-gray-400 font-bold">${timeStr}</span>
                        </div>
                        <div class="bg-gray-50 rounded-xl rounded-tl-none p-3 text-[13px] text-gray-700 leading-relaxed break-words whitespace-pre-wrap border border-gray-100/60 shadow-sm">${this.escapeHTML(l.description || 'Không có ghi chú')}</div>
                        <div class="text-[10px] text-gray-500 font-bold mt-1.5 flex items-center gap-1.5">
                            <div class="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-600">${l.full_name.charAt(0)}</div>
                            ${l.full_name}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    addLog: async function(planId) {
        const input = document.getElementById('newLogInput');
        const actionSelect = document.getElementById('newLogAction');
        const description = input.value.trim();
        if (!description) return;

        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${planId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: actionSelect.value, description })
            });
            if (res.ok) {
                input.value = '';
                this.loadLogs(planId);
            }
        } catch (e) {}
    },

    loadChecklist: async function(planId) {
        const container = document.getElementById('detailChecklistList');
        if (!container) return;
        container.innerHTML = '<div class="text-center text-gray-400 italic text-[11px] my-5"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải checklist...</div>';
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${planId}/checklists`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.renderChecklist(planId, data.data || []);
            }
        } catch (e) {}
    },

    renderChecklist: function(planId, items) {
        const container = document.getElementById('detailChecklistList');
        if (!container) return;
        
        const total = items.length;
        const completed = items.filter(i => i.is_completed).length;
        const ptg = total === 0 ? 0 : Math.round((completed / total) * 100);

        const progressText = document.getElementById('checklistProgressText');
        const progressBar = document.getElementById('checklistProgressBar');
        if (progressText) progressText.textContent = `${ptg}%`;
        if (progressBar) progressBar.style.width = `${ptg}%`;

        document.querySelector('.bg-teal-50 .text-xs.font-bold.text-teal-700').innerHTML = `<span id="checklistProgressText">${ptg}%</span> (${completed}/${total})`;
        
        if (total === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 italic text-[11px] my-5 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">Chưa có công việc nào cần làm.</div>';
            return;
        }

        let html = '';
        items.forEach(item => {
            const checkIcon = item.is_completed ? 'fa-solid fa-circle-check text-teal-500' : 'fa-regular fa-circle text-gray-300 group-hover:text-teal-400';
            const textClass = item.is_completed ? 'line-through text-gray-400 font-semibold' : 'text-gray-800 font-bold';
            const byText = item.is_completed ? `<div class="text-[9px] text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap inline-flex items-center"><i class="fa-solid fa-check mr-0.5"></i>${item.completed_by_name?.split(' ').pop() || 'Ai đó'}</div>` : '';

            html += `
                <div class="flex items-center group p-2.5 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100 -mx-1">
                    <button class="w-6 h-6 flex items-center justify-center text-xl shrink-0 outline-none transition-transform active:scale-90" onclick="WorkPlanModule.toggleChecklistItem(${planId}, ${item.id}, ${item.is_completed ? 0 : 1})">
                        <i class="${checkIcon} transition-colors"></i>
                    </button>
                    <div class="ml-3 flex-1 text-[13px] ${textClass} break-words leading-tight flex flex-wrap items-center gap-1">
                        ${this.escapeHTML(item.title)} ${byText}
                    </div>
                    <button class="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" onclick="WorkPlanModule.deleteChecklistItem(${planId}, ${item.id})">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    },

    addChecklistItem: async function(planId) {
        const input = document.getElementById('newChecklistInput');
        const title = input.value.trim();
        if (!title) return;

        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${planId}/checklists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title })
            });
            if (res.ok) {
                input.value = '';
                this.loadChecklist(planId);
            }
        } catch (e) {}
    },

    toggleChecklistItem: async function(planId, itemId, checked) {
        try {
            const token = window.AuthHelper.getToken();
            await fetch(`${API_BASE}/work-plans/${planId}/checklists/${itemId}/toggle`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ is_completed: checked ? 1 : 0 })
            });
            this.loadChecklist(planId);
        } catch (e) {}
    },

    deleteChecklistItem: async function(planId, itemId) {
        let confirmFn = window.confirm.bind(window);
        if(!confirmFn('Xóa công việc việc này khỏi checklist?')) return;
        try {
            const token = window.AuthHelper.getToken();
            await fetch(`${API_BASE}/work-plans/${planId}/checklists/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            this.loadChecklist(planId);
        } catch (e) {}
    },

    closeDetailPanel: function() {
        this.selectedPlanId = null;
        const prev = this.previousMainView || 'list';
        this.switchMainView(prev);
        
        // Ensure Main Tabs highlight matches
        document.querySelectorAll('#main-tabs .nav-tab').forEach(t => t.classList.remove('active'));
        const tabEl = document.querySelector(`#main-tabs .nav-tab[data-view="${prev}"]`);
        if (tabEl) tabEl.classList.add('active');
    },

    // ===================================
    // CALENDAR VIEW (Fullcalendar)
    // ===================================
    updateCalendarData: function(plans) {
        if (!this.calendar) return;
        this.calendar.removeAllEvents();
        const events = plans.map(p => {
            return {
                id: p.id,
                title: p.title,
                start: p.start_time,
                end: p.end_time || p.start_time,
                extendedProps: { type: p.type, status: p.status, participants: p.participants }
            };
        });
        this.calendar.addEventSource(events);
    },

    renderCalendarEvent: function(arg) {
        const p = arg.event.extendedProps;
        const tc = this.getTypeConfig(p.type);
        const isSelected = this.selectedPlanId == arg.event.id;
        
        let avs = '';
        if (p.participants && p.participants.length > 0) {
            avs = '<div class="flex flex-row-reverse justify-end mt-[2px] -space-x-[2px] space-x-reverse">';
            p.participants.slice(0, 3).forEach(pa => {
                avs += `<div class="w-[14px] h-[14px] rounded-full bg-slate-300 border border-white text-[7px] flex items-center justify-center font-bold text-white">${(pa.full_name||pa.username||'?').charAt(0).toUpperCase()}</div>`;
            });
            avs += '</div>';
        }

        const selClass = isSelected ? 'ring-2 ring-teal-500 shadow-lg !z-50 scale-105' : '';

        const html = `
            <div class="h-full w-full rounded relative overflow-hidden transition-all duration-200 border-l-[3px] ${tc.borderClass} ${selClass}" style="background-color: ${tc.hexBg}; padding: 3px 4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);">
                <div class="text-[9px] font-bold ${tc.color} truncate leading-none mb-[2px] opacity-90">${arg.timeText}</div>
                <div class="text-[10px] font-bold text-gray-800 leading-[1.1] line-clamp-2 mix-blend-multiply">${tc.icon} ${arg.event.title}</div>
                ${avs}
            </div>
        `;
        return { html: html };
    },

    getTypeConfig: function(type) {
        switch(type) {
            case 'meeting': return { name: 'Hợp công ty', icon: '<i class="fa-solid fa-users"></i>', color: 'text-teal-700', bgClass: 'bg-teal-500', borderClass: 'border-teal-400', hexBg: '#e6fffa', bg: 'bg-teal-100' };
            case 'client': return { name: 'Gặp khách hàng', icon: '<i class="fa-solid fa-handshake"></i>', color: 'text-amber-700', bgClass: 'bg-amber-500', borderClass: 'border-amber-400', hexBg: '#fef3c7', bg: 'bg-amber-100' };
            case 'survey': return { name: 'Đo đạc / Khảo sát', icon: '<i class="fa-solid fa-ruler-combined"></i>', color: 'text-rose-700', bgClass: 'bg-rose-500', borderClass: 'border-rose-400', hexBg: '#ffe4e6', bg: 'bg-rose-100' };
            case 'supervision': return { name: 'Giám sát CT', icon: '<i class="fa-solid fa-helmet-safety"></i>', color: 'text-orange-700', bgClass: 'bg-orange-500', borderClass: 'border-orange-400', hexBg: '#ffedd5', bg: 'bg-orange-100' };
            default: return { name: 'Công việc nội bộ', icon: '<i class="fa-solid fa-list-check"></i>', color: 'text-slate-700', bgClass: 'bg-slate-500', borderClass: 'border-slate-400', hexBg: '#f1f5f9', bg: 'bg-slate-200' };
        }
    },


    // ===================================
    // MODAL LOGIC 
    // ===================================
    openCreateModal: function(dateStr) {
        this.currentPlanId = null;
        document.getElementById('planId').value = '';
        document.getElementById('planForm').reset();
        
        const now = dateStr ? new Date(dateStr) : new Date();
        if (!dateStr) now.setHours(now.getHours() + 1, 0, 0, 0);
        else now.setHours(8, 0, 0, 0);
        
        const tzOffset = now.getTimezoneOffset() * 60000;
        document.getElementById('p_start_time').value = (new Date(now - tzOffset)).toISOString().slice(0, 16);
        document.getElementById('p_end_time').value = (new Date((new Date(now.getTime() + 60*60*1000)) - tzOffset)).toISOString().slice(0, 16);

        document.getElementById('planModalTitle').textContent = 'Tạo Kế Hoạch Mới';
        document.getElementById('btnDeletePlan').classList.add('hidden');
        
        document.querySelectorAll('input[name="plan_participants"]').forEach(cb => cb.checked = false);
        this.updateParticipantCount();

        this.selectType('internal');
        this.selectPriority('normal');
        this.selectStatus('planned');
        this.switchTab('info', document.querySelector('#planTabsContainer button:first-child'));
        
        document.getElementById('planModal').classList.remove('hidden');
    },

    openEditModal: async function(id) {
        try {
            const plan = this.plans.find(p => p.id == id);
            if (!plan) return;

            this.currentPlanId = id;
            document.getElementById('planId').value = plan.id;
            
            document.getElementById('p_title').value = plan.title || '';
            this.selectType(plan.type || 'internal');
            this.selectPriority(plan.priority || 'normal');
            this.selectStatus(plan.status || 'planned');
            
            if (plan.start_time) document.getElementById('p_start_time').value = new Date(plan.start_time).toISOString().slice(0, 16);
            if (plan.end_time) document.getElementById('p_end_time').value = new Date(plan.end_time).toISOString().slice(0, 16);
            
            document.getElementById('p_location').value = plan.location || '';
            document.getElementById('p_project_id').value = plan.project_id || '';
            document.getElementById('p_customer_name').value = plan.customer_name || '';
            document.getElementById('p_description').value = plan.description || plan.meeting_note || '';

            const pIds = (plan.participants || []).map(p => p.user_id.toString());
            document.querySelectorAll('input[name="plan_participants"]').forEach(cb => { cb.checked = pIds.includes(cb.value); });
            this.updateParticipantCount();

            document.getElementById('planModalTitle').textContent = 'Sửa: ' + plan.title;
            document.getElementById('btnDeletePlan').classList.remove('hidden');

            this.switchTab('info', document.querySelector('#planTabsContainer button:first-child'));
            document.getElementById('planModal').classList.remove('hidden');

        } catch (e) {
            console.error(e);
        }
    },

    selectType: function(val) {
        document.getElementById('p_type').value = val;
        document.querySelectorAll('.type-radio-card').forEach(card => {
            if (card.dataset.type === val) { card.classList.add('selected'); card.querySelector('.check-icon').classList.remove('hidden'); } 
            else { card.classList.remove('selected'); card.querySelector('.check-icon').classList.add('hidden'); }
        });
    },

    selectPriority: function(val) {
        document.getElementById('p_priority').value = val;
        document.querySelectorAll('.btn-radio[data-priority]').forEach(b => {
            if (b.dataset.priority === val) b.classList.add('selected'); else b.classList.remove('selected');
        });
    },

    selectStatus: function(val) {
        document.getElementById('p_status').value = val;
        document.querySelectorAll('.btn-radio[data-status]').forEach(b => {
            if (b.dataset.status === val) b.classList.add('selected'); else b.classList.remove('selected');
        });
    },

    switchTab: function(tabStr, btnEl) {
        document.getElementById('tabInfoContent').style.display = tabStr === 'info' ? 'block' : 'none';
        document.getElementById('tabParticipantsContent').style.display = tabStr === 'participants' ? 'block' : 'none';

        document.getElementById('planTabsContainer').querySelectorAll('button').forEach(b => {
            b.classList.remove('border-teal-600', 'text-teal-700');
            b.classList.add('border-transparent', 'text-gray-500');
        });
        
        btnEl.classList.remove('border-transparent', 'text-gray-500');
        btnEl.classList.add('border-teal-600', 'text-teal-700');
    },

    updateParticipantCount: function() {
        const len = document.querySelectorAll('input[name="plan_participants"]:checked').length;
        document.getElementById('modal-participant-count').textContent = len;
    },

    renderUserCheckboxes: function() {
        const container = document.getElementById('participantsCheckboxes');
        if (!container) return;
        
        if (this.users.length === 0) {
            container.innerHTML = '<span class="text-gray-500 text-sm col-span-2 text-center">Không có dữ liệu nhân viên.</span>';
            return;
        }

        let html = '';
        this.users.forEach(u => {
            html += `
                <label class="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded-xl border border-transparent hover:border-gray-200 transition-all shadow-sm bg-gray-50">
                    <input type="checkbox" name="plan_participants" value="${u.id}" class="rounded text-teal-600 focus:ring-teal-500 w-5 h-5 accent-teal-600">
                    <div class="flex-1 min-w-0">
                        <span class="block text-sm font-bold text-gray-800 truncate">${u.full_name || u.username}</span>
                        <span class="block text-[10px] text-gray-400">${u.role}</span>
                    </div>
                </label>
            `;
        });
        container.innerHTML = html;
    },

    savePlan: async function() {
        const form = document.getElementById('planForm');
        // If form is invalid and we are on a different tab, switch to info tab so reportValidity works
        if (!form.checkValidity()) {
            this.switchTab('info', document.querySelector('#planTabsContainer button:first-child'));
            setTimeout(() => { form.reportValidity(); }, 50);
            return;
        }

        const pIds = Array.from(document.querySelectorAll('input[name="plan_participants"]:checked')).map(cb => parseInt(cb.value));

        const payload = {
            title: document.getElementById('p_title').value,
            type: document.getElementById('p_type').value,
            status: document.getElementById('p_status').value,
            priority: document.getElementById('p_priority').value,
            start_time: document.getElementById('p_start_time').value,
            end_time: document.getElementById('p_end_time').value,
            location: document.getElementById('p_location').value,
            project_id: document.getElementById('p_project_id').value ? parseInt(document.getElementById('p_project_id').value) : null,
            customer_name: document.getElementById('p_customer_name').value || null,
            description: document.getElementById('p_description').value,
            meeting_note: document.getElementById('p_description').value, // Fallback for old API
            participants: pIds
        };

        try {
            const token = window.AuthHelper.getToken();
            const method = this.currentPlanId ? 'PUT' : 'POST';
            const url = this.currentPlanId ? `${API_BASE}/work-plans/${this.currentPlanId}` : `${API_BASE}/work-plans`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                document.getElementById('planModal').classList.add('hidden');
                setTimeout(() => this.loadPlans(), 200);
            } else {
                const data = await res.json();
                alert('Lỗi: ' + (data.message || 'Không thể lưu.'));
            }
        } catch (e) {
            console.error(e);
        }
    },

    deletePlan: async function(overrideId) {
        const id = overrideId || this.currentPlanId;
        if (!id) return;
        
        let confirmFn = window.confirm.bind(window);
        if (window.VWModal && typeof window.VWModal.confirm === 'function') {
            const isConfirmed = await window.VWModal.confirm('Xóa?', 'Bạn có chắc muốn xóa lịch trình này?', 'error');
            if(!isConfirmed) return;
        } else {
            if (!confirmFn('Bạn có chắc muốn xóa lịch trình này?')) return;
        }

        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                document.getElementById('planModal').classList.add('hidden');
                if (this.selectedPlanId === id) this.closeDetailPanel();
                setTimeout(() => this.loadPlans(), 200);
            }
        } catch (e) {
            console.error(e);
        }
    },

    updatePlanStatus: async function(id, newStatus) {
        let confirmFn = window.confirm.bind(window);
        if (window.VWModal && typeof window.VWModal.confirm === 'function') {
            const isConfirmed = await window.VWModal.confirm('Xác nhận', 'Chuyển trạng thái kế hoạch này?');
            if(!isConfirmed) return;
        } else {
            if (!confirmFn('Chuyển trạng thái kế hoạch này?')) return;
        }

        const plan = this.plans.find(p => p.id == id);
        if (!plan) return;

        const payload = {
            title: plan.title, type: plan.type, status: newStatus, priority: plan.priority,
            start_time: plan.start_time, end_time: plan.end_time,
            location: plan.location, project_id: plan.project_id, customer_name: plan.customer_name,
            description: plan.description || plan.meeting_note,
            participants: (plan.participants || []).map(p => p.user_id)
        };

        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                if(window.VWModal) VWModal.success('Cập nhật trạng thái thành công!');
                await this.loadPlans();
                this.openDetailPanel(id, true);
            } else {
                alert('Lỗi khi cập nhật trạng thái');
            }
        } catch (e) {
            console.error(e);
        }
    },

    openDiscussionTab: function(id) {
        const plan = this.plans.find(p => p.id == id);
        if (!plan) return;
        
        this.currentChatPlanId = id;
        const sub = document.getElementById('chatSubtitle');
        if(sub) sub.textContent = 'Đang kết nối...';
        
        const input = document.getElementById('chatInput');
        if(input) input.focus();

        if (this.socket) {
            if(this.currentChatRoom) this.socket.emit('leave_module', { module: this.currentChatRoom });
            this.currentChatRoom = 'work_plan_discussion_' + plan.id;
            this.socket.emit('join_module',  { module: this.currentChatRoom });
            if(sub) sub.textContent = 'Đã kết nối Socket';
        }
        this.loadComments(id);
    },

    loadComments: async function(planId) {
        document.getElementById('chatArea').innerHTML = '<div class="text-center text-gray-400 mt-5"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải...</div>';
        try {
            const token = window.AuthHelper.getToken();
            const res = await fetch(`${API_BASE}/work-plans/${planId}/comments`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const data = await res.json();
                this.renderComments(data.data || []);
            }
        } catch (e) {}
    },

    renderComments: function(comments) {
        const area = document.getElementById('chatArea');
        if (comments.length === 0) {
            area.innerHTML = '<div class="text-center text-gray-400 mt-5 text-sm">Chưa có bình luận nào.</div>';
            return;
        }

        let html = '';
        comments.forEach(c => {
            const isMine = c.user_id === this.currentUser.id;
            html += `
                <div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 w-full">
                    ${!isMine ? `<div class="w-8 h-8 rounded-full bg-slate-200 mr-2 flex items-center justify-center text-xs font-bold shrink-0">${c.full_name.charAt(0)}</div>` : ''}
                    <div class="max-w-[75%]">
                        ${!isMine ? `<div class="text-[10px] font-bold text-gray-500 ml-1 mb-0.5">${c.full_name}</div>` : ''}
                        <div class="p-3 ${isMine ? 'bg-teal-100 text-teal-900 rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'} rounded-2xl text-[13px] leading-relaxed break-words">${this.escapeHTML(c.message)}</div>
                        <div class="text-[9px] text-gray-400 mt-0.5 ${isMine?'text-right pr-1':'pl-1'}">${new Date(c.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                </div>
            `;
        });
        area.innerHTML = html;
        setTimeout(() => area.scrollTop = area.scrollHeight, 100);
    },

    sendComment: async function() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text || !this.currentChatPlanId) return;

        input.value = '';
        input.disabled = true;

        try {
            const token = window.AuthHelper.getToken();
            await fetch(`${API_BASE}/work-plans/${this.currentChatPlanId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: text })
            });
        } catch (e) {} finally {
            input.disabled = false;
            input.focus();
        }
    },

    appendCommentToUI: function(c) {
        const area = document.getElementById('chatArea');
        const emptyMsg = area.querySelector('.text-center');
        if (emptyMsg) emptyMsg.remove();

        const isMine = c.user_id === this.currentUser.id;
        const cHtml = `
            <div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 w-full">
                ${!isMine ? `<div class="w-8 h-8 rounded-full bg-slate-200 mr-2 flex items-center justify-center text-xs font-bold shrink-0">${(c.full_name||'?').charAt(0)}</div>` : ''}
                <div class="max-w-[75%]">
                    ${!isMine ? `<div class="text-[10px] font-bold text-gray-500 ml-1 mb-0.5">${c.full_name}</div>` : ''}
                    <div class="p-3 ${isMine ? 'bg-teal-100 text-teal-900 rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'} rounded-2xl text-[13px] leading-relaxed break-words">${this.escapeHTML(c.message)}</div>
                </div>
            </div>
        `;
        area.insertAdjacentHTML('beforeend', cHtml);
        area.scrollTop = area.scrollHeight;
    },

    initSocket: function() {
        const token = window.AuthHelper.getToken();
        if (!token) return;

        this.socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
        this.socket.on('connect', () => {
            this.socket.emit('join_module', { module: 'work_plans' });
            if (this.currentChatPlanId) {
                this.currentChatRoom = 'work_plan_discussion_' + this.currentChatPlanId;
                this.socket.emit('join_module', { module: this.currentChatRoom });
                const sub = document.getElementById('chatSubtitle');
                if (sub) sub.textContent = 'Đã kết nối Socket';
            }
        });

        this.socket.on('data_changed', (payload) => {
            if (payload.module === 'work_plans') this.loadPlans();
        });

        this.socket.on('new_comment', (comment) => {
            if (comment.work_plan_id == this.currentChatPlanId) this.appendCommentToUI(comment);
        });
    },

    escapeHTML: function(str) {
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('participantsCheckboxes')?.addEventListener('change', () => { WorkPlanModule.updateParticipantCount(); });
    WorkPlanModule.init();
});
