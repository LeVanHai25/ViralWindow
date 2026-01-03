<?php
/**
 * Customer Model
 * Xử lý các thao tác với bảng customers
 */

require_once __DIR__ . '/../config/database.php';

class Customer {
    private $conn;
    private $table_name = "customers";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Lấy tất cả khách hàng
     */
    public function getAll($search = null) {
        $query = "SELECT 
                    c.*,
                    COUNT(DISTINCT q.id) as total_quotations,
                    COUNT(DISTINCT p.id) as total_projects,
                    SUM(CASE WHEN q.status = 'approved' THEN 1 ELSE 0 END) as approved_quotations
                  FROM " . $this->table_name . " c
                  LEFT JOIN quotations q ON c.id = q.customer_id
                  LEFT JOIN projects p ON c.id = p.customer_id";
        
        if ($search) {
            $query .= " WHERE (c.full_name LIKE :search OR c.phone LIKE :search OR c.email LIKE :search OR c.customer_code LIKE :search)";
        }
        
        $query .= " GROUP BY c.id ORDER BY c.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if ($search) {
            $searchTerm = "%{$search}%";
            $stmt->bindParam(':search', $searchTerm);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Lấy khách hàng theo ID
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Thêm khách hàng mới
     */
    public function create($data) {
        // Tự động tạo mã khách hàng nếu chưa có
        if (empty($data['customer_code'])) {
            $data['customer_code'] = $this->generateCustomerCode();
        }

        $query = "INSERT INTO " . $this->table_name . " 
                  (customer_code, full_name, phone, email, address, tax_code, notes) 
                  VALUES (:customer_code, :full_name, :phone, :email, :address, :tax_code, :notes)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':customer_code', $data['customer_code']);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':tax_code', $data['tax_code']);
        $stmt->bindParam(':notes', $data['notes']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Cập nhật khách hàng
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET full_name = :full_name, phone = :phone, email = :email, 
                      address = :address, tax_code = :tax_code, notes = :notes 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':tax_code', $data['tax_code']);
        $stmt->bindParam(':notes', $data['notes']);
        
        return $stmt->execute();
    }

    /**
     * Xóa khách hàng
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Tự động tạo mã khách hàng
     */
    private function generateCustomerCode() {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        $count = $result['count'] + 1;
        return 'KH-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
?>






