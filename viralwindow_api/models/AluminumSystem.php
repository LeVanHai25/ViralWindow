<?php
/**
 * Aluminum System Model
 * Xử lý các thao tác với bảng aluminum_systems
 */

require_once __DIR__ . '/../config/database.php';

class AluminumSystem {
    private $conn;
    private $table_name = "aluminum_systems";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Lấy tất cả hệ nhôm
     */
    public function getAll($search = null) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = 1";
        
        if ($search) {
            $query .= " AND (code LIKE :search OR name LIKE :search OR brand LIKE :search)";
        }
        
        $query .= " ORDER BY code ASC";
        
        $stmt = $this->conn->prepare($query);
        
        if ($search) {
            $searchTerm = "%{$search}%";
            $stmt->bindParam(':search', $searchTerm);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Lấy hệ nhôm theo ID
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id AND is_active = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Lấy hệ nhôm theo mã
     */
    public function getByCode($code) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE code = :code AND is_active = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Thêm hệ nhôm mới
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (code, name, brand, thickness_mm, weight_per_meter, cutting_formula, description) 
                  VALUES (:code, :name, :brand, :thickness_mm, :weight_per_meter, :cutting_formula, :description)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':code', $data['code']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':brand', $data['brand']);
        $stmt->bindParam(':thickness_mm', $data['thickness_mm']);
        $stmt->bindParam(':weight_per_meter', $data['weight_per_meter']);
        $stmt->bindParam(':cutting_formula', $data['cutting_formula']);
        $stmt->bindParam(':description', $data['description']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Cập nhật hệ nhôm
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, brand = :brand, thickness_mm = :thickness_mm, 
                      weight_per_meter = :weight_per_meter, cutting_formula = :cutting_formula, 
                      description = :description 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':brand', $data['brand']);
        $stmt->bindParam(':thickness_mm', $data['thickness_mm']);
        $stmt->bindParam(':weight_per_meter', $data['weight_per_meter']);
        $stmt->bindParam(':cutting_formula', $data['cutting_formula']);
        $stmt->bindParam(':description', $data['description']);
        
        return $stmt->execute();
    }

    /**
     * Xóa hệ nhôm (soft delete)
     */
    public function delete($id) {
        $query = "UPDATE " . $this->table_name . " SET is_active = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>






