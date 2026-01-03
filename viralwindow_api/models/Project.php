<?php
/**
 * Project Model
 * Xử lý các thao tác với bảng projects
 */

require_once __DIR__ . '/../config/database.php';

class Project {
    private $conn;
    private $table_name = "projects";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Lấy tất cả dự án
     */
    public function getAll($filters = []) {
        $query = "SELECT 
                    p.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email
                  FROM " . $this->table_name . " p
                  LEFT JOIN customers c ON p.customer_id = c.id
                  WHERE 1=1";
        
        // Lọc theo trạng thái
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query .= " AND p.status = :status";
        }
        
        // Lọc theo tiến độ
        if (isset($filters['progress'])) {
            if ($filters['progress'] === '0-25') {
                $query .= " AND p.progress_percent >= 0 AND p.progress_percent <= 25";
            } elseif ($filters['progress'] === '25-50') {
                $query .= " AND p.progress_percent > 25 AND p.progress_percent <= 50";
            } elseif ($filters['progress'] === '50-75') {
                $query .= " AND p.progress_percent > 50 AND p.progress_percent <= 75";
            } elseif ($filters['progress'] === '75-100') {
                $query .= " AND p.progress_percent > 75 AND p.progress_percent <= 100";
            }
        }
        
        // Tìm kiếm
        if (isset($filters['search']) && $filters['search']) {
            $query .= " AND (p.project_name LIKE :search OR p.project_code LIKE :search 
                     OR c.full_name LIKE :search OR c.phone LIKE :search)";
        }
        
        $query .= " ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $stmt->bindParam(':status', $filters['status']);
        }
        
        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = "%{$filters['search']}%";
            $stmt->bindParam(':search', $searchTerm);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Lấy dự án theo ID
     */
    public function getById($id) {
        $query = "SELECT 
                    p.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email,
                    c.address as customer_address
                  FROM " . $this->table_name . " p
                  LEFT JOIN customers c ON p.customer_id = c.id
                  WHERE p.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Thêm dự án mới
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (project_code, project_name, customer_id, start_date, deadline, status, notes) 
                  VALUES (:project_code, :project_name, :customer_id, :start_date, :deadline, :status, :notes)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':project_code', $data['project_code']);
        $stmt->bindParam(':project_name', $data['project_name']);
        $stmt->bindParam(':customer_id', $data['customer_id']);
        $stmt->bindParam(':start_date', $data['start_date']);
        $stmt->bindParam(':deadline', $data['deadline']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':notes', $data['notes']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Cập nhật dự án
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET project_name = :project_name, customer_id = :customer_id, 
                      start_date = :start_date, deadline = :deadline, 
                      status = :status, progress_percent = :progress_percent, 
                      total_value = :total_value, notes = :notes 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':project_name', $data['project_name']);
        $stmt->bindParam(':customer_id', $data['customer_id']);
        $stmt->bindParam(':start_date', $data['start_date']);
        $stmt->bindParam(':deadline', $data['deadline']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':progress_percent', $data['progress_percent']);
        $stmt->bindParam(':total_value', $data['total_value']);
        $stmt->bindParam(':notes', $data['notes']);
        
        return $stmt->execute();
    }

    /**
     * Lấy thống kê dự án
     */
    public function getStatistics() {
        $query = "SELECT 
                    COUNT(*) as total_projects,
                    SUM(CASE WHEN status = 'quotation_pending' THEN 1 ELSE 0 END) as pending_quotations,
                    SUM(CASE WHEN status IN ('in_production', 'cutting', 'welding', 'gluing', 'accessories', 'finishing', 'packaging') THEN 1 ELSE 0 END) as in_production,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                  FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch();
    }
}
?>






