// Mock API Server cho demo
// Chạy: node api/mock-api.js
// Hoặc: npm install express && node api/mock-api.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Data
const mockAluminumSystems = [
    { id: 1, code: 'XF-001', name: 'Thanh ngang cửa đi', brand: 'Xingfa', thickness_mm: 1.4, weight_per_meter: 1.2, cutting_formula: 'W - 50' },
    { id: 2, code: 'XF-002', name: 'Thanh dọc cửa đi', brand: 'Xingfa', thickness_mm: 1.4, weight_per_meter: 1.5, cutting_formula: 'H - 30' },
    { id: 3, code: 'PMA-101', name: 'Thanh ngang cửa sổ', brand: 'PMA', thickness_mm: 1.2, weight_per_meter: 1.0, cutting_formula: 'W - 45' },
    { id: 4, code: 'VP-201', name: 'Thanh dọc lùa', brand: 'Việt Pháp', thickness_mm: 1.6, weight_per_meter: 1.8, cutting_formula: 'H - 40' }
];

const mockAccessories = [
    { id: 1, code: 'PK-001', name: 'Khóa tay gạt inox 304', category: 'Khóa', unit: 'Bộ', sale_price: 250000, stock_quantity: 45 },
    { id: 2, code: 'PK-002', name: 'Bản lề 3D cao cấp', category: 'Bản lề', unit: 'Cái', sale_price: 85000, stock_quantity: 120 },
    { id: 3, code: 'PK-003', name: 'Tay nắm nhôm đúc', category: 'Tay nắm', unit: 'Cái', sale_price: 120000, stock_quantity: 8 }
];

const mockProjects = [
    { id: 1, project_code: 'CT2025-001', project_name: 'Biệt thự Hòa Lạc', customer_name: 'Anh Tuấn', phone: '0988 123 456', status: 'approved', progress_percent: 75, total_value: 156300000 },
    { id: 2, project_code: 'CT2025-002', project_name: 'Nhà phố Thanh Xuân', customer_name: 'Chị Lan', phone: '0912 345 678', status: 'approved', progress_percent: 20, total_value: 89500000 }
];

// Routes

// GET /api/aluminum-systems
app.get('/api/aluminum-systems', (req, res) => {
    res.json({ success: true, data: mockAluminumSystems });
});

// GET /api/accessories
app.get('/api/accessories', (req, res) => {
    const { search, category } = req.query;
    let filtered = mockAccessories;
    
    if (search) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
    }
    
    res.json({ success: true, data: filtered });
});

// GET /api/projects
app.get('/api/projects', (req, res) => {
    const { status, progress, search } = req.query;
    let filtered = mockProjects;
    
    if (status && status !== 'all') {
        filtered = filtered.filter(p => p.status === status);
    }
    
    if (progress && progress !== 'all') {
        const [min, max] = progress.split('-').map(Number);
        filtered = filtered.filter(p => p.progress_percent >= min && p.progress_percent <= max);
    }
    
    if (search) {
        filtered = filtered.filter(p => 
            p.project_name.toLowerCase().includes(search.toLowerCase()) ||
            p.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            p.project_code.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({ success: true, data: filtered, count: filtered.length });
});

// POST /api/calculate-bom
app.post('/api/calculate-bom', (req, res) => {
    const { doorType, width, height, panels, aluminumSystemId } = req.body;
    
    // Mock calculation
    const bom = {
        frame: [
            { code: 'XF-001', name: 'Thanh ngang trên', length_mm: width - 50, quantity: 1, unit: 'thanh', weight_kg: 1.38 },
            { code: 'XF-001', name: 'Thanh ngang dưới', length_mm: width - 50, quantity: 1, unit: 'thanh', weight_kg: 1.38 },
            { code: 'XF-002', name: 'Thanh dọc trái', length_mm: height - 30, quantity: 1, unit: 'thanh', weight_kg: 3.10 },
            { code: 'XF-002', name: 'Thanh dọc phải', length_mm: height - 30, quantity: 1, unit: 'thanh', weight_kg: 3.10 }
        ],
        glass: [
            { code: 'GLASS-6MM', name: `Kính 6mm (${width - 40}x${height - 40})`, quantity: 1, unit: 'tấm' }
        ],
        accessories: [
            { code: 'LOCK-01', name: 'Khóa tay gạt', quantity: 1, unit: 'bộ' },
            { code: 'HINGE-01', name: 'Bản lề', quantity: 3, unit: 'cái' },
            { code: 'SEAL-01', name: 'Gioăng cao su', quantity: 7, unit: 'mét' }
        ],
        total_weight: 8.97
    };
    
    res.json({ success: true, data: bom });
});

// POST /api/optimize-cutting
app.post('/api/optimize-cutting', (req, res) => {
    const { bomItems } = req.body;
    
    // Mock optimization
    const optimization = {
        total_profiles: 2,
        average_efficiency: 53.7,
        total_waste: 5560,
        reusable_decal: 2,
        cutting_plans: [
            {
                profile_id: 1,
                profile_length: 6000,
                efficiency: 72.8,
                waste: 1630,
                cuts: [
                    { item: 'Ngang dưới', length: 1150, color: 'blue' },
                    { item: 'Ngang trên', length: 1150, color: 'green' },
                    { item: 'Dọc phải', length: 2070, color: 'purple' },
                    { item: 'Decal', length: 1630, color: 'orange', reusable: true }
                ]
            },
            {
                profile_id: 2,
                profile_length: 6000,
                efficiency: 34.5,
                waste: 3930,
                cuts: [
                    { item: 'Dọc trái', length: 2070, color: 'blue' },
                    { item: 'Decal', length: 3930, color: 'orange', reusable: true }
                ]
            }
        ]
    };
    
    res.json({ success: true, data: optimization });
});

// GET /api/kpi-summary
app.get('/api/kpi-summary', (req, res) => {
    res.json({
        success: true,
        data: {
            running_projects: 6,
            pending_quotations: 3,
            production_orders: 4,
            inventory_alerts: 2
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock API Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📡 Các endpoints:`);
    console.log(`   GET  /api/aluminum-systems`);
    console.log(`   GET  /api/accessories`);
    console.log(`   GET  /api/projects`);
    console.log(`   POST /api/calculate-bom`);
    console.log(`   POST /api/optimize-cutting`);
    console.log(`   GET  /api/kpi-summary`);
});






