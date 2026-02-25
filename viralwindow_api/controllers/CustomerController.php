<?php
/**
 * Customer Controller
 * Xử lý các request liên quan đến khách hàng
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/Customer.php';

class CustomerController {
    private $customer;

    public function __construct() {
        $this->customer = new Customer();
    }

    public function handleGet() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;

        if ($id) {
            $result = $this->customer->getById($id);
            if ($result) {
                echo json_encode(['success' => true, 'data' => $result]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Không tìm thấy khách hàng']);
            }
        } else {
            $result = $this->customer->getAll($search);
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

        $id = $this->customer->create($data);
        
        if ($id) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Thêm khách hàng thành công', 'data' => ['id' => $id]]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi khi thêm khách hàng']);
        }
    }

    public function handlePut() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Thiếu ID']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        $result = $this->customer->update($id, $data);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Cập nhật khách hàng thành công']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật khách hàng']);
        }
    }

    public function handleDelete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Thiếu ID']);
            return;
        }

        $result = $this->customer->delete($id);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Xóa khách hàng thành công']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi khi xóa khách hàng']);
        }
    }
}

$controller = new CustomerController();
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






