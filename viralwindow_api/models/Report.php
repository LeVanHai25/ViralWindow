<?php
/**
 * Report Model
 * Xử lý các báo cáo và thống kê
 */

require_once __DIR__ . '/../config/database.php';

class Report {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Báo cáo doanh thu theo tháng
     */
    public function getRevenueByMonth($year = null) {
        if (!$year) {
            $year = date('Y');
        }

        $query = "SELECT 
                    MONTH(quotation_date) as month,
                    SUM(total_amount) as revenue,
                    SUM(profit_amount) as profit,
                    COUNT(*) as quotation_count
                  FROM quotations
                  WHERE status = 'approved' AND YEAR(quotation_date) = :year
                  GROUP BY MONTH(quotation_date)
                  ORDER BY month ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':year', $year);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Báo cáo tỷ lệ chốt báo giá
     */
    public function getQuotationConversionRate() {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status IN ('draft', 'sent', 'pending') THEN 1 ELSE 0 END) as pending
                  FROM quotations";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result['total'] > 0) {
            $result['conversion_rate'] = ($result['approved'] / $result['total']) * 100;
        } else {
            $result['conversion_rate'] = 0;
        }
        
        return $result;
    }

    /**
     * Báo cáo doanh thu theo sale (nếu có field assigned_to)
     */
    public function getRevenueBySales() {
        $query = "SELECT 
                    created_by as sales_id,
                    COUNT(*) as quotation_count,
                    SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END) as revenue,
                    SUM(CASE WHEN status = 'approved' THEN profit_amount ELSE 0 END) as profit
                  FROM quotations
                  WHERE created_by IS NOT NULL
                  GROUP BY created_by
                  ORDER BY revenue DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Báo cáo sản xuất
     */
    public function getProductionReport() {
        $query = "SELECT 
                    status,
                    COUNT(*) as count
                  FROM production_orders
                  GROUP BY status";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Báo cáo kho
     */
    public function getInventoryReport() {
        $query = "SELECT 
                    item_type,
                    COUNT(*) as total_items,
                    SUM(CASE WHEN stock_quantity < min_stock_level THEN 1 ELSE 0 END) as low_stock,
                    SUM(stock_quantity * unit_price) as total_value
                  FROM inventory
                  GROUP BY item_type";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Báo cáo tài chính
     */
    public function getFinancialReport($startDate = null, $endDate = null) {
        $query = "SELECT 
                    transaction_type,
                    SUM(amount) as total_amount,
                    COUNT(*) as transaction_count
                  FROM financial_transactions
                  WHERE 1=1";
        
        if ($startDate) {
            $query .= " AND transaction_date >= :start_date";
        }
        if ($endDate) {
            $query .= " AND transaction_date <= :end_date";
        }
        
        $query .= " GROUP BY transaction_type";
        
        $stmt = $this->conn->prepare($query);
        
        if ($startDate) {
            $stmt->bindParam(':start_date', $startDate);
        }
        if ($endDate) {
            $stmt->bindParam(':end_date', $endDate);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Dashboard tổng quan
     */
    public function getDashboardSummary() {
        // Doanh thu
        $revenueQuery = "SELECT SUM(total_amount) as total FROM quotations WHERE status = 'approved'";
        $revenueStmt = $this->conn->prepare($revenueQuery);
        $revenueStmt->execute();
        $revenue = $revenueStmt->fetch()['total'] ?? 0;

        // Lợi nhuận
        $profitQuery = "SELECT SUM(profit_amount) as total FROM quotations WHERE status = 'approved'";
        $profitStmt = $this->conn->prepare($profitQuery);
        $profitStmt->execute();
        $profit = $profitStmt->fetch()['total'] ?? 0;

        // Báo giá đã chốt
        $approvedQuery = "SELECT COUNT(*) as total FROM quotations WHERE status = 'approved'";
        $approvedStmt = $this->conn->prepare($approvedQuery);
        $approvedStmt->execute();
        $approved = $approvedStmt->fetch()['total'] ?? 0;

        // Dự án đang chạy
        $projectsQuery = "SELECT COUNT(*) as total FROM projects WHERE status NOT IN ('completed', 'cancelled')";
        $projectsStmt = $this->conn->prepare($projectsQuery);
        $projectsStmt->execute();
        $runningProjects = $projectsStmt->fetch()['total'] ?? 0;

        return [
            'total_revenue' => $revenue,
            'total_profit' => $profit,
            'approved_quotations' => $approved,
            'running_projects' => $runningProjects
        ];
    }
}
?>






