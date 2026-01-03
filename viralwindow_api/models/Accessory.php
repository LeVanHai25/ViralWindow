<?php
/**
 * Accessory Model
 * Xử lý các thao tác với bảng accessories
 */

require_once __DIR__ . '/../config/database.php';

class Accessory {
    private $conn;
    private $table_name = "accessories";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Lấy tất cả phụ kiện
     */
    public function getAll($search = null, $category = null) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = 1";
        
        if ($search) {
            $query .= " AND (code LIKE :search OR name LIKE :search)";
        }
        
        if ($category && $category !== 'all') {
            $query .= " AND category = :category";
        }
        
        $query .= " ORDER BY code ASC";
        
        $stmt = $this->conn->prepare($query);
        
        if ($search) {
            $searchTerm = "%{$search}%";
            $stmt->bindParam(':search', $searchTerm);
        }
        
        if ($category && $category !== 'all') {
            $stmt->bindParam(':category', $category);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Lấy phụ kiện theo ID
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id AND is_active = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Thêm phụ kiện mới
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (code, name, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, description) 
                  VALUES (:code, :name, :category, :unit, :purchase_price, :sale_price, :stock_quantity, :min_stock_level, :description)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':code', $data['code']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':unit', $data['unit']);
        $stmt->bindParam(':purchase_price', $data['purchase_price']);
        $stmt->bindParam(':sale_price', $data['sale_price']);
        $stmt->bindParam(':stock_quantity', $data['stock_quantity']);
        $stmt->bindParam(':min_stock_level', $data['min_stock_level']);
        $stmt->bindParam(':description', $data['description']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Cập nhật phụ kiện
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, category = :category, unit = :unit, 
                      purchase_price = :purchase_price, sale_price = :sale_price, 
                      stock_quantity = :stock_quantity, min_stock_level = :min_stock_level, 
                      description = :description 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':unit', $data['unit']);
        $stmt->bindParam(':purchase_price', $data['purchase_price']);
        $stmt->bindParam(':sale_price', $data['sale_price']);
        $stmt->bindParam(':stock_quantity', $data['stock_quantity']);
        $stmt->bindParam(':min_stock_level', $data['min_stock_level']);
        $stmt->bindParam(':description', $data['description']);
        
        return $stmt->execute();
    }

    /**
     * Xóa phụ kiện (soft delete)
     */
    public function delete($id) {
        $query = "UPDATE " . $this->table_name . " SET is_active = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Lấy thống kê phụ kiện
     */
    public function getStatistics() {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN stock_quantity >= min_stock_level THEN 1 ELSE 0 END) as in_stock,
                    SUM(CASE WHEN stock_quantity < min_stock_level THEN 1 ELSE 0 END) as need_restock,
                    COUNT(DISTINCT category) as categories
                  FROM " . $this->table_name . " 
                  WHERE is_active = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch();
    }
}
?>






