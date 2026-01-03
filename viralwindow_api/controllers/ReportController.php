<?php
/**
 * Report Controller
 * Xử lý các request liên quan đến báo cáo
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/Report.php';

class ReportController {
    private $report;

    public function __construct() {
        $this->report = new Report();
    }

    public function handleGet() {
        $type = isset($_GET['type']) ? $_GET['type'] : 'dashboard';

        switch ($type) {
            case 'dashboard':
                $result = $this->report->getDashboardSummary();
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            case 'revenue-month':
                $year = isset($_GET['year']) ? $_GET['year'] : date('Y');
                $result = $this->report->getRevenueByMonth($year);
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            case 'conversion-rate':
                $result = $this->report->getQuotationConversionRate();
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            case 'revenue-sales':
                $result = $this->report->getRevenueBySales();
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            case 'production':
                $result = $this->report->getProductionReport();
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            case 'inventory':
                $result = $this->report->getInventoryReport();
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            case 'financial':
                $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
                $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
                $result = $this->report->getFinancialReport($startDate, $endDate);
                echo json_encode(['success' => true, 'data' => $result]);
                break;

            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Loại báo cáo không hợp lệ']);
                break;
        }
    }
}

$controller = new ReportController();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller->handleGet();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method không được hỗ trợ']);
}
?>






