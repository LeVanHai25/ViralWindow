<?php
/**
 * Quotation Model
 * Xử lý các thao tác với bảng quotations và quotation_items
 */

require_once __DIR__ . '/../config/database.php';

class Quotation {
    private $conn;
    private $table_name = "quotations";
    private $items_table = "quotation_items";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Lấy tất cả báo giá
     */
    public function getAll($filters = []) {
        $query = "SELECT 
                    q.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email,
                    p.project_name,
                    COUNT(qi.id) as item_count
                  FROM " . $this->table_name . " q
                  LEFT JOIN customers c ON q.customer_id = c.id
                  LEFT JOIN projects p ON q.project_id = p.id
                  LEFT JOIN " . $this->items_table . " qi ON q.id = qi.quotation_id";
        
        $conditions = [];
        
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $conditions[] = "q.status = :status";
        }
        
        if (isset($filters['customer_id']) && $filters['customer_id']) {
            $conditions[] = "q.customer_id = :customer_id";
        }
        
        if (isset($filters['search']) && $filters['search']) {
            $conditions[] = "(q.quotation_code LIKE :search OR c.full_name LIKE :search OR p.project_name LIKE :search)";
        }
        
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $query .= " GROUP BY q.id ORDER BY q.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $stmt->bindParam(':status', $filters['status']);
        }
        
        if (isset($filters['customer_id']) && $filters['customer_id']) {
            $stmt->bindParam(':customer_id', $filters['customer_id']);
        }
        
        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = "%{$filters['search']}%";
            $stmt->bindParam(':search', $searchTerm);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Lấy báo giá theo ID (kèm chi tiết)
     */
    public function getById($id) {
        // Lấy thông tin báo giá
        $query = "SELECT 
                    q.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email,
                    c.address as customer_address,
                    c.tax_code as customer_tax_code,
                    p.project_name
                  FROM " . $this->table_name . " q
                  LEFT JOIN customers c ON q.customer_id = c.id
                  LEFT JOIN projects p ON q.project_id = p.id
                  WHERE q.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $quotation = $stmt->fetch();
        
        if ($quotation) {
            // Lấy chi tiết báo giá
            $itemsQuery = "SELECT * FROM " . $this->items_table . " WHERE quotation_id = :id ORDER BY id";
            $itemsStmt = $this->conn->prepare($itemsQuery);
            $itemsStmt->bindParam(':id', $id);
            $itemsStmt->execute();
            $quotation['items'] = $itemsStmt->fetchAll();
        }
        
        return $quotation;
    }

    /**
     * Tạo báo giá mới
     */
    public function create($data) {
        $this->conn->beginTransaction();
        
        try {
            // Tự động tạo mã báo giá
            if (empty($data['quotation_code'])) {
                $data['quotation_code'] = $this->generateQuotationCode();
            }
            
            // Tính toán tổng tiền
            $subtotal = 0;
            $profit_amount = 0;
            $total_amount = 0;
            
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $subtotal += $item['total_price'];
                }
            }
            
            $profit_margin = isset($data['profit_margin_percent']) ? $data['profit_margin_percent'] : 20;
            $profit_amount = ($subtotal * $profit_margin) / 100;
            $total_amount = $subtotal + $profit_amount;
            
            // Tạo báo giá
            $query = "INSERT INTO " . $this->table_name . " 
                      (quotation_code, project_id, customer_id, quotation_date, validity_days, 
                       status, subtotal, profit_margin_percent, profit_amount, total_amount, notes) 
                      VALUES (:quotation_code, :project_id, :customer_id, :quotation_date, :validity_days, 
                              :status, :subtotal, :profit_margin_percent, :profit_amount, :total_amount, :notes)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':quotation_code', $data['quotation_code']);
            $stmt->bindParam(':project_id', $data['project_id']);
            $stmt->bindParam(':customer_id', $data['customer_id']);
            $stmt->bindParam(':quotation_date', $data['quotation_date']);
            $stmt->bindParam(':validity_days', $data['validity_days']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':subtotal', $subtotal);
            $stmt->bindParam(':profit_margin_percent', $profit_margin);
            $stmt->bindParam(':profit_amount', $profit_amount);
            $stmt->bindParam(':total_amount', $total_amount);
            $stmt->bindParam(':notes', $data['notes']);
            
            $stmt->execute();
            $quotation_id = $this->conn->lastInsertId();
            
            // Thêm chi tiết báo giá
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $itemQuery = "INSERT INTO " . $this->items_table . " 
                                  (quotation_id, item_name, quantity, unit, unit_price, total_price, item_type) 
                                  VALUES (:quotation_id, :item_name, :quantity, :unit, :unit_price, :total_price, :item_type)";
                    
                    $itemStmt = $this->conn->prepare($itemQuery);
                    $itemStmt->bindParam(':quotation_id', $quotation_id);
                    $itemStmt->bindParam(':item_name', $item['item_name']);
                    $itemStmt->bindParam(':quantity', $item['quantity']);
                    $itemStmt->bindParam(':unit', $item['unit']);
                    $itemStmt->bindParam(':unit_price', $item['unit_price']);
                    $itemStmt->bindParam(':total_price', $item['total_price']);
                    $itemStmt->bindParam(':item_type', $item['item_type']);
                    $itemStmt->execute();
                }
            }
            
            $this->conn->commit();
            return $quotation_id;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    /**
     * Cập nhật báo giá
     */
    public function update($id, $data) {
        $this->conn->beginTransaction();
        
        try {
            // Tính toán lại tổng tiền
            $subtotal = 0;
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $subtotal += $item['total_price'];
                }
            }
            
            $profit_margin = isset($data['profit_margin_percent']) ? $data['profit_margin_percent'] : 20;
            $profit_amount = ($subtotal * $profit_margin) / 100;
            $total_amount = $subtotal + $profit_amount;
            
            // Cập nhật báo giá
            $query = "UPDATE " . $this->table_name . " 
                      SET customer_id = :customer_id, quotation_date = :quotation_date, 
                          validity_days = :validity_days, status = :status, 
                          subtotal = :subtotal, profit_margin_percent = :profit_margin_percent, 
                          profit_amount = :profit_amount, total_amount = :total_amount, notes = :notes 
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':customer_id', $data['customer_id']);
            $stmt->bindParam(':quotation_date', $data['quotation_date']);
            $stmt->bindParam(':validity_days', $data['validity_days']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':subtotal', $subtotal);
            $stmt->bindParam(':profit_margin_percent', $profit_margin);
            $stmt->bindParam(':profit_amount', $profit_amount);
            $stmt->bindParam(':total_amount', $total_amount);
            $stmt->bindParam(':notes', $data['notes']);
            $stmt->execute();
            
            // Xóa chi tiết cũ và thêm mới
            $deleteQuery = "DELETE FROM " . $this->items_table . " WHERE quotation_id = :id";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->bindParam(':id', $id);
            $deleteStmt->execute();
            
            // Thêm chi tiết mới
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $itemQuery = "INSERT INTO " . $this->items_table . " 
                                  (quotation_id, item_name, quantity, unit, unit_price, total_price, item_type) 
                                  VALUES (:quotation_id, :item_name, :quantity, :unit, :unit_price, :total_price, :item_type)";
                    
                    $itemStmt = $this->conn->prepare($itemQuery);
                    $itemStmt->bindParam(':quotation_id', $id);
                    $itemStmt->bindParam(':item_name', $item['item_name']);
                    $itemStmt->bindParam(':quantity', $item['quantity']);
                    $itemStmt->bindParam(':unit', $item['unit']);
                    $itemStmt->bindParam(':unit_price', $item['unit_price']);
                    $itemStmt->bindParam(':total_price', $item['total_price']);
                    $itemStmt->bindParam(':item_type', $item['item_type']);
                    $itemStmt->execute();
                }
            }
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    /**
     * Cập nhật trạng thái báo giá
     */
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':status', $status);
        return $stmt->execute();
    }

    /**
     * Xóa báo giá
     */
    public function delete($id) {
        $this->conn->beginTransaction();
        
        try {
            // Xóa chi tiết
            $deleteItemsQuery = "DELETE FROM " . $this->items_table . " WHERE quotation_id = :id";
            $deleteItemsStmt = $this->conn->prepare($deleteItemsQuery);
            $deleteItemsStmt->bindParam(':id', $id);
            $deleteItemsStmt->execute();
            
            // Xóa báo giá
            $deleteQuery = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->bindParam(':id', $id);
            $deleteStmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    /**
     * Lấy thống kê báo giá
     */
    public function getStatistics() {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
                    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END) as total_revenue
                  FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Tự động tạo mã báo giá
     */
    private function generateQuotationCode() {
        $year = date('Y');
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE YEAR(quotation_date) = :year";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':year', $year);
        $stmt->execute();
        $result = $stmt->fetch();
        $count = $result['count'] + 1;
        return 'BG-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
?>






