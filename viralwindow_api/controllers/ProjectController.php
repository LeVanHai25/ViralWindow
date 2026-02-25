<?php
/**
 * Project Controller
 * Xử lý các request liên quan đến dự án
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/Project.php';

class ProjectController {
    private $project;

    public function __construct() {
        $this->project = new Project();
    }

    /**
     * Xử lý GET request
     */
    public function handleGet() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $stats = isset($_GET['stats']) ? $_GET['stats'] : null;

        if ($stats === 'true') {
            $result = $this->project->getStatistics();
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
            return;
        }

        if ($id) {
            $result = $this->project->getById($id);
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy dự án'
                ]);
            }
        } else {
            $filters = [
                'status' => isset($_GET['status']) ? $_GET['status'] : 'all',
                'progress' => isset($_GET['progress']) ? $_GET['progress'] : null,
                'search' => isset($_GET['search']) ? $_GET['search'] : null
            ];

            $result = $this->project->getAll($filters);
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

        $id = $this->project->create($data);
        
        if ($id) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Thêm dự án thành công',
                'data' => ['id' => $id]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi thêm dự án'
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

        $result = $this->project->update($id, $data);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Cập nhật dự án thành công'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi khi cập nhật dự án'
            ]);
        }
    }
}

// Xử lý request
$controller = new ProjectController();
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
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method không được hỗ trợ'
        ]);
        break;
}
?>






