<?php
/**
 * Aluminum System Controller
 * Xử lý các request liên quan đến hệ nhôm
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/AluminumSystem.php';

class AluminumSystemController {
    private $aluminumSystem;

    public function __construct() {
        $this->aluminumSystem = new AluminumSystem();
    }

    /**
     * Xử lý GET request
     */
    public function handleGet() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $code = isset($_GET['code']) ? $_GET['code'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;

        if ($id) {
            $result = $this->aluminumSystem->getById($id);
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy hệ nhôm'
                ]);
            }
        } elseif ($code) {
            $result = $this->aluminumSystem->getByCode($code);
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy hệ nhôm'
                ]);
            }
        } else {
            $result = $this->aluminumSystem->getAll($search);
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

        $id = $this->aluminumSystem->create($data);
        
        if ($id) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Thêm hệ nhôm thành công',
                'data' => ['id' => $id]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi thêm hệ nhôm'
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

        $result = $this->aluminumSystem->update($id, $data);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Cập nhật hệ nhôm thành công'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi cập nhật hệ nhôm'
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

        $result = $this->aluminumSystem->delete($id);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Xóa hệ nhôm thành công'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi xóa hệ nhôm'
            ]);
        }
    }
}

// Xử lý request
$controller = new AluminumSystemController();
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






