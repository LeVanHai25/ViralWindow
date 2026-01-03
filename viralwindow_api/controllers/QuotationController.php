<?php
/**
 * Quotation Controller
 * Xử lý các request liên quan đến báo giá
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/Quotation.php';

class QuotationController {
    private $quotation;

    public function __construct() {
        $this->quotation = new Quotation();
    }

    public function handleGet() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $stats = isset($_GET['stats']) ? $_GET['stats'] : null;

        if ($stats === 'true') {
            $result = $this->quotation->getStatistics();
            echo json_encode(['success' => true, 'data' => $result]);
            return;
        }

        if ($id) {
            $result = $this->quotation->getById($id);
            if ($result) {
                echo json_encode(['success' => true, 'data' => $result]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Không tìm thấy báo giá']);
            }
        } else {
            $filters = [
                'status' => isset($_GET['status']) ? $_GET['status'] : 'all',
                'customer_id' => isset($_GET['customer_id']) ? $_GET['customer_id'] : null,
                'search' => isset($_GET['search']) ? $_GET['search'] : null
            ];

            $result = $this->quotation->getAll($filters);
            echo json_encode(['success' => true, 'data' => $result, 'count' => count($result)]);
        }
    }

    public function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        $id = $this->quotation->create($data);
        
        if ($id) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Tạo báo giá thành công', 'data' => ['id' => $id]]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi khi tạo báo giá']);
        }
    }

    public function handlePut() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Thiếu ID']);
            return;
        }

        // Nếu chỉ cập nhật trạng thái
        if ($status) {
            $result = $this->quotation->updateStatus($id, $status);
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Cập nhật trạng thái thành công']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật trạng thái']);
            }
            return;
        }

        // Cập nhật toàn bộ
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        $result = $this->quotation->update($id, $data);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Cập nhật báo giá thành công']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật báo giá']);
        }
    }

    public function handleDelete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Thiếu ID']);
            return;
        }

        $result = $this->quotation->delete($id);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Xóa báo giá thành công']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi khi xóa báo giá']);
        }
    }
}

$controller = new QuotationController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->handleGet();
        break;
    case 'POST':
        $controller->handlePost();
        break;
    case 'PUT':
        $controller->handlePut();
        break;
    case 'DELETE':
        $controller->handleDelete();
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method không được hỗ trợ']);
        break;
}
?>






