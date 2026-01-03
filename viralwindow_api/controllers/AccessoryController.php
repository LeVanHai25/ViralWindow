<?php
/**
 * Accessory Controller
 * Xử lý các request liên quan đến phụ kiện
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/Accessory.php';

class AccessoryController {
    private $accessory;

    public function __construct() {
        $this->accessory = new Accessory();
    }

    /**
     * Xử lý GET request
     */
    public function handleGet() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $stats = isset($_GET['stats']) ? $_GET['stats'] : null;

        if ($stats === 'true') {
            $result = $this->accessory->getStatistics();
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
            return;
        }

        if ($id) {
            $result = $this->accessory->getById($id);
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy phụ kiện'
                ]);
            }
        } else {
            $result = $this->accessory->getAll($search, $category);
            echo json_encode([
                'success' => true,
                'data' => $result,
                'count' => count($result)
            ]);
        }
    }

    /**
     * Xử lý POST request
     */
    public function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ'
            ]);
            return;
        }

        $id = $this->accessory->create($data);
        
        if ($id) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Thêm phụ kiện thành công',
                'data' => ['id' => $id]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi thêm phụ kiện'
            ]);
        }
    }

    /**
     * Xử lý PUT request
     */
    public function handlePut() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Thiếu ID'
            ]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ'
            ]);
            return;
        }

        $result = $this->accessory->update($id, $data);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Cập nhật phụ kiện thành công'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi cập nhật phụ kiện'
            ]);
        }
    }

    /**
     * Xử lý DELETE request
     */
    public function handleDelete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Thiếu ID'
            ]);
            return;
        }

        $result = $this->accessory->delete($id);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Xóa phụ kiện thành công'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi xóa phụ kiện'
            ]);
        }
    }
}

// Xử lý request
$controller = new AccessoryController();
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
        echo json_encode([
            'success' => false,
            'message' => 'Method không được hỗ trợ'
        ]);
        break;
}
?>






