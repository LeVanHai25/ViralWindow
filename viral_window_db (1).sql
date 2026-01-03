-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 17, 2025 lúc 04:45 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `viral_window_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `accessories`
--

CREATE TABLE `accessories` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `purchase_price` decimal(12,2) DEFAULT 0.00,
  `sale_price` decimal(12,2) DEFAULT 0.00,
  `stock_quantity` int(11) DEFAULT 0,
  `min_stock_level` int(11) DEFAULT 10,
  `image_path` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `supplier` varchar(255) DEFAULT NULL COMMENT 'Nhà cung cấp',
  `supplier_code` varchar(100) DEFAULT NULL COMMENT 'Mã sản phẩm của NCC',
  `application_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Ứng dụng: ["swing_door", "sliding_door", "window"]' CHECK (json_valid(`application_types`)),
  `usage_rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Quy tắc sử dụng: {swing_single: {quantity: 3, description: "3 bản lề"}, sliding_double: {quantity: 2, description: "2 ray"}}' CHECK (json_valid(`usage_rules`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `accessories`
--

INSERT INTO `accessories` (`id`, `code`, `name`, `category`, `unit`, `purchase_price`, `sale_price`, `stock_quantity`, `min_stock_level`, `image_path`, `description`, `is_active`, `created_at`, `updated_at`, `supplier`, `supplier_code`, `application_types`, `usage_rules`) VALUES
(1, 'PK-001', 'Khóa tay gạt inox 304', 'Khóa', 'Bộ', 0.00, 250000.00, 44, 10, NULL, NULL, 1, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(2, 'PK-002', 'Bản lề 3D cao cấp', 'Bản lề', 'Cái', 0.00, 85000.00, 118, 20, NULL, NULL, 1, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(3, 'PK-003', 'Tay nắm nhôm đúc', 'Tay nắm', 'Cái', 0.00, 120000.00, 109, 15, NULL, NULL, 1, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(4, 'PK-004', 'Gioăng cao su EPDM', 'Gioăng', 'Mét', 0.00, 15000.00, 249, 50, NULL, NULL, 1, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(5, 'PK-005', 'Keo silicone chống thấm', 'Keo', 'Chai', 0.00, 45000.00, 34, 10, NULL, NULL, 1, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(6, 'PK-006', 'Bánh xe lùa inox', 'Phụ kiện lùa', 'Bộ', 0.00, 180000.00, 27, 10, NULL, NULL, 1, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(7, 'VW-L-001', 'Khóa tay gạt inox 304 - ViralWindow', 'Khóa', 'Bộ', 150000.00, 250000.00, 49, 10, NULL, 'Khóa tay gạt inox 304 độc quyền ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(8, 'VW-L-002', 'Khóa chốt cửa đi - ViralWindow', 'Khóa', 'Bộ', 80000.00, 120000.00, 39, 10, NULL, 'Khóa chốt cửa đi hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(9, 'VW-L-003', 'Khóa cửa sổ - ViralWindow', 'Khóa', 'Bộ', 60000.00, 90000.00, 59, 15, NULL, 'Khóa cửa sổ hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(10, 'VW-H-001', 'Bản lề 3D cao cấp - ViralWindow', 'Bản lề', 'Cái', 50000.00, 85000.00, 148, 30, NULL, 'Bản lề 3D cao cấp độc quyền ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(11, 'VW-H-002', 'Bản lề cửa sổ - ViralWindow', 'Bản lề', 'Cái', 35000.00, 60000.00, 199, 40, NULL, 'Bản lề cửa sổ hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(12, 'VW-H-003', 'Bản lề ẩn - ViralWindow', 'Bản lề', 'Cái', 70000.00, 110000.00, 78, 20, NULL, 'Bản lề ẩn cao cấp ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(13, 'VW-K-001', 'Tay nắm nhôm đúc - ViralWindow', 'Tay nắm', 'Cái', 80000.00, 120000.00, 99, 20, NULL, 'Tay nắm nhôm đúc độc quyền ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(14, 'VW-K-002', 'Tay nắm inox - ViralWindow', 'Tay nắm', 'Cái', 60000.00, 95000.00, 119, 25, NULL, 'Tay nắm inox hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(15, 'VW-G-001', 'Gioăng cao su EPDM - ViralWindow', 'Gioăng', 'Mét', 8000.00, 15000.00, 499, 100, NULL, 'Gioăng cao su EPDM độc quyền ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(16, 'VW-G-002', 'Gioăng kính - ViralWindow', 'Gioăng', 'Mét', 10000.00, 18000.00, 399, 80, NULL, 'Gioăng kính hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(17, 'VW-G-003', 'Gioăng cửa lùa - ViralWindow', 'Gioăng', 'Mét', 12000.00, 20000.00, 299, 60, NULL, 'Gioăng cửa lùa hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(18, 'VW-SE-001', 'Keo silicone chống thấm - ViralWindow', 'Keo', 'Chai', 25000.00, 45000.00, 49, 10, NULL, 'Keo silicone chống thấm độc quyền ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(19, 'VW-SE-002', 'Keo dán kính - ViralWindow', 'Keo', 'Chai', 30000.00, 55000.00, 39, 10, NULL, 'Keo dán kính hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(20, 'VW-SL-001', 'Bánh xe lùa inox - ViralWindow', 'Phụ kiện lùa', 'Bộ', 100000.00, 180000.00, 34, 10, NULL, 'Bánh xe lùa inox độc quyền ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(21, 'VW-SL-002', 'Ray trượt cửa lùa - ViralWindow', 'Phụ kiện lùa', 'Bộ', 150000.00, 250000.00, 24, 8, NULL, 'Ray trượt cửa lùa hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(22, 'VW-A-001', 'Nẹp che khe - ViralWindow', 'Phụ kiện khác', 'Mét', 5000.00, 10000.00, 199, 50, NULL, 'Nẹp che khe hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(23, 'VW-A-002', 'Vít bắt cửa - ViralWindow', 'Phụ kiện khác', 'Bộ', 15000.00, 25000.00, 99, 20, NULL, 'Vít bắt cửa hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL),
(24, 'VW-A-003', 'Chốt gió cửa sổ - ViralWindow', 'Phụ kiện khác', 'Cái', 20000.00, 35000.00, 79, 15, NULL, 'Chốt gió cửa sổ hệ ViralWindow', 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `accessory_applications`
--

CREATE TABLE `accessory_applications` (
  `id` int(11) NOT NULL,
  `accessory_id` int(11) NOT NULL COMMENT 'FK to accessories',
  `product_type` enum('door','window','glass_wall','railing','roof','stair','other') NOT NULL COMMENT 'Áp dụng cho loại sản phẩm nào',
  `required_per` enum('per_item','per_leaf','per_meter','per_m2') NOT NULL DEFAULT 'per_item' COMMENT 'Tính theo đơn vị nào',
  `default_quantity` decimal(10,2) NOT NULL DEFAULT 1.00 COMMENT 'Số lượng mặc định',
  `is_required` tinyint(1) DEFAULT 1 COMMENT 'Bắt buộc hay không',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quy tắc áp dụng phụ kiện theo loại sản phẩm';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `accessory_usage_rules`
--

CREATE TABLE `accessory_usage_rules` (
  `id` int(11) NOT NULL,
  `accessory_id` int(11) NOT NULL,
  `door_type` enum('swing_single','swing_double','sliding_single','sliding_double','fixed','window','other') NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng sử dụng',
  `position` varchar(255) DEFAULT NULL COMMENT 'Vị trí: Trên, Dưới, Trái, Phải, Giữa',
  `description` text DEFAULT NULL COMMENT 'Mô tả cách sử dụng',
  `is_required` tinyint(1) DEFAULT 1 COMMENT 'Bắt buộc hay không',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `aluminum_colors`
--

CREATE TABLE `aluminum_colors` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  `color_name` varchar(100) NOT NULL COMMENT 'Tên màu: Trắng, Đen, Vân gỗ',
  `color_code` varchar(50) DEFAULT NULL COMMENT 'Mã màu: #FFFFFF, RAL9010',
  `unit_price` decimal(12,2) DEFAULT 0.00 COMMENT 'Giá chênh lệch (nếu có)',
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `aluminum_profiles`
--

CREATE TABLE `aluminum_profiles` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  `profile_code` varchar(50) NOT NULL COMMENT 'Mã profile: XF55-KHUNG, XF55-CANH',
  `profile_name` varchar(255) NOT NULL COMMENT 'Tên: Khung đứng, Cánh trái',
  `profile_type` enum('frame_vertical','frame_horizontal','panel_left','panel_right','panel_fixed','mullion','glass_bead','sliding_rail','other') NOT NULL,
  `width_mm` decimal(6,2) DEFAULT NULL COMMENT 'Chiều rộng profile (mm)',
  `height_mm` decimal(6,2) DEFAULT NULL COMMENT 'Chiều cao profile (mm)',
  `weight_per_meter` decimal(6,3) DEFAULT NULL COMMENT 'Khối lượng/m',
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `default_stock_length_mm` int(11) DEFAULT 6000 COMMENT 'Chiều dài thanh nhôm chuẩn (mm)',
  `cut_deduction_x_mm` int(11) DEFAULT 0 COMMENT 'Trừ kích thước theo chiều ngang (mm)',
  `cut_deduction_y_mm` int(11) DEFAULT 0 COMMENT 'Trừ kích thước theo chiều đứng (mm)',
  `usage_type` enum('frame_vertical','frame_horizontal','sash_vertical','sash_horizontal','mullion_vertical','mullion_horizontal','transom','other') DEFAULT 'other' COMMENT 'Loại sử dụng'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `aluminum_scraps`
--

CREATE TABLE `aluminum_scraps` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `aluminum_system_id` int(11) NOT NULL,
  `profile_name` varchar(255) NOT NULL,
  `length_mm` int(11) NOT NULL,
  `weight_kg` decimal(8,3) DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `used_in_project_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `aluminum_systems`
--

CREATE TABLE `aluminum_systems` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `category` enum('xingfa','pma','vietphap','viralwindow','inox','khac') DEFAULT 'khac',
  `thickness_mm` decimal(4,2) NOT NULL,
  `weight_per_meter` decimal(6,3) NOT NULL,
  `length_m` decimal(10,2) DEFAULT NULL COMMENT 'Độ dài (mét)',
  `quantity` int(11) DEFAULT 0 COMMENT 'Số lượng tồn kho (số cây/thanh)',
  `quantity_m` decimal(10,2) DEFAULT 0.00 COMMENT 'Số lượng tồn kho (mét)',
  `cutting_formula` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn hình ảnh mặt cắt',
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_banner` varchar(500) DEFAULT NULL,
  `color` varchar(100) DEFAULT 'Trắng' COMMENT 'Màu sắc: Trắng, Đen, Vân gỗ...',
  `unit_price` decimal(12,2) DEFAULT 0.00 COMMENT 'Giá nhập/m bán',
  `door_type` enum('door','window','curtain_wall','other') DEFAULT 'door' COMMENT 'Loại: Cửa đi, Cửa sổ, Mặt dựng',
  `profiles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Danh sách profile: {frame: [...], panel: [...], mullion: [...], glass_bead: [...]}' CHECK (json_valid(`profiles`)),
  `matching_rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Quy tắc ghép: {frame_panel: [...], panel_panel: [...]}' CHECK (json_valid(`matching_rules`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `aluminum_systems`
--

INSERT INTO `aluminum_systems` (`id`, `code`, `name`, `brand`, `category`, `thickness_mm`, `weight_per_meter`, `length_m`, `quantity`, `quantity_m`, `cutting_formula`, `description`, `image_url`, `is_active`, `display_order`, `created_at`, `updated_at`, `image_banner`, `color`, `unit_price`, `door_type`, `profiles`, `matching_rules`) VALUES
(1, 'XF-001', 'Thanh ngang cửa đi', 'Xingfa', 'xingfa', 1.40, 1.200, 6.00, 0, 5.00, 'W - 50', NULL, NULL, 1, 1001, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(2, 'XF-002', 'Thanh dọc cửa đi', 'Xingfa', 'xingfa', 1.40, 1.500, 6.00, 0, 5.00, 'H - 30', NULL, NULL, 1, 1002, '2025-11-26 15:08:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(3, 'PMA-101', '', '', 'pma', 0.00, 0.000, NULL, 0, 0.00, NULL, NULL, NULL, 0, 1003, '2025-11-26 15:08:10', '2025-12-11 06:51:04', NULL, 'Trắng', 0.00, 'door', NULL, NULL),
(4, 'VP-201', '', '', 'vietphap', 0.00, 0.000, NULL, 0, 0.00, NULL, NULL, NULL, 0, 1004, '2025-11-26 15:08:10', '2025-12-11 06:51:01', NULL, 'Trắng', 0.00, 'door', NULL, NULL),
(5, 'VW01', 'Thanh ngang', 'Xingfa', 'xingfa', 1.40, 1.200, 6.00, 0, 5.00, 'W - 50 H - 100', 'Sat', NULL, 1, 1005, '2025-11-26 15:16:52', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(6, 'VW-001', '', '', 'viralwindow', 0.00, 0.000, NULL, 0, 0.00, NULL, NULL, NULL, 0, -994, '2025-11-26 15:37:34', '2025-12-11 06:52:26', NULL, 'Trắng', 0.00, 'door', NULL, NULL),
(7, 'VW-002', '', '', 'viralwindow', 0.00, 0.000, NULL, 0, 0.00, NULL, NULL, NULL, 0, -993, '2025-11-26 15:37:34', '2025-12-11 07:18:19', NULL, 'Trắng', 0.00, 'door', NULL, NULL),
(8, 'VW-003', 'Thanh ngang cửa sổ', 'ViralWindow', 'viralwindow', 1.20, 1.000, 6.00, 0, 5.00, 'W - 45', 'Thanh ngang cửa sổ hệ ViralWindow', NULL, 1, -992, '2025-11-26 15:37:34', '2025-12-15 03:44:26', NULL, 'Trắng', 5000000.00, 'door', NULL, NULL),
(9, 'VW-004', 'Thanh dọc lùa', 'ViralWindow', 'viralwindow', 1.60, 1.800, 6.00, 0, 5.00, 'H - 40', 'Thanh dọc cửa lùa hệ ViralWindow', NULL, 1, -991, '2025-11-26 15:37:34', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(10, 'VW-005', 'Thanh ngang cửa xếp trượt', 'ViralWindow', 'viralwindow', 1.50, 1.300, 6.00, 0, 5.00, 'W - 48', 'Thanh ngang cửa xếp trượt hệ ViralWindow', NULL, 1, -990, '2025-11-26 15:37:34', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(11, 'VW-006', 'Thanh ngang cửa sổ', 'ViralWindow', 'khac', 1.20, 1.000, 6.00, 0, 5.00, 'W - 45', 'Thanh ngang cửa sổ hệ ViralWindow', NULL, 1, 1011, '2025-11-26 17:48:21', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(12, 'VW-D-001', 'Thanh ngang cửa đi', 'ViralWindow', 'viralwindow', 1.40, 1.200, 6.00, 0, 5.00, 'W - 50', 'Thanh ngang cửa đi hệ ViralWindow - Độc quyền', NULL, 1, 1, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(13, 'VW-D-002', 'Thanh dọc cửa đi', 'ViralWindow', 'viralwindow', 1.40, 1.500, 6.00, 0, 5.00, 'H - 30', 'Thanh dọc cửa đi hệ ViralWindow - Độc quyền', NULL, 1, 2, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(14, 'VW-D-003', 'Thanh ngang trên cửa đi', 'ViralWindow', 'viralwindow', 1.40, 1.300, 6.00, 0, 5.00, 'W - 48', 'Thanh ngang trên cửa đi hệ ViralWindow', NULL, 1, 3, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(15, 'VW-D-004', 'Thanh ngang dưới cửa đi', 'ViralWindow', 'viralwindow', 1.40, 1.250, 6.00, 0, 5.00, 'W - 52', 'Thanh ngang dưới cửa đi hệ ViralWindow', NULL, 1, 4, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(16, 'VW-W-001', 'Thanh ngang cửa sổ', 'ViralWindow', 'viralwindow', 1.20, 1.000, 6.00, 0, 5.00, 'W - 45', 'Thanh ngang cửa sổ hệ ViralWindow - Độc quyền', NULL, 1, 10, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(17, 'VW-W-002', 'Thanh dọc cửa sổ', 'ViralWindow', 'viralwindow', 1.20, 1.200, 6.00, 0, 5.00, 'H - 25', 'Thanh dọc cửa sổ hệ ViralWindow - Độc quyền', NULL, 1, 11, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(18, 'VW-W-003', 'Thanh ngang trên cửa sổ', 'ViralWindow', 'viralwindow', 1.20, 0.950, 6.00, 0, 5.00, 'W - 43', 'Thanh ngang trên cửa sổ hệ ViralWindow', NULL, 1, 12, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(19, 'VW-W-004', 'Thanh ngang dưới cửa sổ', 'ViralWindow', 'viralwindow', 1.20, 1.050, 6.00, 0, 5.00, 'W - 47', 'Thanh ngang dưới cửa sổ hệ ViralWindow', NULL, 1, 13, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(20, 'VW-S-001', 'Thanh dọc lùa', 'ViralWindow', 'viralwindow', 1.60, 1.800, 6.00, 0, 5.00, 'H - 40', 'Thanh dọc cửa lùa hệ ViralWindow - Độc quyền', NULL, 1, 20, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(21, 'VW-S-002', 'Thanh ngang trên lùa', 'ViralWindow', 'viralwindow', 1.60, 1.700, 6.00, 0, 5.00, 'W - 38', 'Thanh ngang trên cửa lùa hệ ViralWindow', NULL, 1, 21, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(22, 'VW-S-003', 'Thanh ngang dưới lùa', 'ViralWindow', 'viralwindow', 1.60, 1.900, 6.00, 0, 5.00, 'W - 42', 'Thanh ngang dưới cửa lùa hệ ViralWindow', NULL, 1, 22, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(23, 'VW-S-004', 'Thanh ray lùa', 'ViralWindow', 'viralwindow', 1.50, 1.400, 6.00, 0, 5.00, 'W - 35', 'Thanh ray cửa lùa hệ ViralWindow', NULL, 1, 23, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(24, 'VW-F-001', 'Thanh ngang cửa xếp trượt', 'ViralWindow', 'viralwindow', 1.50, 1.300, 6.00, 0, 5.00, 'W - 48', 'Thanh ngang cửa xếp trượt hệ ViralWindow - Độc quyền', NULL, 1, 30, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(25, 'VW-F-002', 'Thanh dọc cửa xếp trượt', 'ViralWindow', 'viralwindow', 1.50, 1.600, 6.00, 0, 5.00, 'H - 35', 'Thanh dọc cửa xếp trượt hệ ViralWindow', NULL, 1, 31, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(26, 'VW-M-001', 'Đố ngang', 'ViralWindow', 'viralwindow', 1.20, 0.800, 6.00, 0, 4.00, 'W - 20', 'Đố ngang hệ ViralWindow', NULL, 1, 40, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(27, 'VW-M-002', 'Đố dọc', 'ViralWindow', 'viralwindow', 1.20, 0.900, 6.00, 0, 5.00, 'H - 15', 'Đố dọc hệ ViralWindow', NULL, 1, 41, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(28, 'VW-FR-001', 'Khung bao ngang', 'ViralWindow', 'viralwindow', 1.40, 1.400, 6.00, 0, 5.00, 'W - 60', 'Khung bao ngang hệ ViralWindow', NULL, 1, 50, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(29, 'VW-FR-002', 'Khung bao dọc', 'ViralWindow', 'viralwindow', 1.40, 1.600, 6.00, 0, 4.00, 'H - 50', 'Khung bao dọc hệ ViralWindow', NULL, 1, 51, '2025-11-27 07:49:10', '2025-12-15 03:44:26', NULL, 'Trắng', 50000.00, 'door', NULL, NULL),
(30, 'VW0123', 'Thanh ngang', 'ViralWindow', 'khac', 1.40, 1.200, NULL, 0, 0.00, 'W - 50 H - 100', 'Kinh chịu lực', NULL, 0, 0, '2025-11-27 14:21:29', '2025-11-27 14:21:38', NULL, 'Trắng', 0.00, 'door', NULL, NULL),
(31, 'VR0012', 'Thanh đảo khung', 'Xingfa', 'khac', 2.00, 1.400, NULL, 0, 0.00, NULL, NULL, NULL, 0, 0, '2025-12-11 04:18:35', '2025-12-11 04:18:52', NULL, 'Trắng', 0.00, 'door', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `atc_aluminum_profiles`
--

CREATE TABLE `atc_aluminum_profiles` (
  `id` bigint(20) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `aluminum_system` varchar(64) NOT NULL,
  `role` varchar(64) NOT NULL,
  `unit` varchar(10) DEFAULT 'm',
  `price_per_m` decimal(12,2) DEFAULT 0.00,
  `is_active` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `atc_aluminum_profiles`
--

INSERT INTO `atc_aluminum_profiles` (`id`, `code`, `name`, `aluminum_system`, `role`, `unit`, `price_per_m`, `is_active`) VALUES
(1, 'XF55_KB_DUNG', 'Khung bao đứng XF55', 'XINGFA_55', 'frame_vertical', 'm', 185000.00, 1),
(2, 'XF55_KB_NGANG', 'Khung bao ngang XF55', 'XINGFA_55', 'frame_horizontal', 'm', 185000.00, 1),
(3, 'XF55_CD_DUNG', 'Cánh đứng XF55', 'XINGFA_55', 'leaf_vertical', 'm', 165000.00, 1),
(4, 'XF55_CD_NGANG', 'Cánh ngang XF55', 'XINGFA_55', 'leaf_horizontal', 'm', 165000.00, 1),
(5, 'XF55_MULLION', 'Đố giữa XF55', 'XINGFA_55', 'mullion', 'm', 175000.00, 1),
(6, 'XF93_KB_DUNG', 'Khung bao đứng XF93', 'XINGFA_93', 'frame_vertical', 'm', 220000.00, 1),
(7, 'XF93_KB_NGANG', 'Khung bao ngang XF93', 'XINGFA_93', 'frame_horizontal', 'm', 220000.00, 1),
(8, 'XF93_CD_DUNG', 'Cánh đứng XF93', 'XINGFA_93', 'leaf_vertical', 'm', 200000.00, 1),
(9, 'XF93_CD_NGANG', 'Cánh ngang XF93', 'XINGFA_93', 'leaf_horizontal', 'm', 200000.00, 1),
(10, 'PMI_KB_DUNG', 'Khung bao đứng PMI', 'PMI', 'frame_vertical', 'm', 195000.00, 1),
(11, 'PMI_KB_NGANG', 'Khung bao ngang PMI', 'PMI', 'frame_horizontal', 'm', 195000.00, 1),
(12, 'PMI_CD_DUNG', 'Cánh đứng PMI', 'PMI', 'leaf_vertical', 'm', 175000.00, 1),
(13, 'PMI_CD_NGANG', 'Cánh ngang PMI', 'PMI', 'leaf_horizontal', 'm', 175000.00, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `atc_glass_types`
--

CREATE TABLE `atc_glass_types` (
  `id` bigint(20) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `thickness_mm` int(11) NOT NULL,
  `type` varchar(64) NOT NULL,
  `price_per_m2` decimal(12,2) DEFAULT 0.00,
  `is_active` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `atc_glass_types`
--

INSERT INTO `atc_glass_types` (`id`, `code`, `name`, `thickness_mm`, `type`, `price_per_m2`, `is_active`) VALUES
(1, 'TEMPERED_8', 'Kính cường lực 8mm', 8, 'tempered', 520000.00, 1),
(2, 'TEMPERED_10', 'Kính cường lực 10mm', 10, 'tempered', 650000.00, 1),
(3, 'TEMPERED_12', 'Kính cường lực 12mm', 12, 'tempered', 780000.00, 1),
(4, 'CLEAR_5', 'Kính trắng 5mm', 5, 'clear', 180000.00, 1),
(5, 'CLEAR_6', 'Kính trắng 6mm', 6, 'clear', 220000.00, 1),
(6, 'LAMINATED_6_6', 'Kính dán 6+6', 12, 'laminated', 850000.00, 1),
(7, 'LOW_E_8', 'Kính Low-E 8mm', 8, 'low_e', 720000.00, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `atc_product_accessory_rules`
--

CREATE TABLE `atc_product_accessory_rules` (
  `id` bigint(20) NOT NULL,
  `product_type` varchar(64) NOT NULL,
  `accessory_id` bigint(20) NOT NULL,
  `quantity_rule` varchar(64) NOT NULL,
  `default_qty` decimal(10,2) DEFAULT 1.00,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `atc_product_accessory_rules`
--

INSERT INTO `atc_product_accessory_rules` (`id`, `product_type`, `accessory_id`, `quantity_rule`, `default_qty`, `notes`) VALUES
(1, 'door', 2, '3_per_leaf', 3.00, 'Bản lề 3D cho mỗi cánh'),
(2, 'door', 1, '1_per_door', 1.00, 'Khóa tay gạt'),
(3, 'door', 3, '1_per_leaf', 1.00, 'Tay nắm'),
(4, 'door', 4, 'per_meter:1', 0.00, 'Gioăng cao su (tính theo chu vi)'),
(5, 'door', 5, 'fixed:2', 2.00, 'Keo silicone'),
(6, 'window', 11, '2_per_leaf', 2.00, 'Bản lề cửa sổ'),
(7, 'window', 24, '1_per_leaf', 1.00, 'Chốt gió');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `atc_product_bom_profiles`
--

CREATE TABLE `atc_product_bom_profiles` (
  `id` bigint(20) NOT NULL,
  `product_template_id` bigint(20) NOT NULL,
  `profile_id` bigint(20) NOT NULL,
  `formula` varchar(255) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `waste_percent` decimal(5,2) DEFAULT 2.00,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `atc_product_bom_profiles`
--

INSERT INTO `atc_product_bom_profiles` (`id`, `product_template_id`, `profile_id`, `formula`, `quantity`, `waste_percent`, `sort_order`) VALUES
(1, 1, 1, 'H', 2, 2.00, 1),
(2, 23, 1, 'H', 2, 2.00, 1),
(3, 24, 1, 'H', 2, 2.00, 1),
(4, 16, 1, 'H', 2, 2.00, 1),
(5, 17, 1, 'H', 2, 2.00, 1),
(8, 1, 2, 'W', 2, 2.00, 2),
(9, 23, 2, 'W', 2, 2.00, 2),
(10, 24, 2, 'W', 2, 2.00, 2),
(11, 16, 2, 'W', 2, 2.00, 2),
(12, 17, 2, 'W', 2, 2.00, 2),
(15, 1, 3, 'H', 2, 2.00, 3),
(16, 23, 3, 'H', 2, 2.00, 3),
(17, 24, 3, 'H', 2, 2.00, 3),
(18, 16, 3, 'H', 2, 2.00, 3),
(19, 17, 3, 'H', 2, 2.00, 3),
(22, 1, 4, 'W', 2, 2.00, 4),
(23, 23, 4, 'W', 2, 2.00, 4),
(24, 24, 4, 'W', 2, 2.00, 4),
(25, 16, 4, 'W', 2, 2.00, 4),
(26, 17, 4, 'W', 2, 2.00, 4),
(29, 2, 1, 'H', 2, 2.00, 1),
(30, 25, 1, 'H', 2, 2.00, 1),
(31, 18, 1, 'H', 2, 2.00, 1),
(32, 19, 1, 'H', 2, 2.00, 1),
(33, 21, 1, 'H', 2, 2.00, 1),
(34, 20, 1, 'H', 2, 2.00, 1),
(36, 2, 2, 'W', 2, 2.00, 2),
(37, 25, 2, 'W', 2, 2.00, 2),
(38, 18, 2, 'W', 2, 2.00, 2),
(39, 19, 2, 'W', 2, 2.00, 2),
(40, 21, 2, 'W', 2, 2.00, 2),
(41, 20, 2, 'W', 2, 2.00, 2),
(43, 2, 3, 'H', 4, 2.00, 3),
(44, 25, 3, 'H', 4, 2.00, 3),
(45, 18, 3, 'H', 4, 2.00, 3),
(46, 19, 3, 'H', 4, 2.00, 3),
(47, 21, 3, 'H', 4, 2.00, 3),
(48, 20, 3, 'H', 4, 2.00, 3),
(50, 2, 4, 'W/2', 4, 2.00, 4),
(51, 25, 4, 'W/2', 4, 2.00, 4),
(52, 18, 4, 'W/2', 4, 2.00, 4),
(53, 19, 4, 'W/2', 4, 2.00, 4),
(54, 21, 4, 'W/2', 4, 2.00, 4),
(55, 20, 4, 'W/2', 4, 2.00, 4),
(57, 11, 6, 'H', 2, 2.00, 1),
(58, 12, 6, 'H', 2, 2.00, 1),
(59, 38, 6, 'H', 2, 2.00, 1),
(60, 39, 6, 'H', 2, 2.00, 1),
(61, 35, 6, 'H', 2, 2.00, 1),
(62, 36, 6, 'H', 2, 2.00, 1),
(63, 37, 6, 'H', 2, 2.00, 1),
(64, 11, 7, 'W', 2, 2.00, 2),
(65, 12, 7, 'W', 2, 2.00, 2),
(66, 38, 7, 'W', 2, 2.00, 2),
(67, 39, 7, 'W', 2, 2.00, 2),
(68, 35, 7, 'W', 2, 2.00, 2),
(69, 36, 7, 'W', 2, 2.00, 2),
(70, 37, 7, 'W', 2, 2.00, 2),
(71, 11, 8, 'H', 4, 2.00, 3),
(72, 12, 8, 'H', 4, 2.00, 3),
(73, 38, 8, 'H', 4, 2.00, 3),
(74, 39, 8, 'H', 4, 2.00, 3),
(75, 35, 8, 'H', 4, 2.00, 3),
(76, 36, 8, 'H', 4, 2.00, 3),
(77, 37, 8, 'H', 4, 2.00, 3),
(78, 11, 9, 'W/2', 4, 2.00, 4),
(79, 12, 9, 'W/2', 4, 2.00, 4),
(80, 38, 9, 'W/2', 4, 2.00, 4),
(81, 39, 9, 'W/2', 4, 2.00, 4),
(82, 35, 9, 'W/2', 4, 2.00, 4),
(83, 36, 9, 'W/2', 4, 2.00, 4),
(84, 37, 9, 'W/2', 4, 2.00, 4),
(85, 7, 1, 'H', 2, 2.00, 1),
(86, 8, 1, 'H', 2, 2.00, 1),
(87, 9, 1, 'H', 2, 2.00, 1),
(88, 10, 1, 'H', 2, 2.00, 1),
(89, 26, 1, 'H', 2, 2.00, 1),
(90, 27, 1, 'H', 2, 2.00, 1),
(91, 28, 1, 'H', 2, 2.00, 1),
(92, 29, 1, 'H', 2, 2.00, 1),
(93, 30, 1, 'H', 2, 2.00, 1),
(94, 31, 1, 'H', 2, 2.00, 1),
(95, 32, 1, 'H', 2, 2.00, 1),
(96, 33, 1, 'H', 2, 2.00, 1),
(97, 34, 1, 'H', 2, 2.00, 1),
(100, 7, 2, 'W', 2, 2.00, 2),
(101, 8, 2, 'W', 2, 2.00, 2),
(102, 9, 2, 'W', 2, 2.00, 2),
(103, 10, 2, 'W', 2, 2.00, 2),
(104, 26, 2, 'W', 2, 2.00, 2),
(105, 27, 2, 'W', 2, 2.00, 2),
(106, 28, 2, 'W', 2, 2.00, 2),
(107, 29, 2, 'W', 2, 2.00, 2),
(108, 30, 2, 'W', 2, 2.00, 2),
(109, 31, 2, 'W', 2, 2.00, 2),
(110, 32, 2, 'W', 2, 2.00, 2),
(111, 33, 2, 'W', 2, 2.00, 2),
(112, 34, 2, 'W', 2, 2.00, 2),
(115, 7, 3, 'H', 2, 2.00, 3),
(116, 8, 3, 'H', 2, 2.00, 3),
(117, 9, 3, 'H', 2, 2.00, 3),
(118, 10, 3, 'H', 2, 2.00, 3),
(119, 26, 3, 'H', 2, 2.00, 3),
(120, 27, 3, 'H', 2, 2.00, 3),
(121, 28, 3, 'H', 2, 2.00, 3),
(122, 29, 3, 'H', 2, 2.00, 3),
(123, 30, 3, 'H', 2, 2.00, 3),
(124, 31, 3, 'H', 2, 2.00, 3),
(125, 32, 3, 'H', 2, 2.00, 3),
(126, 33, 3, 'H', 2, 2.00, 3),
(127, 34, 3, 'H', 2, 2.00, 3),
(130, 7, 4, 'W', 2, 2.00, 4),
(131, 8, 4, 'W', 2, 2.00, 4),
(132, 9, 4, 'W', 2, 2.00, 4),
(133, 10, 4, 'W', 2, 2.00, 4),
(134, 26, 4, 'W', 2, 2.00, 4),
(135, 27, 4, 'W', 2, 2.00, 4),
(136, 28, 4, 'W', 2, 2.00, 4),
(137, 29, 4, 'W', 2, 2.00, 4),
(138, 30, 4, 'W', 2, 2.00, 4),
(139, 31, 4, 'W', 2, 2.00, 4),
(140, 32, 4, 'W', 2, 2.00, 4),
(141, 33, 4, 'W', 2, 2.00, 4),
(142, 34, 4, 'W', 2, 2.00, 4),
(145, 42, 1, 'H', 2, 2.00, 1),
(146, 43, 1, 'H', 2, 2.00, 1),
(147, 44, 1, 'H', 2, 2.00, 1),
(148, 40, 1, 'H', 2, 2.00, 1),
(149, 41, 1, 'H', 2, 2.00, 1),
(150, 15, 1, 'H', 2, 2.00, 1),
(152, 42, 2, 'W', 2, 2.00, 2),
(153, 43, 2, 'W', 2, 2.00, 2),
(154, 44, 2, 'W', 2, 2.00, 2),
(155, 40, 2, 'W', 2, 2.00, 2),
(156, 41, 2, 'W', 2, 2.00, 2),
(157, 15, 2, 'W', 2, 2.00, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bom_items`
--

CREATE TABLE `bom_items` (
  `id` int(11) NOT NULL,
  `design_id` int(11) NOT NULL,
  `item_type` enum('frame','glass','accessory') NOT NULL,
  `item_code` varchar(50) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(50) NOT NULL,
  `weight_kg` decimal(8,3) DEFAULT NULL,
  `aluminum_system_id` int(11) DEFAULT NULL,
  `accessory_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bom_items`
--

INSERT INTO `bom_items` (`id`, `design_id`, `item_type`, `item_code`, `item_name`, `length_mm`, `quantity`, `unit`, `weight_kg`, `aluminum_system_id`, `accessory_id`, `created_at`) VALUES
(73, 14, 'glass', 'GLASS-1', 'Kính', NULL, 1, 'm2', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(74, 14, '', 'GASKET', 'Gioăng kính', 6800, 1, 'mm', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(75, 14, '', 'SCREWS', 'Vít bắt khung', NULL, 4, 'cái', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(76, 14, '', 'SEALANT', 'Keo silicon', 6800, 1, 'mm', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(77, 13, 'glass', 'GLASS-1', 'Kính', NULL, 1, 'm2', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(78, 13, '', 'GASKET', 'Gioăng kính', 6800, 1, 'mm', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(79, 13, '', 'SEALANT', 'Keo silicon', 6800, 1, 'mm', NULL, NULL, NULL, '2025-12-17 02:16:24'),
(80, 13, '', 'SCREWS', 'Vít bắt khung', NULL, 4, 'cái', NULL, NULL, NULL, '2025-12-17 02:16:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `company_config`
--

CREATE TABLE `company_config` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `tax_code` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_path` longtext DEFAULT NULL,
  `signature_footer` text DEFAULT NULL,
  `signer_name` varchar(255) DEFAULT NULL,
  `default_profit_margin` decimal(5,2) DEFAULT 20.00,
  `quote_validity_days` int(11) DEFAULT 30,
  `terms_conditions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `company_config`
--

INSERT INTO `company_config` (`id`, `company_name`, `tax_code`, `address`, `phone`, `email`, `website`, `logo_path`, `signature_footer`, `signer_name`, `default_profit_margin`, `quote_validity_days`, `terms_conditions`, `created_at`, `updated_at`) VALUES
(1, 'Công ty cổ phần Viralwindow', '0123456789', '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM', '0982068785', 'Tuanphongsbqt@gmail.com', 'https://viralwindow.vn/', 'data:image/jpeg;base64,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WNbyGFWX0fb7iSORn/Utp6SPxxrE1ZMY4jQdTWGosuymWyWVs8s7Iw380DvPJdlx4d/FQvRac1ZRVUdVTWevjmjO8xwhJ3T3q02AucKa7okdpzXcSt4UwmCvR16Wox7eFHcS5XPiV2+0NqoH85e/+H/7KSqCyV+qtmDLff5Jm3CQF2/M33mvBO6SFv8AhMKStpKQ8XHI56KmMKpHa1dZuHgjaxWrnKJzK2Ux11oKrmp6eKpga88cRdZE/wARwwvRZ9Nar13f21t4FSyAkdbUTM3cM/RYCrEuY13MZXIaByVVvo+3KNdIqsRc8PQuO9I34VzYmpIqYV3U0baPoaK+6YpqO3BsVTb24pQeRbgAsPngce8KJbdeNe6QY+1QMrKeMOOI5KffaD+rkH6KymF8uY13MZVm3pDZpElierHbZQqUtZfBF2MrEe3OcL3kA6L0VqDVOoW3fUMc8dLviSaSoGHS4+6Aez9ynqZ4p6V8gY5wjbndaMkgdgC7cBc4Vijp7KbFRq5Vd1XdStqGoyXnorkRETkiJshXy6WTVGuNcCevt9XR0sr91r5IyGwwjsHjz9Sp4tNvpbXboKCjjEcEDAxjR3L1YC5Slp7KrnvzxOduqn29qUltjI8I1rU5IgREWgZwREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREB/9k=', NULL, 'Lâm Tuấn Phong', 25.00, 30, NULL, '2025-11-26 15:08:10', '2025-12-12 08:53:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `customer_code` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tax_code` varchar(50) DEFAULT NULL,
  `customer_status` enum('potential','interested','closed','inactive') DEFAULT 'potential',
  `last_contact_date` date DEFAULT NULL,
  `next_followup_date` date DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`id`, `customer_code`, `full_name`, `phone`, `email`, `address`, `tax_code`, `customer_status`, `last_contact_date`, `next_followup_date`, `source`, `assigned_to`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'KH-001', 'Anh Tuấn', '0988 123 456', 'tuan@email.com', NULL, NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-26 15:08:10', '2025-11-26 15:08:10'),
(2, 'KH-002', 'Chị Lan', '0912 345 678', 'lan@email.com', NULL, NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-26 15:08:10', '2025-11-26 15:08:10'),
(3, 'KH-003', 'Anh Minh', '0909 876 543', 'minh@email.com', NULL, NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-26 15:08:10', '2025-11-26 15:08:10'),
(4, 'KH004', 'Anh Hùng', '0987 654 321', 'hung@example.com', 'Hà Nội', NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-26 16:57:55', '2025-11-26 16:57:55'),
(5, 'KH005', 'Chị Hương', '0913 456 789', 'huong@example.com', 'Hà Nội', NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-26 16:57:55', '2025-11-26 16:57:55'),
(6, 'KH006', 'Anh Đức', '0923 456 789', 'duc@example.com', 'Hà Nội', NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-26 16:57:55', '2025-11-26 16:57:55'),
(7, 'KH-0007', 'Lê Văn Hải', '0866025041', 'hai@gmail.com', 'Vân Canh Hoài Đức', NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-11-27 14:18:55', '2025-11-27 14:18:55'),
(9, 'KH-0009', 'Anh Vũ', '122233', 'vu@gmail.com', 'Nam Từ Liêm', NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-12-11 03:56:44', '2025-12-11 03:56:44'),
(13, 'KH-010', 'Văn Thị Cẩm Ly', '0866025041', 'camly@gmail.com', 'Yên Lạc Vĩnh Phúc', NULL, 'potential', NULL, NULL, NULL, NULL, NULL, '2025-12-16 07:38:55', '2025-12-16 07:38:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer_appointments`
--

CREATE TABLE `customer_appointments` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `appointment_type` enum('call','meeting','site_visit','followup','other') DEFAULT 'meeting',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `reminder_sent` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer_interactions`
--

CREATE TABLE `customer_interactions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `interaction_type` enum('call','email','meeting','quotation_sent','quotation_viewed','quotation_approved','quotation_rejected','note') NOT NULL,
  `interaction_date` datetime NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `related_quotation_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cutting_details`
--

CREATE TABLE `cutting_details` (
  `id` int(11) NOT NULL,
  `optimization_id` int(11) NOT NULL,
  `bom_item_id` int(11) NOT NULL,
  `cut_length_mm` int(11) NOT NULL,
  `position_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cutting_formulas`
--

CREATE TABLE `cutting_formulas` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  `door_type` enum('swing_single','swing_double','sliding_single','sliding_double','fixed','window','other') NOT NULL,
  `profile_type` enum('frame_vertical','frame_horizontal','panel_left','panel_right','panel_fixed','mullion','glass_bead','sliding_rail','glass') NOT NULL,
  `dimension_type` enum('width','height','both') DEFAULT 'height',
  `formula_expression` varchar(255) NOT NULL COMMENT 'Công thức: H-45, W-90, (H-90)/2',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cutting_optimizations`
--

CREATE TABLE `cutting_optimizations` (
  `id` int(11) NOT NULL,
  `design_id` int(11) NOT NULL,
  `aluminum_profile_id` int(11) NOT NULL,
  `profile_length_mm` int(11) NOT NULL DEFAULT 6000,
  `efficiency_percent` decimal(5,2) DEFAULT NULL,
  `waste_mm` int(11) DEFAULT NULL,
  `is_reusable` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `debts`
--

CREATE TABLE `debts` (
  `id` int(11) NOT NULL,
  `debt_type` enum('receivable','payable') NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `supplier` varchar(255) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `quotation_id` int(11) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `remaining_amount` decimal(15,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('pending','partial','paid','overdue') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `debts`
--

INSERT INTO `debts` (`id`, `debt_type`, `customer_id`, `supplier`, `project_id`, `quotation_id`, `total_amount`, `paid_amount`, `remaining_amount`, `due_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'receivable', 7, NULL, 9, 15, 1000000.00, 0.00, 1000000.00, NULL, 'pending', 'Công nợ từ báo giá BG-2025-0006', '2025-12-14 15:10:31', '2025-12-14 15:10:31'),
(2, 'receivable', 7, NULL, 10, 16, 21800000.00, 0.00, 21800000.00, NULL, 'pending', 'Công nợ từ báo giá BG-2025-0007', '2025-12-14 15:21:48', '2025-12-14 15:21:48'),
(3, 'receivable', 7, NULL, 11, 18, 3000000000.00, 0.00, 3000000000.00, NULL, 'pending', 'Công nợ từ báo giá BG-2025-0008', '2025-12-14 15:38:10', '2025-12-14 15:38:10'),
(4, 'receivable', 13, NULL, 14, 21, 72000000.00, 0.00, 72000000.00, NULL, 'pending', 'Công nợ từ báo giá BG-2025-0009', '2025-12-16 08:00:54', '2025-12-16 08:00:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `decals`
--

CREATE TABLE `decals` (
  `id` int(11) NOT NULL,
  `aluminum_system_id` int(11) NOT NULL,
  `length_mm` int(11) NOT NULL,
  `width_mm` int(11) DEFAULT NULL,
  `is_reusable` tinyint(1) DEFAULT 1,
  `location` varchar(255) DEFAULT NULL,
  `source_project_id` int(11) DEFAULT NULL,
  `status` enum('available','reserved','used') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `deduction_formulas`
--

CREATE TABLE `deduction_formulas` (
  `id` int(11) NOT NULL,
  `formula_name` varchar(255) NOT NULL,
  `formula_type` enum('door','window','sliding','fixed','other') NOT NULL,
  `description` text DEFAULT NULL,
  `glass_deduction_width` int(11) DEFAULT 0,
  `glass_deduction_height` int(11) DEFAULT 0,
  `frame_deduction_width` int(11) DEFAULT 0,
  `frame_deduction_height` int(11) DEFAULT 0,
  `overlap_addition` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `system_id` int(11) DEFAULT NULL COMMENT 'Liên kết với hệ nhôm',
  `profile_type` enum('frame_vertical','frame_horizontal','panel_left','panel_right','panel_fixed','mullion','glass_bead','sliding_rail','glass') NOT NULL DEFAULT 'frame_vertical',
  `formula_expression` varchar(255) NOT NULL COMMENT 'Công thức: H-45, W-90, (H-90)/2',
  `applies_to_width` tinyint(1) DEFAULT 0 COMMENT 'Áp dụng cho chiều rộng',
  `applies_to_height` tinyint(1) DEFAULT 1 COMMENT 'Áp dụng cho chiều cao',
  `door_type` enum('swing_single','swing_double','sliding_single','sliding_double','fixed','window','other') DEFAULT 'swing_single'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `deduction_formulas`
--

INSERT INTO `deduction_formulas` (`id`, `formula_name`, `formula_type`, `description`, `glass_deduction_width`, `glass_deduction_height`, `frame_deduction_width`, `frame_deduction_height`, `overlap_addition`, `is_active`, `created_at`, `updated_at`, `system_id`, `profile_type`, `formula_expression`, `applies_to_width`, `applies_to_height`, `door_type`) VALUES
(1, 'Cửa đi', 'door', NULL, 40, 40, 50, 30, 10, 1, '2025-11-26 15:08:10', '2025-11-26 15:08:10', NULL, 'frame_vertical', '', 0, 1, 'swing_single'),
(2, 'Cửa sổ', 'window', NULL, 35, 35, 45, 25, 8, 1, '2025-11-26 15:08:10', '2025-11-26 15:08:10', NULL, 'frame_vertical', '', 0, 1, 'swing_single'),
(3, 'Cửa lùa', 'sliding', NULL, 30, 45, 40, 35, 12, 1, '2025-11-26 15:08:10', '2025-11-26 15:08:10', NULL, 'frame_vertical', '', 0, 1, 'swing_single'),
(4, 'Cửa tối', 'fixed', NULL, 38, 38, 48, 28, 9, 1, '2025-11-26 15:08:10', '2025-11-26 15:08:10', NULL, 'frame_vertical', '', 0, 1, 'swing_single');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_aluminum_calculations`
--

CREATE TABLE `door_aluminum_calculations` (
  `id` int(11) NOT NULL,
  `door_drawing_id` int(11) NOT NULL,
  `item_type` enum('frame_top','frame_bottom','frame_left','frame_right','mullion_vertical','mullion_horizontal','panel_frame') NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `length_mm` int(11) NOT NULL,
  `width_mm` int(11) DEFAULT 0,
  `height_mm` int(11) DEFAULT 0,
  `quantity` int(11) DEFAULT 1,
  `position_x` int(11) DEFAULT 0,
  `position_y` int(11) DEFAULT 0,
  `angle_deg` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_bom_lines`
--

CREATE TABLE `door_bom_lines` (
  `id` int(11) NOT NULL,
  `door_drawing_id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `item_type` varchar(50) NOT NULL,
  `item_code` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `width_mm` int(11) DEFAULT NULL,
  `height_mm` int(11) DEFAULT NULL,
  `qty` decimal(10,3) NOT NULL DEFAULT 1.000,
  `waste_mm` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_bom_summary`
--

CREATE TABLE `door_bom_summary` (
  `id` int(11) NOT NULL,
  `door_drawing_id` int(11) NOT NULL,
  `item_type` varchar(50) DEFAULT NULL,
  `total_qty` decimal(10,3) DEFAULT NULL,
  `total_length_mm` int(11) DEFAULT NULL,
  `total_area_m2` decimal(10,3) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_cutting_plan`
--

CREATE TABLE `door_cutting_plan` (
  `id` int(11) NOT NULL,
  `door_drawing_id` int(11) NOT NULL,
  `profile_code` varchar(100) NOT NULL,
  `stock_length_mm` int(11) NOT NULL DEFAULT 6000,
  `total_bars` int(11) NOT NULL,
  `total_waste_mm` int(11) NOT NULL,
  `efficiency` decimal(5,2) DEFAULT NULL,
  `plan_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`plan_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_designs`
--

CREATE TABLE `door_designs` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `design_code` varchar(50) DEFAULT NULL,
  `door_type` enum('swing','sliding','tilt','folding','fixed') NOT NULL,
  `aluminum_system_id` int(11) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `width_mm` int(11) NOT NULL,
  `height_mm` int(11) NOT NULL,
  `number_of_panels` int(11) DEFAULT 1,
  `has_horizontal_mullion` tinyint(1) DEFAULT 0,
  `formula_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `params_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Tham số từ template: K1, K2, K3...' CHECK (json_valid(`params_json`)),
  `template_code` varchar(50) DEFAULT NULL COMMENT 'Mã template gốc',
  `preview_image` varchar(500) DEFAULT NULL,
  `drawing_image` varchar(500) DEFAULT NULL,
  `area_m2` decimal(10,4) DEFAULT 0.0000,
  `door_drawing_id` int(11) DEFAULT NULL,
  `drawing_svg` text DEFAULT NULL,
  `project_item_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `door_designs`
--

INSERT INTO `door_designs` (`id`, `project_id`, `template_id`, `design_code`, `door_type`, `aluminum_system_id`, `color`, `width_mm`, `height_mm`, `number_of_panels`, `has_horizontal_mullion`, `formula_id`, `created_at`, `updated_at`, `params_json`, `template_code`, `preview_image`, `drawing_image`, `area_m2`, `door_drawing_id`, `drawing_svg`, `project_item_id`) VALUES
(1, 3, 3, 'CT2025-003-C001', 'swing', 17, 'black', 1200, 2400, 1, 0, NULL, '2025-11-27 08:06:44', '2025-11-27 08:06:44', '{\"B\":1200,\"H\":2400}', 'CKCL', NULL, NULL, 0.0000, NULL, NULL, NULL),
(5, 2, 2, 'CT2025-002-C002', 'swing', 19, 'black', 1800, 2400, 1, 0, NULL, '2025-11-27 10:00:04', '2025-11-27 10:00:04', '{\"B\":1800,\"H\":2400,\"K1\":900,\"K2\":900}', 'D2', NULL, NULL, 0.0000, NULL, NULL, NULL),
(13, 5, 1, 'CT2025-005-C001', 'swing', 19, 'black', 1200, 2400, 1, 0, NULL, '2025-12-08 07:52:40', '2025-12-08 07:52:40', '{\"B\":1200,\"H\":2400}', 'D1', NULL, NULL, 0.0000, NULL, NULL, NULL),
(14, 5, 9, 'CT2025-005-C002', 'sliding', 19, 'black', 800, 1200, 1, 0, NULL, '2025-12-08 10:25:42', '2025-12-08 10:25:42', '{\"B\":800,\"H\":1200}', 'CSL1', NULL, NULL, 0.0000, NULL, NULL, NULL),
(19, 3, 26, 'CT2025-003-C002', 'swing', 19, 'black', 1200, 2400, 1, 0, NULL, '2025-12-11 03:54:13', '2025-12-11 03:54:13', '{}', 'WIN_SWING_1L_01', NULL, NULL, 0.0000, NULL, NULL, NULL),
(20, 7, 2, 'CT2025-440-C001', 'swing', 19, 'black', 1800, 2400, 1, 0, NULL, '2025-12-11 04:22:10', '2025-12-11 04:22:10', '{\"B\":1800,\"H\":2400,\"K1\":900,\"K2\":900}', 'D2', NULL, NULL, 0.0000, NULL, NULL, NULL),
(21, 4, 2, 'CT2025-004-C001', 'swing', 19, 'black', 1800, 2400, 1, 0, NULL, '2025-12-11 06:26:49', '2025-12-11 06:26:49', '{\"B\":1800,\"H\":2400,\"K1\":900,\"K2\":900}', 'D2', NULL, NULL, 0.0000, NULL, NULL, NULL),
(22, 7, 17, 'CT2025-440-C002', 'swing', 19, 'black', 1200, 2400, 1, 0, NULL, '2025-12-11 06:37:07', '2025-12-11 06:37:07', '{}', 'DOOR_OUT_1R_01', NULL, NULL, 0.0000, NULL, NULL, NULL),
(23, 7, NULL, 'CT2025-440-C003', '', 1, NULL, 1000, 2000, 1, 0, NULL, '2025-12-13 07:29:29', '2025-12-13 07:29:29', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(24, 11, NULL, 'CT2025-068-C001', '', 1, NULL, 1000, 2000, 1, 0, NULL, '2025-12-14 16:21:47', '2025-12-14 16:21:47', NULL, 'door_sliding', NULL, NULL, 0.0000, NULL, NULL, NULL),
(25, 11, NULL, 'CT2025-068-C002', '', 1, NULL, 1000, 2000, 1, 0, NULL, '2025-12-14 16:22:00', '2025-12-14 16:22:00', NULL, 'glass_wall', NULL, NULL, 0.0000, NULL, NULL, NULL),
(26, 13, NULL, 'CT2025-260-C001', '', 1, NULL, 1000, 2000, 1, 0, NULL, '2025-12-15 04:56:58', '2025-12-15 04:56:58', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(27, 12, 18, 'CT2025-712-C001', 'swing', 19, 'black', 1200, 2400, 1, 0, NULL, '2025-12-15 06:05:31', '2025-12-15 06:05:31', '{}', 'DOOR_OUT_2LR_01', NULL, NULL, 0.0000, NULL, NULL, NULL),
(28, 9, NULL, 'CT2025-567-C001', '', 1, 'white', 1000, 2000, 1, 0, NULL, '2025-12-15 15:36:53', '2025-12-15 15:37:33', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(29, 9, NULL, 'CT2025-567-C002', '', 1, NULL, 1000, 2000, 1, 0, NULL, '2025-12-15 15:37:25', '2025-12-15 15:37:25', NULL, 'railing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(30, 14, NULL, 'CT2025-196-C001', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(31, 14, NULL, 'CT2025-196-C002', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(32, 14, NULL, 'CT2025-196-C003', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(33, 14, NULL, 'CT2025-196-C004', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(34, 14, NULL, 'CT2025-196-C005', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(35, 14, NULL, 'CT2025-196-C006', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(36, 14, NULL, 'CT2025-196-C007', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(37, 14, NULL, 'CT2025-196-C008', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(38, 14, NULL, 'CT2025-196-C009', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(39, 14, NULL, 'CT2025-196-C010', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(40, 14, NULL, 'CT2025-196-C011', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(41, 14, NULL, 'CT2025-196-C012', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(42, 14, NULL, 'CT2025-196-C013', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(43, 14, NULL, 'CT2025-196-C014', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(44, 14, NULL, 'CT2025-196-C015', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(45, 14, NULL, 'CT2025-196-C016', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(46, 14, NULL, 'CT2025-196-C017', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(47, 14, NULL, 'CT2025-196-C018', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(48, 14, NULL, 'CT2025-196-C019', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(49, 14, NULL, 'CT2025-196-C020', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(50, 14, NULL, 'CT2025-196-C021', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(51, 14, NULL, 'CT2025-196-C022', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(52, 14, NULL, 'CT2025-196-C023', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(53, 14, NULL, 'CT2025-196-C024', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(54, 14, NULL, 'CT2025-196-C025', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(55, 14, NULL, 'CT2025-196-C026', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(56, 14, NULL, 'CT2025-196-C027', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(57, 14, NULL, 'CT2025-196-C028', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(58, 14, NULL, 'CT2025-196-C029', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(59, 14, NULL, 'CT2025-196-C030', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(60, 14, NULL, 'CT2025-196-C031', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(61, 14, NULL, 'CT2025-196-C032', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(62, 14, NULL, 'CT2025-196-C033', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(63, 14, NULL, 'CT2025-196-C034', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(64, 14, NULL, 'CT2025-196-C035', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(65, 14, NULL, 'CT2025-196-C036', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(66, 14, NULL, 'CT2025-196-C037', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(67, 14, NULL, 'CT2025-196-C038', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(68, 14, NULL, 'CT2025-196-C039', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(69, 14, NULL, 'CT2025-196-C040', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(70, 14, NULL, 'CT2025-196-C041', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(71, 14, NULL, 'CT2025-196-C042', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(72, 14, NULL, 'CT2025-196-C043', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(73, 14, NULL, 'CT2025-196-C044', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(74, 14, NULL, 'CT2025-196-C045', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(75, 14, NULL, 'CT2025-196-C046', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(76, 14, NULL, 'CT2025-196-C047', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(77, 14, NULL, 'CT2025-196-C048', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(78, 14, NULL, 'CT2025-196-C049', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(79, 14, NULL, 'CT2025-196-C050', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:02:30', '2025-12-16 12:02:30', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(80, 14, NULL, 'CT2025-196-C051', '', 1, NULL, 1000, 2000, 1, 0, NULL, '2025-12-16 12:03:05', '2025-12-16 12:03:05', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(81, 14, NULL, 'CT2025-196-C052', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(82, 14, NULL, 'CT2025-196-C053', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(83, 14, NULL, 'CT2025-196-C054', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(84, 14, NULL, 'CT2025-196-C055', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(85, 14, NULL, 'CT2025-196-C056', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(86, 14, NULL, 'CT2025-196-C057', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(87, 14, NULL, 'CT2025-196-C058', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(88, 14, NULL, 'CT2025-196-C059', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(89, 14, NULL, 'CT2025-196-C060', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(90, 14, NULL, 'CT2025-196-C061', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(91, 14, NULL, 'CT2025-196-C062', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(92, 14, NULL, 'CT2025-196-C063', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(93, 14, NULL, 'CT2025-196-C064', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(94, 14, NULL, 'CT2025-196-C065', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(95, 14, NULL, 'CT2025-196-C066', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(96, 14, NULL, 'CT2025-196-C067', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(97, 14, NULL, 'CT2025-196-C068', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(98, 14, NULL, 'CT2025-196-C069', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(99, 14, NULL, 'CT2025-196-C070', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(100, 14, NULL, 'CT2025-196-C071', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(101, 14, NULL, 'CT2025-196-C072', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(102, 14, NULL, 'CT2025-196-C073', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(103, 14, NULL, 'CT2025-196-C074', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(104, 14, NULL, 'CT2025-196-C075', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(105, 14, NULL, 'CT2025-196-C076', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(106, 14, NULL, 'CT2025-196-C077', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(107, 14, NULL, 'CT2025-196-C078', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(108, 14, NULL, 'CT2025-196-C079', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(109, 14, NULL, 'CT2025-196-C080', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'door_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(110, 14, NULL, 'CT2025-196-C081', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(111, 14, NULL, 'CT2025-196-C082', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(112, 14, NULL, 'CT2025-196-C083', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(113, 14, NULL, 'CT2025-196-C084', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(114, 14, NULL, 'CT2025-196-C085', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(115, 14, NULL, 'CT2025-196-C086', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(116, 14, NULL, 'CT2025-196-C087', 'sliding', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(117, 14, NULL, 'CT2025-196-C088', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(118, 14, NULL, 'CT2025-196-C089', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(119, 14, NULL, 'CT2025-196-C090', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(120, 14, NULL, 'CT2025-196-C091', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(121, 14, NULL, 'CT2025-196-C092', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(122, 14, NULL, 'CT2025-196-C093', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(123, 14, NULL, 'CT2025-196-C094', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(124, 14, NULL, 'CT2025-196-C095', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(125, 14, NULL, 'CT2025-196-C096', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(126, 14, NULL, 'CT2025-196-C097', 'fixed', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(127, 14, NULL, 'CT2025-196-C098', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(128, 14, NULL, 'CT2025-196-C099', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(129, 14, NULL, 'CT2025-196-C100', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(130, 14, NULL, 'CT2025-196-C101', 'swing', 1, NULL, 1200, 2200, 1, 0, NULL, '2025-12-16 12:07:52', '2025-12-16 12:07:52', NULL, 'window_swing', NULL, NULL, 0.0000, NULL, NULL, NULL),
(135, 14, NULL, 'D1-11', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 11),
(136, 14, NULL, 'D1-12', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 12),
(137, 14, NULL, 'D1-13', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 13),
(138, 14, NULL, 'D1-14', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 14),
(139, 14, NULL, 'D1-15', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 15),
(140, 14, NULL, 'CS1-16', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 16),
(141, 14, NULL, 'CS1-17', 'swing', 3, NULL, 1200, 2200, 1, 0, NULL, '2025-12-17 03:09:58', '2025-12-17 03:09:58', NULL, NULL, NULL, NULL, 0.0000, NULL, NULL, 17);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `door_designs_compat`
-- (See below for the actual view)
--
CREATE TABLE `door_designs_compat` (
`id` bigint(20)
,`project_id` bigint(20)
,`design_code` varchar(50)
,`width_mm` int(11)
,`height_mm` int(11)
,`number_of_panels` int(11)
,`door_type` enum('swing_in','swing_out','sliding','fixed','tilt_turn')
,`aluminum_system_code` varchar(50)
,`status` enum('draft','configured','structured','bom_generated','priced','locked')
,`created_at` datetime
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_drawings`
--

CREATE TABLE `door_drawings` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `door_design_id` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `template_code` varchar(50) DEFAULT NULL,
  `drawing_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'JSON chứa toàn bộ dữ liệu bản vẽ' CHECK (json_valid(`drawing_data`)),
  `svg_data` text DEFAULT NULL COMMENT 'SVG code của bản vẽ',
  `image_data` longtext DEFAULT NULL COMMENT 'Base64 image data',
  `width_mm` int(11) NOT NULL,
  `height_mm` int(11) NOT NULL,
  `params_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Tham số K1, K2, K3, K4...' CHECK (json_valid(`params_json`)),
  `calculated_dimensions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Kích thước đã tính: H1, H2, B1, B2, glass dimensions...' CHECK (json_valid(`calculated_dimensions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_glass_calculations`
--

CREATE TABLE `door_glass_calculations` (
  `id` int(11) NOT NULL,
  `door_drawing_id` int(11) NOT NULL,
  `glass_panel_number` int(11) NOT NULL,
  `width_mm` int(11) NOT NULL,
  `height_mm` int(11) NOT NULL,
  `area_m2` decimal(10,4) NOT NULL,
  `position_x` int(11) DEFAULT 0,
  `position_y` int(11) DEFAULT 0,
  `glass_type` varchar(50) DEFAULT NULL,
  `thickness_mm` int(11) DEFAULT NULL,
  `deduction_width_mm` int(11) DEFAULT 0,
  `deduction_height_mm` int(11) DEFAULT 0,
  `calculated_width_mm` int(11) NOT NULL,
  `calculated_height_mm` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_structure_items`
--

CREATE TABLE `door_structure_items` (
  `id` int(11) NOT NULL,
  `door_drawing_id` int(11) NOT NULL,
  `item_type` enum('frame_vertical','frame_horizontal','panel','glass','mullion_vertical','mullion_horizontal','handle','hinge','lock') NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `position_x` int(11) DEFAULT 0,
  `position_y` int(11) DEFAULT 0,
  `width_mm` int(11) NOT NULL,
  `height_mm` int(11) NOT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `angle_deg` int(11) DEFAULT 0,
  `color` varchar(50) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `door_templates`
--

CREATE TABLE `door_templates` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL COMMENT 'Mã template: D1, CKCL, CKCL2...',
  `name` varchar(255) NOT NULL COMMENT 'Tên template',
  `category` varchar(50) DEFAULT NULL COMMENT 'door, window, sliding, folding',
  `family` enum('door_out','door_in','window_swing','window_sliding','door_sliding','door_folding','wall_window','fixed','other') NOT NULL COMMENT 'Loại cửa',
  `preview_image` varchar(500) DEFAULT NULL COMMENT 'Ảnh preview template',
  `param_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Schema các tham số: B, H, K1, K2, K3...' CHECK (json_valid(`param_schema`)),
  `description` text DEFAULT NULL,
  `aluminum_system_id` int(11) DEFAULT NULL COMMENT 'Hệ nhôm mặc định',
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `structure_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON mô tả cấu trúc cửa: panels, frames, mullions' CHECK (json_valid(`structure_json`)),
  `template_json` longtext DEFAULT NULL COMMENT 'JSON chứa toàn bộ template',
  `render_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Cấu hình render: colors, line_width, etc' CHECK (json_valid(`render_config`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `door_templates`
--

INSERT INTO `door_templates` (`id`, `code`, `name`, `category`, `family`, `preview_image`, `param_schema`, `description`, `aluminum_system_id`, `is_active`, `display_order`, `created_at`, `updated_at`, `structure_json`, `template_json`, `render_config`) VALUES
(1, 'D1', 'Cửa đi 1 cánh mở ngoài', NULL, 'door_out', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, 6, 1, 1, '2025-11-26 16:06:00', '2025-11-26 17:17:35', '{\"type\": \"door_swing\", \"panels\": 1, \"open_direction\": \"left\", \"has_transom\": false, \"structure\": [{\"type\": \"frame\", \"position\": \"outer\"}, {\"type\": \"panel\", \"position\": \"center\", \"panels\": 1}]}', NULL, NULL),
(2, 'D2', 'Cửa đi 2 cánh mở ngoài', NULL, 'door_out', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 3000, \"default\": 1800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}]}', NULL, 6, 1, 2, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(3, 'CKCL', 'Cửa kính cường lực 1 cánh', NULL, 'door_out', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, 6, 1, 3, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(4, 'CKCL2', 'Cửa kính cường lực 2 cánh', NULL, 'door_out', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 3000, \"default\": 1800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}]}', NULL, 6, 1, 4, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(5, 'CKCL3', 'Cửa kính cường lực 3 cánh', NULL, 'door_out', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 4000, \"default\": 2700}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 900}, {\"name\": \"K2\", \"label\": \"Cánh giữa (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 900}, {\"name\": \"K3\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 900}]}', NULL, 6, 1, 5, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(6, 'D1_IN', 'Cửa đi 1 cánh mở trong', NULL, 'door_in', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, 6, 1, 10, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(7, 'CS1', 'Cửa sổ 1 cánh mở quay', NULL, 'window_swing', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}]}', NULL, 6, 1, 20, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(8, 'CS2', 'Cửa sổ 2 cánh mở quay', NULL, 'window_swing', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 800, \"max\": 3000, \"default\": 1600}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}]}', NULL, 6, 1, 21, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(9, 'CSL1', 'Cửa sổ 1 cánh trượt', NULL, 'window_sliding', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}]}', NULL, 6, 1, 30, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(10, 'CSL2', 'Cửa sổ 2 cánh trượt', NULL, 'window_sliding', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 800, \"max\": 3000, \"default\": 1600}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}]}', NULL, 6, 1, 31, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(11, 'DL1', 'Cửa đi 1 cánh trượt', NULL, 'door_sliding', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, 6, 1, 40, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(12, 'DL2', 'Cửa đi 2 cánh trượt', NULL, 'door_sliding', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 4000, \"default\": 2400}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}]}', NULL, 6, 1, 41, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(13, 'DX1', 'Cửa đi xếp trượt 2 cánh', NULL, 'door_folding', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 4000, \"default\": 2400}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh 1 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K2\", \"label\": \"Cánh 2 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}]}', NULL, 6, 1, 50, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(14, 'DX2', 'Cửa đi xếp trượt 4 cánh', NULL, 'door_folding', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 2400, \"max\": 6000, \"default\": 4800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh 1 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K2\", \"label\": \"Cánh 2 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K3\", \"label\": \"Cánh 3 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K4\", \"label\": \"Cánh 4 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}]}', NULL, 6, 1, 51, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(15, 'VCS1', 'Vách + Cửa sổ quay 1 cánh', NULL, 'wall_window', NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 800, \"max\": 3000, \"default\": 2000}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 3000, \"default\": 2400}, {\"name\": \"H1\", \"label\": \"Chiều cao vách (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"H2\", \"label\": \"Chiều cao cửa sổ (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1600}]}', NULL, 6, 1, 60, '2025-11-26 16:06:00', '2025-11-26 16:06:00', NULL, NULL, NULL),
(16, 'DOOR_OUT_1L_01', 'Cửa đi 1 cánh mở ngoài trái', NULL, 'door_out', NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', 'Cửa đi 1 cánh mở quay ngoài, cánh mở sang trái', 12, 1, 1, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(17, 'DOOR_OUT_1R_01', 'Cửa đi 1 cánh mở ngoài phải', NULL, 'door_out', NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', 'Cửa đi 1 cánh mở quay ngoài, cánh mở sang phải', 12, 1, 2, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(18, 'DOOR_OUT_2LR_01', 'Cửa đi 2 cánh mở quay ngoài (2 cánh bằng)', NULL, 'door_out', NULL, '{\"defaultWidth\":1600,\"defaultHeight\":2200}', 'Cửa đi 2 cánh mở quay ngoài, 2 cánh bằng nhau', 12, 1, 3, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(19, 'DOOR_OUT_2LR_ASYM_01', 'Cửa đi 2 cánh lệch (cánh chính + cánh phụ)', NULL, 'door_out', NULL, '{\"defaultWidth\":1500,\"defaultHeight\":2200}', 'Cửa đi 2 cánh lệch, cánh chính rộng gấp đôi cánh phụ', 12, 1, 4, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[2,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(20, 'DOOR_OUT_2LR_TOPFIX_01', 'Cửa đi 2 cánh + fix trên', NULL, 'door_out', NULL, '{\"defaultWidth\":1600,\"defaultHeight\":2600}', 'Cửa đi 2 cánh mở quay + ô gió fix phía trên', 12, 1, 5, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(21, 'DOOR_OUT_2LR_SIDEFIX_01', 'Cửa đi 2 cánh + fix 2 bên', NULL, 'door_out', NULL, '{\"defaultWidth\":2200,\"defaultHeight\":2300}', 'Cửa đi 2 cánh mở quay + 2 ô fix 2 bên', 12, 1, 6, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,2,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(22, 'DOOR_OUT_4L_01', 'Cửa đi 4 cánh mở quay ngoài', NULL, 'door_out', NULL, '{\"defaultWidth\":3200,\"defaultHeight\":2400}', 'Cửa đi 4 cánh mở quay ngoài, xen kẽ trái-phải', 12, 1, 7, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(23, 'DOOR_IN_1L_01', 'Cửa đi 1 cánh mở trong trái', NULL, 'door_in', NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', 'Cửa đi 1 cánh mở quay trong, cánh mở sang trái', 12, 1, 8, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(24, 'DOOR_IN_1R_01', 'Cửa đi 1 cánh mở trong phải', NULL, 'door_in', NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', 'Cửa đi 1 cánh mở quay trong, cánh mở sang phải', 12, 1, 9, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(25, 'DOOR_IN_2LR_01', 'Cửa đi 2 cánh mở quay trong (2 cánh bằng)', NULL, 'door_in', NULL, '{\"defaultWidth\":1600,\"defaultHeight\":2200}', 'Cửa đi 2 cánh mở quay trong, 2 cánh bằng nhau', 12, 1, 10, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(26, 'WIN_SWING_1L_01', 'Cửa sổ 1 cánh mở quay trái', NULL, 'window_swing', NULL, '{\"defaultWidth\":800,\"defaultHeight\":1200}', 'Cửa sổ 1 cánh mở quay, cánh mở sang trái', 12, 1, 11, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(27, 'WIN_SWING_1R_01', 'Cửa sổ 1 cánh mở quay phải', NULL, 'window_swing', NULL, '{\"defaultWidth\":800,\"defaultHeight\":1200}', 'Cửa sổ 1 cánh mở quay, cánh mở sang phải', 12, 1, 12, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(28, 'WIN_SWING_2LR_01', 'Cửa sổ 2 cánh mở quay', NULL, 'window_swing', NULL, '{\"defaultWidth\":1200,\"defaultHeight\":1200}', 'Cửa sổ 2 cánh mở quay, xen kẽ trái-phải', 12, 1, 13, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(29, 'WIN_SWING_3_01', 'Cửa sổ 3 cánh (2 mở quay + 1 fix giữa)', NULL, 'window_swing', NULL, '{\"defaultWidth\":1800,\"defaultHeight\":1200}', 'Cửa sổ 3 cánh, 2 cánh mở quay 2 bên, 1 cánh fix giữa', 12, 1, 14, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(30, 'WIN_SWING_4_01', 'Cửa sổ 4 cánh mở quay', NULL, 'window_swing', NULL, '{\"defaultWidth\":2400,\"defaultHeight\":1200}', 'Cửa sổ 4 cánh mở quay, xen kẽ trái-phải', 12, 1, 15, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(31, 'WIN_SWING_2LR_TOPFIX_01', 'Cửa sổ 2 cánh mở quay + fix trên', NULL, 'window_swing', NULL, '{\"defaultWidth\":1200,\"defaultHeight\":1600}', 'Cửa sổ 2 cánh mở quay + ô gió fix phía trên', 12, 1, 16, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(32, 'WIN_TILT_1_01', 'Cửa sổ 1 cánh mở hất', NULL, 'window_swing', NULL, '{\"defaultWidth\":900,\"defaultHeight\":900}', 'Cửa sổ 1 cánh mở hất (top-hung)', 12, 1, 17, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"tilt\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(33, 'WIN_TILT_2_01', 'Cửa sổ 2 cánh mở hất', NULL, 'window_swing', NULL, '{\"defaultWidth\":1600,\"defaultHeight\":900}', 'Cửa sổ 2 cánh mở hất', 12, 1, 18, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"tilt\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"tilt\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(34, 'WIN_TILT_TURN_1_01', 'Cửa sổ 1 cánh mở hất-mở quay', NULL, 'window_swing', NULL, '{\"defaultWidth\":900,\"defaultHeight\":1200}', 'Cửa sổ 1 cánh mở hất-mở quay (tilt-turn)', 12, 1, 19, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"tilt-turn\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(35, 'SLID_WIN_2_01', 'Cửa sổ lùa 2 cánh', NULL, 'window_sliding', NULL, '{\"defaultWidth\":1600,\"defaultHeight\":1200}', 'Cửa sổ lùa 2 cánh', 20, 1, 20, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(36, 'SLID_WIN_3_01', 'Cửa sổ lùa 3 cánh', NULL, 'window_sliding', NULL, '{\"defaultWidth\":2100,\"defaultHeight\":1200}', 'Cửa sổ lùa 3 cánh', 20, 1, 21, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(37, 'SLID_WIN_4_01', 'Cửa sổ lùa 4 cánh', NULL, 'window_sliding', NULL, '{\"defaultWidth\":2800,\"defaultHeight\":1200}', 'Cửa sổ lùa 4 cánh', 20, 1, 22, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(38, 'SLID_DOOR_2_01', 'Cửa đi lùa 2 cánh', NULL, 'door_sliding', NULL, '{\"defaultWidth\":2000,\"defaultHeight\":2200}', 'Cửa đi lùa 2 cánh', 20, 1, 23, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(39, 'SLID_DOOR_4_01', 'Cửa đi lùa 4 cánh', NULL, 'door_sliding', NULL, '{\"defaultWidth\":3200,\"defaultHeight\":2300}', 'Cửa đi lùa 4 cánh', 20, 1, 24, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(40, 'PARTITION_DOOR_1L_01', 'Vách 2 bên + cửa đi 1 cánh giữa', NULL, 'wall_window', NULL, '{\"defaultWidth\":2600,\"defaultHeight\":2600}', 'Vách kính 2 bên + cửa đi 1 cánh ở giữa + fix trên', 12, 1, 25, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F3\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(41, 'PARTITION_DOOR_2LR_01', 'Vách 2 bên + cửa đi 2 cánh giữa + fix trên', NULL, 'wall_window', NULL, '{\"defaultWidth\":3200,\"defaultHeight\":2800}', 'Vách kính 2 bên + cửa đi 2 cánh ở giữa + fix trên', 12, 1, 26, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,2,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F3\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(42, 'FIXED_WINDOW_1_01', 'Cửa sổ fix 1 ô', NULL, 'fixed', NULL, '{\"defaultWidth\":1200,\"defaultHeight\":1200}', 'Cửa sổ fix 1 ô', 12, 1, 27, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}', NULL, NULL),
(43, 'FIXED_WINDOW_2_01', 'Cửa sổ fix 2 ô', NULL, 'fixed', NULL, '{\"defaultWidth\":2400,\"defaultHeight\":1200}', 'Cửa sổ fix 2 ô', 12, 1, 28, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, NULL),
(44, 'FIXED_WINDOW_4_01', 'Cửa sổ fix 4 ô', NULL, 'fixed', NULL, '{\"defaultWidth\":2400,\"defaultHeight\":2400}', 'Cửa sổ fix 4 ô (2x2)', 12, 1, 29, '2025-12-08 14:44:03', '2025-12-08 14:44:03', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]},{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F3\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F4\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}]}', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `door_templates_view`
-- (See below for the actual view)
--
CREATE TABLE `door_templates_view` (
`id` int(11)
,`code` varchar(50)
,`name` varchar(255)
,`product_type` enum('door','window','glass_wall','railing','roof','stair','other')
,`category` varchar(50)
,`sub_type` varchar(50)
,`family` varchar(50)
,`aluminum_system` varchar(50)
,`aluminum_system_id` int(11)
,`preview_image` varchar(255)
,`template_json` longtext
,`param_schema` longtext
,`structure_json` longtext
,`bom_rules` longtext
,`default_width_mm` int(11)
,`default_height_mm` int(11)
,`glass_type` varchar(100)
,`description` text
,`is_active` tinyint(1)
,`display_order` int(11)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `financial_transactions`
--

CREATE TABLE `financial_transactions` (
  `id` int(11) NOT NULL,
  `transaction_code` varchar(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `transaction_type` enum('revenue','expense') NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `expense_type` enum('supplier_payment','construction_cost','transport_cost','labor_cost','material_cost','other') DEFAULT NULL,
  `supplier` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `production_order_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('draft','posted','cancelled') NOT NULL DEFAULT 'draft' COMMENT 'Trạng thái: nháp, đã ghi sổ, đã hủy'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `financial_transactions`
--

INSERT INTO `financial_transactions` (`id`, `transaction_code`, `transaction_date`, `transaction_type`, `category`, `expense_type`, `supplier`, `amount`, `description`, `project_id`, `production_order_id`, `customer_id`, `payment_method`, `reference_number`, `created_by`, `created_at`, `status`) VALUES
(1, 'THU-2025-0001', '2025-12-13', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 300000.00, 'Thu tiền cọc từ báo giá BG-2025-0006 - Lê Văn Hải', 9, NULL, 7, 'cash', NULL, NULL, '2025-12-16 04:52:29', 'draft'),
(2, 'THU-2025-0003', '2025-12-13', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 6540000.00, 'Thu tiền cọc từ báo giá BG-2025-0007 - Lê Văn Hải', 10, NULL, 7, 'cash', NULL, NULL, '2025-12-16 04:52:29', 'draft'),
(3, 'THU-2025-0005', '2025-12-13', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 900000000.00, 'Thu tiền cọc từ báo giá BG-2025-0008 - Lê Văn Hải', 11, NULL, 7, 'cash', NULL, NULL, '2025-12-16 04:52:29', 'draft'),
(4, 'CHI-2025-0001', '2025-12-11', 'expense', 'Chi phí vật tư', '', NULL, 1000000.00, 'Chi phí Nhôm cho dự án Nhà phố Thanh Xuân', 2, NULL, NULL, NULL, 'PMAT-1', NULL, '2025-12-16 04:52:29', 'draft'),
(5, 'CHI-2025-0003', '2025-12-12', 'expense', 'Chi phí vật tư', '', NULL, 10000.00, 'Chi phí Kính vip cho dự án Anh Vũ', 7, NULL, NULL, NULL, 'PMAT-2', NULL, '2025-12-16 04:52:29', 'draft'),
(6, 'CHI-2025-0005', '2025-12-14', 'expense', 'Chi phí vật tư', '', NULL, 1100000.00, 'Chi phí Keo cho dự án Anh Vũ - Nam Định', 8, NULL, NULL, NULL, 'PMAT-3', NULL, '2025-12-16 04:52:29', 'draft'),
(7, 'CHI-2025-0007', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 85000.00, 'Chi phí Bản lề 3D cao cấp cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-4', NULL, '2025-12-16 04:52:29', 'draft'),
(8, 'CHI-2025-0009', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 85000.00, 'Chi phí Bản lề 3D cao cấp - ViralWindow cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-5', NULL, '2025-12-16 04:52:29', 'draft'),
(9, 'CHI-2025-0011', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 110000.00, 'Chi phí Bản lề ẩn - ViralWindow cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-6', NULL, '2025-12-16 04:52:29', 'draft'),
(10, 'CHI-2025-0013', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Đố ngang cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-7', NULL, '2025-12-16 04:52:29', 'draft'),
(11, 'CHI-2025-0015', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Khung bao dọc cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-8', NULL, '2025-12-16 04:52:29', 'draft'),
(12, 'CHI-2025-0017', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 1000000.00, 'Chi phí Kính cửa cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-9', NULL, '2025-12-16 04:52:29', 'draft'),
(13, 'CHI-2025-0019', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 9000.00, 'Chi phí Keo 502 cho dự án aa', 11, NULL, NULL, NULL, 'PMAT-10', NULL, '2025-12-16 04:52:29', 'draft'),
(14, 'CHI-2025-0021', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 85000.00, 'Chi phí Bản lề 3D cao cấp cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-11', NULL, '2025-12-16 04:52:29', 'draft'),
(15, 'CHI-2025-0023', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 85000.00, 'Chi phí Bản lề 3D cao cấp - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-12', NULL, '2025-12-16 04:52:29', 'draft'),
(16, 'CHI-2025-0025', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 110000.00, 'Chi phí Bản lề ẩn - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-13', NULL, '2025-12-16 04:52:29', 'draft'),
(17, 'CHI-2025-0027', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 60000.00, 'Chi phí Bản lề cửa sổ - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-14', NULL, '2025-12-16 04:52:29', 'draft'),
(18, 'CHI-2025-0029', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 180000.00, 'Chi phí Bánh xe lùa inox cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-15', NULL, '2025-12-16 04:52:29', 'draft'),
(19, 'CHI-2025-0031', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 180000.00, 'Chi phí Bánh xe lùa inox - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-16', NULL, '2025-12-16 04:52:29', 'draft'),
(20, 'CHI-2025-0033', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 35000.00, 'Chi phí Chốt gió cửa sổ - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-17', NULL, '2025-12-16 04:52:29', 'draft'),
(21, 'CHI-2025-0035', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 15000.00, 'Chi phí Gioăng cao su EPDM cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-18', NULL, '2025-12-16 04:52:29', 'draft'),
(22, 'CHI-2025-0037', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 15000.00, 'Chi phí Gioăng cao su EPDM - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-19', NULL, '2025-12-16 04:52:29', 'draft'),
(23, 'CHI-2025-0039', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 20000.00, 'Chi phí Gioăng cửa lùa - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-20', NULL, '2025-12-16 04:52:29', 'draft'),
(24, 'CHI-2025-0041', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 18000.00, 'Chi phí Gioăng kính - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-21', NULL, '2025-12-16 04:52:29', 'draft'),
(25, 'CHI-2025-0043', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 55000.00, 'Chi phí Keo dán kính - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-22', NULL, '2025-12-16 04:52:29', 'draft'),
(26, 'CHI-2025-0045', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 45000.00, 'Chi phí Keo silicone chống thấm cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-23', NULL, '2025-12-16 04:52:29', 'draft'),
(27, 'CHI-2025-0047', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 45000.00, 'Chi phí Keo silicone chống thấm - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-24', NULL, '2025-12-16 04:52:29', 'draft'),
(28, 'CHI-2025-0049', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 120000.00, 'Chi phí Khóa chốt cửa đi - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-25', NULL, '2025-12-16 04:52:29', 'draft'),
(29, 'CHI-2025-0051', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 90000.00, 'Chi phí Khóa cửa sổ - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-26', NULL, '2025-12-16 04:52:29', 'draft'),
(30, 'CHI-2025-0053', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 250000.00, 'Chi phí Khóa tay gạt inox 304 cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-27', NULL, '2025-12-16 04:52:29', 'draft'),
(31, 'CHI-2025-0055', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 250000.00, 'Chi phí Khóa tay gạt inox 304 - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-28', NULL, '2025-12-16 04:52:29', 'draft'),
(32, 'CHI-2025-0057', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 10000.00, 'Chi phí Nẹp che khe - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-29', NULL, '2025-12-16 04:52:29', 'draft'),
(33, 'CHI-2025-0059', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 250000.00, 'Chi phí Ray trượt cửa lùa - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-30', NULL, '2025-12-16 04:52:29', 'draft'),
(34, 'CHI-2025-0061', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 95000.00, 'Chi phí Tay nắm inox - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-31', NULL, '2025-12-16 04:52:29', 'draft'),
(35, 'CHI-2025-0063', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 120000.00, 'Chi phí Tay nắm nhôm đúc cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-32', NULL, '2025-12-16 04:52:29', 'draft'),
(36, 'CHI-2025-0065', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 120000.00, 'Chi phí Tay nắm nhôm đúc - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-33', NULL, '2025-12-16 04:52:29', 'draft'),
(37, 'CHI-2025-0067', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 25000.00, 'Chi phí Vít bắt cửa - ViralWindow cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-34', NULL, '2025-12-16 04:52:29', 'draft'),
(38, 'CHI-2025-0069', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Đố dọc cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-35', NULL, '2025-12-16 04:52:29', 'draft'),
(39, 'CHI-2025-0071', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Đố ngang cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-36', NULL, '2025-12-16 04:52:29', 'draft'),
(40, 'CHI-2025-0073', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Khung bao dọc cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-37', NULL, '2025-12-16 04:52:29', 'draft'),
(41, 'CHI-2025-0075', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Khung bao ngang cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-38', NULL, '2025-12-16 04:52:29', 'draft'),
(42, 'CHI-2025-0077', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh dọc cửa đi cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-39', NULL, '2025-12-16 04:52:29', 'draft'),
(43, 'CHI-2025-0079', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh dọc cửa đi cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-40', NULL, '2025-12-16 04:52:29', 'draft'),
(44, 'CHI-2025-0081', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh dọc cửa sổ cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-41', NULL, '2025-12-16 04:52:29', 'draft'),
(45, 'CHI-2025-0083', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh dọc cửa xếp trượt cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-42', NULL, '2025-12-16 04:52:29', 'draft'),
(46, 'CHI-2025-0085', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh dọc lùa cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-43', NULL, '2025-12-16 04:52:29', 'draft'),
(47, 'CHI-2025-0087', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh dọc lùa cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-44', NULL, '2025-12-16 04:52:29', 'draft'),
(48, 'CHI-2025-0089', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-45', NULL, '2025-12-16 04:52:29', 'draft'),
(49, 'CHI-2025-0091', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cửa đi cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-46', NULL, '2025-12-16 04:52:29', 'draft'),
(50, 'CHI-2025-0093', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cửa đi cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-47', NULL, '2025-12-16 04:52:29', 'draft'),
(51, 'CHI-2025-0095', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 5000000.00, 'Chi phí Thanh ngang cửa sổ cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-48', NULL, '2025-12-16 04:52:29', 'draft'),
(52, 'CHI-2025-0097', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cửa sổ cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-49', NULL, '2025-12-16 04:52:29', 'draft'),
(53, 'CHI-2025-0099', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cửa sổ cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-50', NULL, '2025-12-16 04:52:29', 'draft'),
(54, 'CHI-2025-0101', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cửa xếp trượt cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-51', NULL, '2025-12-16 04:52:29', 'draft'),
(55, 'CHI-2025-0103', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang cửa xếp trượt cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-52', NULL, '2025-12-16 04:52:29', 'draft'),
(56, 'CHI-2025-0105', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang dưới cửa đi cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-53', NULL, '2025-12-16 04:52:29', 'draft'),
(57, 'CHI-2025-0107', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang dưới cửa sổ cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-54', NULL, '2025-12-16 04:52:29', 'draft'),
(58, 'CHI-2025-0109', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang dưới lùa cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-55', NULL, '2025-12-16 04:52:29', 'draft'),
(59, 'CHI-2025-0111', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang trên cửa đi cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-56', NULL, '2025-12-16 04:52:29', 'draft'),
(60, 'CHI-2025-0113', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang trên cửa sổ cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-57', NULL, '2025-12-16 04:52:29', 'draft'),
(61, 'CHI-2025-0115', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ngang trên lùa cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-58', NULL, '2025-12-16 04:52:29', 'draft'),
(62, 'CHI-2025-0117', '2025-12-15', 'expense', 'Chi phí vật tư', '', NULL, 50000.00, 'Chi phí Thanh ray lùa cho dự án Biệt thự Hải', 9, NULL, NULL, NULL, 'PMAT-59', NULL, '2025-12-16 04:52:29', 'draft'),
(64, 'THU-2025-0063', '0000-00-00', '', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:15:04', 'draft'),
(65, 'THU-2025-0004', '2025-12-14', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 300000.00, 'Thu tiền cọc từ báo giá BG-2025-0006 - Lê Văn Hải', 9, NULL, 7, NULL, 'QUO-ADV-15', NULL, '2025-12-16 06:16:07', 'draft'),
(66, 'THU-2025-0006', '2025-12-14', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 6540000.00, 'Thu tiền cọc từ báo giá BG-2025-0007 - Lê Văn Hải', 10, NULL, 7, NULL, 'QUO-ADV-16', NULL, '2025-12-16 06:16:07', 'draft'),
(67, 'THU-2025-0008', '2025-12-14', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 900000000.00, 'Thu tiền cọc từ báo giá BG-2025-0008 - Lê Văn Hải', 11, NULL, 7, NULL, 'QUO-ADV-18', NULL, '2025-12-16 06:16:07', 'draft'),
(68, 'CHI-2025-0066', '0000-00-00', '', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:17:34', 'draft'),
(69, 'THU-2025-0007', '2025-12-16', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 21600000.00, 'Thu tiền cọc từ báo giá BG-2025-0009 - Văn Thị Cẩm Ly', 14, NULL, 13, NULL, 'QUO-ADV-21', NULL, '2025-12-16 08:06:14', 'draft'),
(70, 'THU-2025-0067', '2025-12-17', 'revenue', 'Tiền cọc báo giá', NULL, NULL, 1000000.00, 'Cọc', 14, NULL, 13, 'cash', NULL, NULL, '2025-12-17 01:41:18', 'draft');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `gasket_rules`
--

CREATE TABLE `gasket_rules` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL COMMENT 'FK to aluminum_systems',
  `gasket_code` varchar(100) NOT NULL COMMENT 'Mã gioăng',
  `gasket_name` varchar(255) DEFAULT NULL COMMENT 'Tên gioăng',
  `perimeter_factor` decimal(5,3) NOT NULL DEFAULT 1.000 COMMENT 'Hệ số nhân chu vi kính',
  `usage_type` varchar(50) DEFAULT NULL COMMENT 'glass_seal, frame_seal, ...',
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `gasket_rules`
--

INSERT INTO `gasket_rules` (`id`, `system_id`, `gasket_code`, `gasket_name`, `perimeter_factor`, `usage_type`, `is_required`, `created_at`, `updated_at`) VALUES
(1, 1, 'VW-G-001', 'Gioăng cao su EPDM', 1.000, 'glass_seal', 1, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(2, 1, 'VW-G-002', 'Gioăng kính', 1.000, 'glass_seal', 1, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(3, 1, 'VW-G-003', 'Gioăng cửa lùa', 1.000, 'sliding_seal', 1, '2025-12-07 12:52:50', '2025-12-07 12:52:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `glass_rules`
--

CREATE TABLE `glass_rules` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL COMMENT 'FK to aluminum_systems',
  `glass_type` varchar(100) NOT NULL COMMENT '5mm clear, 8.38 cường lực, 10mm Low-E...',
  `deduction_x_mm` int(11) NOT NULL DEFAULT 30 COMMENT 'Trừ kích thước theo chiều ngang (mm)',
  `deduction_y_mm` int(11) NOT NULL DEFAULT 30 COMMENT 'Trừ kích thước theo chiều đứng (mm)',
  `is_default` tinyint(1) DEFAULT 0 COMMENT 'Loại kính mặc định cho hệ này',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `glass_rules`
--

INSERT INTO `glass_rules` (`id`, `system_id`, `glass_type`, `deduction_x_mm`, `deduction_y_mm`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, '8ly', 30, 30, 1, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(2, 1, '10ly', 32, 32, 0, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(3, 1, '8k', 30, 30, 0, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(4, 1, '10k', 32, 32, 0, '2025-12-07 12:52:50', '2025-12-07 12:52:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `glass_types`
--

CREATE TABLE `glass_types` (
  `id` bigint(20) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `thickness_mm` int(11) NOT NULL COMMENT '5, 6, 8, 10, 12...',
  `type` varchar(64) NOT NULL COMMENT 'clear, tempered, laminated, low_e, tinted',
  `price_per_m2` decimal(12,2) DEFAULT 0.00,
  `is_active` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `glass_types`
--

INSERT INTO `glass_types` (`id`, `code`, `name`, `thickness_mm`, `type`, `price_per_m2`, `is_active`) VALUES
(1, 'TEMPERED_8', 'Kính cường lực 8mm', 8, 'tempered', 520000.00, 1),
(2, 'TEMPERED_10', 'Kính cường lực 10mm', 10, 'tempered', 650000.00, 1),
(3, 'TEMPERED_12', 'Kính cường lực 12mm', 12, 'tempered', 780000.00, 1),
(4, 'CLEAR_5', 'Kính trắng 5mm', 5, 'clear', 180000.00, 1),
(5, 'CLEAR_6', 'Kính trắng 6mm', 6, 'clear', 220000.00, 1),
(6, 'LAMINATED_6_6', 'Kính dán 6+6', 12, 'laminated', 850000.00, 1),
(7, 'LOW_E_8', 'Kính Low-E 8mm', 8, 'low_e', 720000.00, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hardware_rules`
--

CREATE TABLE `hardware_rules` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL COMMENT 'FK to aluminum_systems',
  `panel_type` varchar(100) NOT NULL COMMENT 'window_turn_left, door_single_right, sliding_3, fixed, ...',
  `hardware_code` varchar(100) NOT NULL COMMENT 'Mã phụ kiện (bản lề, tay nắm, khóa...)',
  `hardware_name` varchar(255) DEFAULT NULL COMMENT 'Tên phụ kiện',
  `qty_per_panel` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng mỗi panel',
  `position` varchar(50) DEFAULT NULL COMMENT 'Vị trí: left, right, top, bottom, center',
  `is_required` tinyint(1) DEFAULT 1 COMMENT 'Bắt buộc hay không',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hardware_rules`
--

INSERT INTO `hardware_rules` (`id`, `system_id`, `panel_type`, `hardware_code`, `hardware_name`, `qty_per_panel`, `position`, `is_required`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'window-turn-left', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(2, 1, 'window-turn-left', 'VW-K-001', 'Tay nắm nhôm đúc', 1, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(3, 1, 'window-turn-left', 'VW-L-003', 'Khóa cửa sổ', 1, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(4, 1, 'window-turn-left', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(5, 1, 'window-turn-right', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(6, 1, 'window-turn-right', 'VW-K-001', 'Tay nắm nhôm đúc', 1, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(7, 1, 'window-turn-right', 'VW-L-003', 'Khóa cửa sổ', 1, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(8, 1, 'window-turn-right', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(9, 1, 'window-tilt', 'VW-H-002', 'Bản lề cửa sổ', 2, 'top', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(10, 1, 'window-tilt', 'VW-K-001', 'Tay nắm nhôm đúc', 1, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(11, 1, 'window-tilt', 'VW-L-003', 'Khóa cửa sổ', 1, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(12, 1, 'window-tilt', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(13, 1, 'window-tilt-turn', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(14, 1, 'window-tilt-turn', 'VW-K-001', 'Tay nắm nhôm đúc', 1, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(15, 1, 'window-tilt-turn', 'VW-L-003', 'Khóa cửa sổ Tilt&Turn', 1, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(16, 1, 'window-tilt-turn', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(17, 1, 'window-fixed', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(18, 1, 'door-single-left', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(19, 1, 'door-single-left', 'VW-K-001', 'Tay nắm nhôm đúc', 1, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(20, 1, 'door-single-left', 'VW-L-001', 'Khóa tay gạt inox 304', 1, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(21, 1, 'door-single-left', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(22, 1, 'door-single-right', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(23, 1, 'door-single-right', 'VW-K-001', 'Tay nắm nhôm đúc', 1, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(24, 1, 'door-single-right', 'VW-L-001', 'Khóa tay gạt inox 304', 1, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(25, 1, 'door-single-right', 'VW-G-001', 'Gioăng cao su EPDM', 1, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(26, 1, 'door-french', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'left', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(27, 1, 'door-french', 'VW-H-001', 'Bản lề 3D cao cấp', 3, 'right', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(28, 1, 'door-french', 'VW-K-001', 'Tay nắm nhôm đúc', 2, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(29, 1, 'door-french', 'VW-L-001', 'Khóa tay gạt inox 304', 1, 'master', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(30, 1, 'door-french', 'VW-L-002', 'Khóa chốt cửa đi', 1, 'slave', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(31, 1, 'door-french', 'VW-G-001', 'Gioăng cao su EPDM', 2, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(32, 1, 'sliding-2', 'VW-SL-001', 'Bánh xe lùa inox', 2, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(33, 1, 'sliding-2', 'VW-SL-002', 'Ray trượt cửa lùa', 1, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(34, 1, 'sliding-2', 'VW-K-001', 'Tay nắm nhôm đúc', 2, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(35, 1, 'sliding-2', 'VW-G-003', 'Gioăng cửa lùa', 2, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(36, 1, 'sliding-3', 'VW-SL-001', 'Bánh xe lùa inox', 3, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(37, 1, 'sliding-3', 'VW-SL-002', 'Ray trượt cửa lùa', 1, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(38, 1, 'sliding-3', 'VW-K-001', 'Tay nắm nhôm đúc', 3, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(39, 1, 'sliding-3', 'VW-G-003', 'Gioăng cửa lùa', 3, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(40, 1, 'sliding-4', 'VW-SL-001', 'Bánh xe lùa inox', 4, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(41, 1, 'sliding-4', 'VW-SL-002', 'Ray trượt cửa lùa', 1, 'bottom', 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(42, 1, 'sliding-4', 'VW-K-001', 'Tay nắm nhôm đúc', 4, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50'),
(43, 1, 'sliding-4', 'VW-G-003', 'Gioăng cửa lùa', 4, NULL, 1, NULL, '2025-12-07 12:52:50', '2025-12-07 12:52:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `item_type` enum('aluminum','glass','accessory','other') NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) NOT NULL,
  `min_stock_level` decimal(10,2) DEFAULT 0.00,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory`
--

INSERT INTO `inventory` (`id`, `item_type`, `item_code`, `item_name`, `quantity`, `unit`, `min_stock_level`, `unit_price`, `location`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'glass', 'K-01', 'Kính cửa', 2.00, 'm²', 10.00, 1000000.00, NULL, 'Kính cường lực - 10mm - 4m x 2m', '2025-12-02 15:42:32', '2025-12-15 02:57:54'),
(2, 'aluminum', 'K12', 'Nhôm', 9.00, 'cái', 10.00, 1000000.00, NULL, NULL, '2025-12-11 04:29:33', '2025-12-11 08:56:36'),
(3, 'glass', '323', '2323', 5.00, 'm²', 10.00, 3000000.00, NULL, 'Kính 2 lớp - 8mm - 2m x 1.5m', '2025-12-12 16:38:27', '2025-12-14 13:18:18'),
(4, 'other', 'VT0012', 'Keo', 89.00, 'Cái', 10.00, 100000.00, NULL, 'Vật liệu xây dựng', '2025-12-12 16:45:37', '2025-12-14 13:19:18'),
(5, 'other', 'jjk', 'Keo 502', 99.00, 'Cái', 10.00, 9000.00, NULL, 'Vật tư tiêu hao', '2025-12-13 16:25:07', '2025-12-15 02:57:54'),
(6, 'other', 'Vt0122', 'Máy cắt', 5.00, 'Cái', 1.00, 50000000.00, NULL, 'Dụng cụ', '2025-12-13 16:41:40', '2025-12-14 13:17:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_in`
--

CREATE TABLE `inventory_in` (
  `id` int(11) NOT NULL,
  `receipt_code` varchar(50) NOT NULL,
  `source_type` enum('purchase','production_return','adjustment','other') DEFAULT 'purchase',
  `source_reference` varchar(100) DEFAULT NULL,
  `receipt_date` date NOT NULL,
  `item_type` enum('aluminum','glass','accessory','other') NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  `supplier` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_notifications`
--

CREATE TABLE `inventory_notifications` (
  `id` int(11) NOT NULL,
  `warning_id` int(11) NOT NULL,
  `notification_type` enum('email','system','sms') DEFAULT 'system',
  `recipient_id` int(11) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_out`
--

CREATE TABLE `inventory_out` (
  `id` int(11) NOT NULL,
  `inventory_id` int(11) DEFAULT NULL,
  `issue_code` varchar(50) NOT NULL,
  `issue_date` date NOT NULL,
  `item_type` enum('aluminum','glass','accessory','other') NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `issued_quantity` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `production_order_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL,
  `inventory_id` int(11) DEFAULT NULL COMMENT 'ID vật tư từ bảng inventory (nhôm, kính)',
  `accessory_id` int(11) DEFAULT NULL COMMENT 'ID phụ kiện từ bảng accessories (nếu là phụ kiện)',
  `project_id` int(11) DEFAULT NULL COMMENT 'ID dự án (nếu xuất kho cho dự án)',
  `transaction_type` enum('import','export') NOT NULL COMMENT 'Loại giao dịch: import (nhập kho) hoặc export (xuất kho)',
  `quantity` decimal(10,2) NOT NULL COMMENT 'Số lượng',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Ngày giờ giao dịch',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử giao dịch nhập/xuất kho';

--
-- Đang đổ dữ liệu cho bảng `inventory_transactions`
--

INSERT INTO `inventory_transactions` (`id`, `inventory_id`, `accessory_id`, `project_id`, `transaction_type`, `quantity`, `notes`, `transaction_date`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 7, 'export', 10.00, 'Công trình ', '2025-12-11 14:33:34', '2025-12-11 07:33:34', '2025-12-11 07:33:34'),
(2, 1, NULL, 7, 'export', 3.00, NULL, '2025-12-11 14:39:23', '2025-12-11 07:39:23', '2025-12-11 07:39:23'),
(3, 1, NULL, 5, 'export', 1.00, NULL, '2025-12-11 14:45:15', '2025-12-11 07:45:15', '2025-12-11 07:45:15'),
(7, 1, NULL, NULL, 'export', 1.00, NULL, '2025-12-11 15:25:28', '2025-12-11 08:25:28', '2025-12-11 08:25:28'),
(9, 2, NULL, 2, 'export', 1.00, NULL, '2025-12-11 15:56:36', '2025-12-11 08:56:36', '2025-12-11 08:56:36'),
(11, 1, NULL, 7, 'export', 1.00, NULL, '2025-12-12 22:46:53', '2025-12-12 15:46:53', '2025-12-12 15:46:53'),
(12, 4, NULL, 8, 'export', 11.00, NULL, '2025-12-14 20:19:18', '2025-12-14 13:19:18', '2025-12-14 13:19:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_warnings`
--

CREATE TABLE `inventory_warnings` (
  `id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `warning_type` enum('low_stock','out_of_stock','expiring_soon') DEFAULT 'low_stock',
  `current_quantity` decimal(10,2) NOT NULL,
  `min_stock_level` decimal(10,2) NOT NULL,
  `status` enum('active','acknowledged','resolved') DEFAULT 'active',
  `notified_at` timestamp NULL DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `acknowledged_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_bom_lines`
--

CREATE TABLE `item_bom_lines` (
  `id` bigint(20) NOT NULL,
  `bom_version_id` bigint(20) NOT NULL,
  `material_group` enum('aluminum','glass','hardware','consumable') NOT NULL,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `cut_length_mm` int(11) DEFAULT NULL,
  `cut_angle` varchar(20) DEFAULT NULL,
  `weight_kg` decimal(10,3) DEFAULT NULL,
  `width_mm` int(11) DEFAULT NULL,
  `height_mm` int(11) DEFAULT NULL,
  `area_m2` decimal(10,6) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `source_structure_table` varchar(50) DEFAULT NULL,
  `source_structure_id` bigint(20) DEFAULT NULL,
  `unit_price` decimal(15,2) DEFAULT NULL,
  `total_price` decimal(15,2) DEFAULT NULL,
  `formula_used` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_bom_lines`
--

INSERT INTO `item_bom_lines` (`id`, `bom_version_id`, `material_group`, `material_code`, `material_name`, `quantity`, `unit`, `cut_length_mm`, `cut_angle`, `weight_kg`, `width_mm`, `height_mm`, `area_m2`, `position`, `source_structure_table`, `source_structure_id`, `unit_price`, `total_price`, `formula_used`, `sort_order`, `created_at`) VALUES
(1, 4, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1120, 2250, 2.520000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-80)*(H-150)', 0, '2025-12-16 22:45:43'),
(2, 5, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 22:46:44'),
(3, 5, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 22:46:44'),
(4, 5, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 22:46:44'),
(5, 5, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 22:46:44'),
(6, 5, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-16 22:46:44'),
(7, 5, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-16 22:46:44'),
(8, 5, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-16 22:46:44'),
(9, 5, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-16 22:46:44'),
(10, 5, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1160, 2360, 2.737600, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-80)*(H-150)', 0, '2025-12-16 22:46:44'),
(11, 5, 'hardware', 'HINGE_3D', 'Bản lề 3D', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3*leaf_count', 0, '2025-12-16 22:46:44'),
(12, 5, 'hardware', 'LOCK_MULTIPOINT', 'Khóa đa điểm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', 0, '2025-12-16 22:46:44'),
(13, 5, 'hardware', 'HANDLE', 'Tay nắm', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 22:46:44'),
(14, 5, 'consumable', 'GASKET_FRAME', 'Gioăng khung', 14.400, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 22:46:44'),
(15, 5, 'consumable', 'SEALANT', 'Keo silicone', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-16 22:46:44'),
(16, 6, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:18:04'),
(17, 6, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:18:04'),
(18, 6, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:18:04'),
(19, 6, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:18:04'),
(20, 6, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:18:04'),
(21, 6, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:18:04'),
(22, 6, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-40', 0, '2025-12-16 23:18:04'),
(23, 6, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-40', 0, '2025-12-16 23:18:04'),
(24, 6, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-16 23:18:04'),
(25, 6, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-16 23:18:04'),
(26, 6, 'hardware', 'STAY_ARM', 'Chốt gió', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:18:04'),
(27, 6, 'consumable', 'GASKET', 'Gioăng', 9.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*1.5', 0, '2025-12-16 23:18:04'),
(28, 7, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:18:34'),
(29, 7, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:18:34'),
(30, 7, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:18:34'),
(31, 7, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:18:34'),
(32, 7, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-16 23:18:34'),
(33, 7, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-16 23:18:34'),
(34, 7, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-50', 0, '2025-12-16 23:18:34'),
(35, 7, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-50', 0, '2025-12-16 23:18:34'),
(36, 7, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1120, 2250, 2.520000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-80)*(H-150)', 0, '2025-12-16 23:18:34'),
(37, 7, 'hardware', 'HINGE_3D', 'Bản lề 3D', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3*leaf_count', 0, '2025-12-16 23:18:34'),
(38, 7, 'hardware', 'LOCK_MULTIPOINT', 'Khóa đa điểm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', 0, '2025-12-16 23:18:34'),
(39, 7, 'hardware', 'HANDLE', 'Tay nắm', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:18:34'),
(40, 7, 'consumable', 'GASKET_FRAME', 'Gioăng khung', 14.400, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:18:34'),
(41, 7, 'consumable', 'SEALANT', 'Keo silicone', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-16 23:18:34'),
(42, 8, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:29:31'),
(43, 8, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:29:31'),
(44, 8, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:29:31'),
(45, 8, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:29:31'),
(46, 8, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:29:31'),
(47, 8, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:29:31'),
(48, 8, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-40', 0, '2025-12-16 23:29:31'),
(49, 8, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-40', 0, '2025-12-16 23:29:31'),
(50, 8, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-16 23:29:31'),
(51, 8, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-16 23:29:31'),
(52, 8, 'hardware', 'STAY_ARM', 'Chốt gió', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:29:31'),
(53, 8, 'consumable', 'GASKET', 'Gioăng', 9.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*1.5', 0, '2025-12-16 23:29:31'),
(54, 9, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:31:49'),
(55, 9, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:31:49'),
(56, 9, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:31:49'),
(57, 9, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:31:49'),
(58, 9, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:31:49'),
(59, 9, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:31:49'),
(60, 9, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:31:49'),
(61, 9, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-16 23:31:49'),
(62, 9, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-16 23:31:49'),
(63, 9, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:31:49'),
(64, 9, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:31:49'),
(65, 10, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:32:49'),
(66, 10, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:32:49'),
(67, 10, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:32:49'),
(68, 10, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:32:49'),
(69, 10, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:32:49'),
(70, 10, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:32:49'),
(71, 10, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:32:49'),
(72, 10, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:32:49'),
(73, 10, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:32:49'),
(74, 10, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:32:49'),
(75, 10, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:32:49'),
(76, 10, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:32:49'),
(77, 10, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-16 23:32:49'),
(78, 10, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-16 23:32:49'),
(79, 10, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-16 23:32:49'),
(80, 10, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:32:49'),
(81, 10, 'consumable', 'GASKET', 'Gioăng', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:32:49'),
(82, 11, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:33:53'),
(83, 11, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:33:53'),
(84, 11, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:33:53'),
(85, 11, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:33:53'),
(86, 11, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:33:53'),
(87, 11, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:33:53'),
(88, 11, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:33:53'),
(89, 11, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-16 23:33:53'),
(90, 11, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-16 23:33:53'),
(91, 11, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:33:53'),
(92, 11, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:33:53'),
(93, 12, 'aluminum', 'AL_POST', 'Trụ đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'post', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:33:59'),
(94, 12, 'aluminum', 'LC_TAY_VIN', 'Tay vịn', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'handrail', NULL, NULL, NULL, NULL, 'L', 0, '2025-12-16 23:33:59'),
(95, 12, 'aluminum', 'AL_RAIL', 'Thanh ray trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'rail', NULL, NULL, NULL, NULL, 'L', 0, '2025-12-16 23:33:59'),
(96, 12, 'aluminum', 'AL_RAIL', 'Thanh ray dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'rail', NULL, NULL, NULL, NULL, 'L', 0, '2025-12-16 23:33:59'),
(97, 12, 'aluminum', 'LC_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'rail', NULL, NULL, NULL, NULL, 'L', 0, '2025-12-16 23:33:59'),
(98, 12, 'aluminum', 'LC_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'rail', NULL, NULL, NULL, NULL, 'L', 0, '2025-12-16 23:33:59'),
(99, 12, 'aluminum', 'LC_TRU', 'Trụ đứng', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'post', NULL, NULL, NULL, NULL, 'handrail_height', 0, '2025-12-16 23:33:59'),
(100, 12, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, 'L*handrail_height/1000000', 0, '2025-12-16 23:33:59'),
(101, 12, 'hardware', 'POST_CAP', 'Nắp trụ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'span_count+1', 0, '2025-12-16 23:33:59'),
(102, 12, 'hardware', 'STANDOFF', 'Chân đế', 4.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(span_count+1)*2', 0, '2025-12-16 23:33:59'),
(103, 12, 'consumable', 'GASKET_RAIL', 'Gioăng lan can', 2000.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'L*2', 0, '2025-12-16 23:33:59'),
(104, 13, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2200, '90-90', 1.100, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:34:07'),
(105, 13, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2200, '90-90', 1.100, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:34:07'),
(106, 13, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:07'),
(107, 13, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:07'),
(108, 13, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 2120, '90-90', 1.060, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:34:07'),
(109, 13, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 2120, '90-90', 1.060, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:34:07'),
(110, 13, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 1160, '90-90', 0.580, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:34:07'),
(111, 13, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 1160, '90-90', 0.580, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:34:07'),
(112, 13, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:07'),
(113, 13, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:07'),
(114, 13, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 2160, '90-90', 1.080, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:34:07'),
(115, 13, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 2160, '90-90', 1.080, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:34:07'),
(116, 13, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1120, 2050, 2.296000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-16 23:34:07'),
(117, 13, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-16 23:34:07'),
(118, 13, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-16 23:34:07'),
(119, 13, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:34:07'),
(120, 13, 'consumable', 'GASKET', 'Gioăng', 13.600, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:34:07'),
(121, 14, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:34:36'),
(122, 14, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:34:36'),
(123, 14, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:36'),
(124, 14, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:36'),
(125, 14, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:34:36'),
(126, 14, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:34:36'),
(127, 14, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:34:36'),
(128, 14, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:34:36'),
(129, 14, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:36'),
(130, 14, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:36'),
(131, 14, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:34:36'),
(132, 14, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:34:36'),
(133, 14, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-16 23:34:36'),
(134, 14, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-16 23:34:36'),
(135, 14, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-16 23:34:36'),
(136, 14, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:34:36'),
(137, 14, 'consumable', 'GASKET', 'Gioăng', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:34:36'),
(138, 15, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:34:38'),
(139, 15, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:34:38'),
(140, 15, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:38'),
(141, 15, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:38'),
(142, 15, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-16 23:34:38'),
(143, 15, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-16 23:34:38'),
(144, 15, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-16 23:34:38'),
(145, 15, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-16 23:34:38'),
(146, 15, 'aluminum', 'XF55_KB100', 'Khung bao ngang trên', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:38'),
(147, 15, 'aluminum', 'XF55_KB100', 'Khung bao ngang dưới', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:34:38'),
(148, 15, 'aluminum', 'XF55_KB100', 'Khung bao XF55', 1.000, 'pcs', 2345, '90-90', 1.173, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-55', 0, '2025-12-16 23:34:38'),
(149, 15, 'aluminum', 'XF55_KB100', 'Khung bao XF55', 1.000, 'pcs', 2345, '90-90', 1.173, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-55', 0, '2025-12-16 23:34:38'),
(150, 15, 'aluminum', 'XF55_CANH', 'Cánh ngang trên', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-50', 0, '2025-12-16 23:34:38'),
(151, 15, 'aluminum', 'XF55_CANH', 'Cánh ngang dưới', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-50', 0, '2025-12-16 23:34:38'),
(152, 15, 'aluminum', 'XF55_CANH', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-16 23:34:38'),
(153, 15, 'aluminum', 'XF55_CANH', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-16 23:34:38'),
(154, 15, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1115, 2240, 2.497600, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-80)*(H-150)', 0, '2025-12-16 23:34:38'),
(155, 15, 'hardware', 'HINGE_3D', 'Bản lề 3D', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3*leaf_count', 0, '2025-12-16 23:34:38'),
(156, 15, 'hardware', 'LOCK_MULTIPOINT', 'Khóa đa điểm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', 0, '2025-12-16 23:34:38'),
(157, 15, 'hardware', 'HANDLE', 'Tay nắm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:34:38'),
(158, 15, 'hardware', 'HINGE', 'Bản lề', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*3', 0, '2025-12-16 23:34:38'),
(159, 15, 'hardware', 'LOCK', 'Khóa cửa', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:34:38'),
(160, 15, 'consumable', 'GASKET_FRAME', 'Gioăng khung', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-16 23:34:38'),
(161, 15, 'consumable', 'SEALANT', 'Keo silicone', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-16 23:34:38'),
(162, 15, 'consumable', 'GASKET_SASH', 'Gioăng cánh', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*leaf_count', 0, '2025-12-16 23:34:38'),
(163, 15, 'consumable', 'SILICONE', 'Keo silicone', 3.600, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*0.5', 0, '2025-12-16 23:34:38'),
(164, 16, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:38:37'),
(165, 16, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-16 23:38:37'),
(166, 16, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:38:37'),
(167, 16, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:38:37'),
(168, 16, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:38:37'),
(169, 16, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-16 23:38:37'),
(170, 16, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:38:37'),
(171, 16, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-16 23:38:37'),
(172, 16, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:38:37'),
(173, 16, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-16 23:38:37'),
(174, 16, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:38:37'),
(175, 16, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-16 23:38:37'),
(176, 16, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-16 23:38:37'),
(177, 16, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-16 23:38:37'),
(178, 16, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-16 23:38:37'),
(179, 16, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-16 23:38:37'),
(180, 16, 'consumable', 'GASKET', 'Gioăng', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-16 23:38:37'),
(181, 17, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:14:48'),
(182, 17, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:14:48'),
(183, 17, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:14:48'),
(184, 17, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:14:48'),
(185, 17, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-17 08:14:48'),
(186, 17, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-17 08:14:48'),
(187, 17, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-17 08:14:48'),
(188, 17, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-17 08:14:48'),
(189, 17, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:14:48'),
(190, 17, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:14:48'),
(191, 17, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-17 08:14:48'),
(192, 17, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-17 08:14:48'),
(193, 17, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-17 08:14:48'),
(194, 17, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-17 08:14:48'),
(195, 17, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-17 08:14:48'),
(196, 17, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 08:14:48'),
(197, 17, 'consumable', 'GASKET', 'Gioăng', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:14:48'),
(198, 18, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:19:00'),
(199, 18, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:19:00'),
(200, 18, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:19:00'),
(201, 18, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:19:00'),
(202, 18, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:19:00'),
(203, 18, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:19:00'),
(204, 18, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:19:00'),
(205, 18, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-17 08:19:00'),
(206, 18, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 08:19:00'),
(207, 18, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:19:00'),
(208, 18, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:19:00'),
(209, 19, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:43:57'),
(210, 19, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:43:57'),
(211, 19, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:43:57'),
(212, 19, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:43:57'),
(213, 19, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:43:57'),
(214, 19, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:43:57'),
(215, 19, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:43:57'),
(216, 19, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-17 08:43:57'),
(217, 19, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 08:43:57'),
(218, 19, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:43:57'),
(219, 19, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:43:57'),
(220, 20, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:44:07'),
(221, 20, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:44:07'),
(222, 20, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:44:07'),
(223, 20, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:44:07'),
(224, 20, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:44:07'),
(225, 20, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:44:07'),
(226, 20, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:44:07'),
(227, 20, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-17 08:44:07'),
(228, 20, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 08:44:07'),
(229, 20, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:44:07'),
(230, 20, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:44:07'),
(231, 21, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2200, '90-90', 1.100, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:51:07'),
(232, 21, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2200, '90-90', 1.100, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 08:51:07'),
(233, 21, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:51:07'),
(234, 21, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:51:07'),
(235, 21, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 2120, '90-90', 1.060, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-17 08:51:07'),
(236, 21, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 2120, '90-90', 1.060, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-17 08:51:07'),
(237, 21, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 1160, '90-90', 0.580, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-17 08:51:07'),
(238, 21, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 1160, '90-90', 0.580, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-17 08:51:07'),
(239, 21, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:51:07'),
(240, 21, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 08:51:07'),
(241, 21, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 2160, '90-90', 1.080, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-17 08:51:07'),
(242, 21, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 2160, '90-90', 1.080, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-17 08:51:07'),
(243, 21, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1120, 2050, 2.296000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-17 08:51:07'),
(244, 21, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-17 08:51:07'),
(245, 21, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-17 08:51:07'),
(246, 21, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 08:51:07'),
(247, 21, 'consumable', 'GASKET', 'Gioăng', 13.600, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 08:51:07'),
(248, 22, 'aluminum', 'AL_FRAME_LEFT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:02:05'),
(249, 22, 'aluminum', 'AL_FRAME_RIGHT', 'Khung bao đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:02:05'),
(250, 22, 'aluminum', 'AL_FRAME_TOP', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:05'),
(251, 22, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung bao ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:05'),
(252, 22, 'aluminum', 'AL_SASH_LEFT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-17 09:02:05'),
(253, 22, 'aluminum', 'AL_SASH_RIGHT', 'Cánh đứng', 1.000, 'pcs', 1920, '90-90', 0.960, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-80', 0, '2025-12-17 09:02:05'),
(254, 22, 'aluminum', 'AL_SASH_TOP', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-17 09:02:05'),
(255, 22, 'aluminum', 'AL_SASH_BOTTOM', 'Cánh ngang', 1.000, 'pcs', 960, '90-90', 0.480, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-40', 0, '2025-12-17 09:02:05'),
(256, 22, 'aluminum', 'XF55_KB65', 'Khung bao ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:05'),
(257, 22, 'aluminum', 'XF55_KB65', 'Khung bao ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:05'),
(258, 22, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-17 09:02:05'),
(259, 22, 'aluminum', 'XF55_KB65', 'Khung bao đứng', 1.000, 'pcs', 1960, '90-90', 0.980, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-40', 0, '2025-12-17 09:02:05'),
(260, 22, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-60)*(H-120)', 0, '2025-12-17 09:02:05'),
(261, 22, 'hardware', 'HINGE_WINDOW', 'Bản lề cửa sổ', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2*leaf_count', 0, '2025-12-17 09:02:05'),
(262, 22, 'hardware', 'STAY_ARM', 'Chốt gió', 2.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*2', 0, '2025-12-17 09:02:05'),
(263, 22, 'hardware', 'LOCK_WINDOW', 'Khóa cửa sổ', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 09:02:05'),
(264, 22, 'consumable', 'GASKET', 'Gioăng', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 09:02:05'),
(265, 23, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:02:41'),
(266, 23, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:02:41'),
(267, 23, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:41'),
(268, 23, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:41'),
(269, 23, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:02:41'),
(270, 23, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:41'),
(271, 23, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:02:41'),
(272, 23, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-17 09:02:41'),
(273, 23, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 09:02:41'),
(274, 23, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 09:02:41'),
(275, 23, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 09:02:41'),
(276, 24, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:12:25'),
(277, 24, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:12:25'),
(278, 24, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:25'),
(279, 24, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:25'),
(280, 24, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-17 09:12:25');
INSERT INTO `item_bom_lines` (`id`, `bom_version_id`, `material_group`, `material_code`, `material_name`, `quantity`, `unit`, `cut_length_mm`, `cut_angle`, `weight_kg`, `width_mm`, `height_mm`, `area_m2`, `position`, `source_structure_table`, `source_structure_id`, `unit_price`, `total_price`, `formula_used`, `sort_order`, `created_at`) VALUES
(281, 24, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-17 09:12:25'),
(282, 24, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-17 09:12:25'),
(283, 24, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-17 09:12:25'),
(284, 24, 'aluminum', 'XF55_KB100', 'Khung bao ngang trên', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:25'),
(285, 24, 'aluminum', 'XF55_KB100', 'Khung bao ngang dưới', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:25'),
(286, 24, 'aluminum', 'XF55_KB100', 'Khung bao XF55', 1.000, 'pcs', 2345, '90-90', 1.173, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-55', 0, '2025-12-17 09:12:25'),
(287, 24, 'aluminum', 'XF55_KB100', 'Khung bao XF55', 1.000, 'pcs', 2345, '90-90', 1.173, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-55', 0, '2025-12-17 09:12:25'),
(288, 24, 'aluminum', 'XF55_CANH', 'Cánh ngang trên', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-50', 0, '2025-12-17 09:12:25'),
(289, 24, 'aluminum', 'XF55_CANH', 'Cánh ngang dưới', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-50', 0, '2025-12-17 09:12:25'),
(290, 24, 'aluminum', 'XF55_CANH', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-17 09:12:25'),
(291, 24, 'aluminum', 'XF55_CANH', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-17 09:12:25'),
(292, 24, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1115, 2240, 2.497600, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-80)*(H-150)', 0, '2025-12-17 09:12:25'),
(293, 24, 'hardware', 'HINGE_3D', 'Bản lề 3D', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3*leaf_count', 0, '2025-12-17 09:12:25'),
(294, 24, 'hardware', 'LOCK_MULTIPOINT', 'Khóa đa điểm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', 0, '2025-12-17 09:12:25'),
(295, 24, 'hardware', 'HANDLE', 'Tay nắm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 09:12:25'),
(296, 24, 'hardware', 'HINGE', 'Bản lề', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*3', 0, '2025-12-17 09:12:25'),
(297, 24, 'hardware', 'LOCK', 'Khóa cửa', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 09:12:25'),
(298, 24, 'consumable', 'GASKET_FRAME', 'Gioăng khung', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 09:12:25'),
(299, 24, 'consumable', 'SEALANT', 'Keo silicone', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 09:12:25'),
(300, 24, 'consumable', 'GASKET_SASH', 'Gioăng cánh', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*leaf_count', 0, '2025-12-17 09:12:25'),
(301, 24, 'consumable', 'SILICONE', 'Keo silicone', 3.600, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*0.5', 0, '2025-12-17 09:12:25'),
(302, 25, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:12:53'),
(303, 25, 'aluminum', 'XF55_KB_DUNG', 'Khung bao đứng XF55', 1.000, 'pcs', 2400, '90-90', 1.200, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:12:53'),
(304, 25, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:53'),
(305, 25, 'aluminum', 'XF55_KB_NGANG', 'Khung bao ngang XF55', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:53'),
(306, 25, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-17 09:12:53'),
(307, 25, 'aluminum', 'XF55_CD_DUNG', 'Cánh đứng XF55', 1.000, 'pcs', 2303, '90-90', 1.151, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-97', 0, '2025-12-17 09:12:53'),
(308, 25, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-17 09:12:53'),
(309, 25, 'aluminum', 'XF55_CD_NGANG', 'Cánh ngang XF55', 1.000, 'pcs', 1153, '90-90', 0.577, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, '(W/leaf_count)-47', 0, '2025-12-17 09:12:53'),
(310, 25, 'aluminum', 'XF55_KB100', 'Khung bao ngang trên', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:53'),
(311, 25, 'aluminum', 'XF55_KB100', 'Khung bao ngang dưới', 1.000, 'pcs', 1200, '90-90', 0.600, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:12:53'),
(312, 25, 'aluminum', 'XF55_KB100', 'Khung bao XF55', 1.000, 'pcs', 2345, '90-90', 1.173, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H-55', 0, '2025-12-17 09:12:53'),
(313, 25, 'aluminum', 'XF55_KB100', 'Khung bao XF55', 1.000, 'pcs', 2345, '90-90', 1.173, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H-55', 0, '2025-12-17 09:12:53'),
(314, 25, 'aluminum', 'XF55_CANH', 'Cánh ngang trên', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_top', NULL, NULL, NULL, NULL, 'W/leaf_count-50', 0, '2025-12-17 09:12:53'),
(315, 25, 'aluminum', 'XF55_CANH', 'Cánh ngang dưới', 1.000, 'pcs', 1150, '90-90', 0.575, NULL, NULL, NULL, 'sash_bottom', NULL, NULL, NULL, NULL, 'W/leaf_count-50', 0, '2025-12-17 09:12:53'),
(316, 25, 'aluminum', 'XF55_CANH', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_left', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-17 09:12:53'),
(317, 25, 'aluminum', 'XF55_CANH', 'Cánh đứng', 1.000, 'pcs', 2300, '90-90', 1.150, NULL, NULL, NULL, 'sash_right', NULL, NULL, NULL, NULL, 'H-100', 0, '2025-12-17 09:12:53'),
(318, 25, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 1115, 2240, 2.497600, 'sash', NULL, NULL, NULL, NULL, '(W/leaf_count-80)*(H-150)', 0, '2025-12-17 09:12:53'),
(319, 25, 'hardware', 'HINGE_3D', 'Bản lề 3D', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3*leaf_count', 0, '2025-12-17 09:12:53'),
(320, 25, 'hardware', 'LOCK_MULTIPOINT', 'Khóa đa điểm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', 0, '2025-12-17 09:12:53'),
(321, 25, 'hardware', 'HANDLE', 'Tay nắm', 1.000, 'set', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 09:12:53'),
(322, 25, 'hardware', 'HINGE', 'Bản lề', 3.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count*3', 0, '2025-12-17 09:12:53'),
(323, 25, 'hardware', 'LOCK', 'Khóa cửa', 1.000, 'pcs', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leaf_count', 0, '2025-12-17 09:12:53'),
(324, 25, 'consumable', 'GASKET_FRAME', 'Gioăng khung', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 09:12:53'),
(325, 25, 'consumable', 'SEALANT', 'Keo silicone', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 09:12:53'),
(326, 25, 'consumable', 'GASKET_SASH', 'Gioăng cánh', 7.200, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*leaf_count', 0, '2025-12-17 09:12:53'),
(327, 25, 'consumable', 'SILICONE', 'Keo silicone', 3.600, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*0.5', 0, '2025-12-17 09:12:53'),
(328, 26, 'aluminum', 'AL_FRAME_LEFT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_left', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:39:12'),
(329, 26, 'aluminum', 'AL_FRAME_RIGHT', 'Khung đứng', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'frame_right', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:39:12'),
(330, 26, 'aluminum', 'AL_FRAME_TOP', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:39:12'),
(331, 26, 'aluminum', 'AL_FRAME_BOTTOM', 'Khung ngang', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:39:12'),
(332, 26, 'aluminum', 'VK_DUNG', 'Đố giữa', 1.000, 'pcs', 2000, '90-90', 1.000, NULL, NULL, NULL, 'mullion', NULL, NULL, NULL, NULL, 'H', 0, '2025-12-17 09:39:12'),
(333, 26, 'aluminum', 'VK_NGANG', 'Thanh ngang trên', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_top', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:39:12'),
(334, 26, 'aluminum', 'VK_NGANG', 'Thanh ngang dưới', 1.000, 'pcs', 1000, '90-90', 0.500, NULL, NULL, NULL, 'frame_bottom', NULL, NULL, NULL, NULL, 'W', 0, '2025-12-17 09:39:12'),
(335, 26, 'glass', 'TEMPERED_8', 'Kính cường lực 8mm', 1.000, 'pcs', NULL, NULL, NULL, 920, 1850, 1.702000, 'sash', NULL, NULL, NULL, NULL, '(W-100)*(H-100)', 0, '2025-12-17 09:39:12'),
(336, 26, 'consumable', 'U_CHANNEL', 'Thanh U', 6.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter', 0, '2025-12-17 09:39:12'),
(337, 26, 'consumable', 'SILICONE_STRUCT', 'Keo kết cấu', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 09:39:12'),
(338, 26, 'consumable', 'GASKET_VK', 'Gioăng vách', 12.000, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'perimeter*2', 0, '2025-12-17 09:39:12');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_bom_versions`
--

CREATE TABLE `item_bom_versions` (
  `id` bigint(20) NOT NULL,
  `project_item_id` bigint(20) NOT NULL,
  `source_item_version_id` bigint(20) NOT NULL,
  `bom_version_number` int(11) NOT NULL DEFAULT 1,
  `status` enum('draft','confirmed','exported') DEFAULT 'draft',
  `generated_at` datetime DEFAULT current_timestamp(),
  `generated_by` varchar(100) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by` varchar(100) DEFAULT NULL,
  `total_aluminum_kg` decimal(12,3) DEFAULT NULL,
  `total_glass_m2` decimal(12,3) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_bom_versions`
--

INSERT INTO `item_bom_versions` (`id`, `project_item_id`, `source_item_version_id`, `bom_version_number`, `status`, `generated_at`, `generated_by`, `confirmed_at`, `confirmed_by`, `total_aluminum_kg`, `total_glass_m2`, `total_cost`) VALUES
(1, 15, 15, 1, 'draft', '2025-12-16 22:43:07', NULL, NULL, NULL, 0.000, 0.000, 0.00),
(2, 13, 13, 1, 'draft', '2025-12-16 22:43:36', NULL, NULL, NULL, 0.000, 0.000, 0.00),
(3, 13, 13, 2, 'draft', '2025-12-16 22:44:01', NULL, NULL, NULL, 0.000, 0.000, 0.00),
(4, 13, 13, 3, 'draft', '2025-12-16 22:45:43', NULL, NULL, NULL, 0.000, 2.520, 1310400.00),
(5, 13, 13, 4, 'draft', '2025-12-16 22:46:44', NULL, NULL, NULL, 7.056, 2.738, 3024800.00),
(6, 12, 12, 1, 'draft', '2025-12-16 23:18:04', NULL, NULL, NULL, 5.880, 1.702, 1954240.00),
(7, 1, 1, 1, 'draft', '2025-12-16 23:18:34', NULL, NULL, NULL, 7.050, 2.520, 2910900.00),
(8, 12, 12, 2, 'draft', '2025-12-16 23:29:31', NULL, NULL, NULL, 5.880, 1.702, 1954240.00),
(9, 11, 11, 1, 'draft', '2025-12-16 23:31:49', NULL, NULL, NULL, 5.000, 1.702, 1635040.00),
(10, 12, 12, 3, 'draft', '2025-12-16 23:32:49', NULL, NULL, NULL, 8.840, 1.702, 2550640.00),
(11, 11, 11, 2, 'draft', '2025-12-16 23:33:53', NULL, NULL, NULL, 5.000, 1.702, 1635040.00),
(12, 15, 15, 2, 'draft', '2025-12-16 23:33:59', NULL, NULL, NULL, 4.000, 1.702, 22145040.00),
(13, 16, 16, 1, 'draft', '2025-12-16 23:34:07', NULL, NULL, NULL, 10.040, 2.296, 2983520.00),
(14, 14, 14, 1, 'draft', '2025-12-16 23:34:36', NULL, NULL, NULL, 8.840, 1.702, 2550640.00),
(15, 13, 13, 5, 'draft', '2025-12-16 23:34:38', NULL, NULL, NULL, 14.052, 2.498, 4165640.00),
(16, 14, 14, 2, 'draft', '2025-12-16 23:38:37', NULL, NULL, NULL, 8.840, 1.702, 2550640.00),
(17, 14, 14, 3, 'draft', '2025-12-17 08:14:48', NULL, NULL, NULL, 8.840, 1.702, 2550640.00),
(18, 11, 11, 3, 'draft', '2025-12-17 08:19:00', NULL, NULL, NULL, 5.000, 1.702, 1635040.00),
(19, 11, 11, 4, 'draft', '2025-12-17 08:43:57', NULL, NULL, NULL, 5.000, 1.702, 1635040.00),
(20, 11, 11, 5, 'draft', '2025-12-17 08:44:07', NULL, NULL, NULL, 5.000, 1.702, 1635040.00),
(21, 17, 17, 1, 'draft', '2025-12-17 08:51:07', NULL, NULL, NULL, 10.040, 2.296, 2983520.00),
(22, 12, 12, 4, 'draft', '2025-12-17 09:02:05', NULL, NULL, NULL, 8.840, 1.702, 2550640.00),
(23, 11, 11, 6, 'draft', '2025-12-17 09:02:41', NULL, NULL, NULL, 5.000, 1.702, 1635040.00),
(24, 13, 13, 6, 'draft', '2025-12-17 09:12:25', NULL, NULL, NULL, 14.052, 2.498, 4165640.00),
(25, 13, 13, 7, 'draft', '2025-12-17 09:12:53', NULL, NULL, NULL, 14.052, 2.498, 4165640.00),
(26, 11, 11, 7, 'draft', '2025-12-17 09:39:12', NULL, NULL, NULL, 5.000, 1.702, 1635040.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_config`
--

CREATE TABLE `item_config` (
  `id` bigint(20) NOT NULL,
  `item_version_id` bigint(20) NOT NULL,
  `width_mm` int(11) DEFAULT NULL,
  `height_mm` int(11) DEFAULT NULL,
  `depth_mm` int(11) DEFAULT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `slope_deg` decimal(5,2) DEFAULT NULL,
  `leaf_count` int(11) DEFAULT NULL,
  `open_direction` enum('left','right','both') DEFAULT NULL,
  `open_style` enum('swing_in','swing_out','sliding','fixed','tilt_turn') DEFAULT NULL,
  `span_count` int(11) DEFAULT NULL,
  `post_spacing_mm` int(11) DEFAULT NULL,
  `handrail_height_mm` int(11) DEFAULT NULL,
  `rafter_count` int(11) DEFAULT NULL,
  `aluminum_system` varchar(50) DEFAULT NULL,
  `default_glass_type` varchar(50) DEFAULT NULL,
  `extra_params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extra_params`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_config`
--

INSERT INTO `item_config` (`id`, `item_version_id`, `width_mm`, `height_mm`, `depth_mm`, `length_mm`, `slope_deg`, `leaf_count`, `open_direction`, `open_style`, `span_count`, `post_spacing_mm`, `handrail_height_mm`, `rafter_count`, `aluminum_system`, `default_glass_type`, `extra_params`, `created_at`) VALUES
(1, 1, 1200, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-002', NULL, NULL, '2025-11-27 15:06:44'),
(2, 2, 1800, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-11-27 17:00:04'),
(3, 3, 1200, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-12-08 14:52:40'),
(4, 4, 800, 1200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-12-08 17:25:42'),
(5, 5, 1200, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-12-11 10:54:13'),
(6, 6, 1800, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-12-11 11:22:10'),
(7, 7, 1800, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-12-11 13:26:49'),
(8, 8, 1200, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'VW-W-004', NULL, NULL, '2025-12-11 13:37:07'),
(9, 9, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-13 14:29:29'),
(10, 10, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-14 23:21:47'),
(11, 11, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-14 23:22:00'),
(12, 12, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-15 11:56:58'),
(13, 13, 1200, 2400, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XINGFA_55', NULL, NULL, '2025-12-15 13:05:31'),
(14, 14, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-15 22:36:53'),
(15, 15, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-15 22:37:25'),
(16, 16, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(17, 17, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(18, 18, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(19, 19, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(20, 20, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(21, 21, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(22, 22, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(23, 23, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(24, 24, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(25, 25, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(26, 26, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(27, 27, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(28, 28, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(29, 29, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(30, 30, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(31, 31, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(32, 32, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(33, 33, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(34, 34, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(35, 35, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(36, 36, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(37, 37, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(38, 38, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(39, 39, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(40, 40, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(41, 41, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(42, 42, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(43, 43, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(44, 44, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(45, 45, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(46, 46, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(47, 47, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(48, 48, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(49, 49, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(50, 50, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(51, 51, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(52, 52, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(53, 53, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(54, 54, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(55, 55, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(56, 56, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(57, 57, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(58, 58, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(59, 59, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(60, 60, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(61, 61, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(62, 62, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(63, 63, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(64, 64, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(65, 65, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:02:30'),
(66, 66, 1000, 2000, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:03:05'),
(67, 67, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(68, 68, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(69, 69, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(70, 70, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(71, 71, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(72, 72, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(73, 73, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(74, 74, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(75, 75, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(76, 76, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(77, 77, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(78, 78, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(79, 79, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(80, 80, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(81, 81, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(82, 82, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(83, 83, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(84, 84, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(85, 85, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(86, 86, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(87, 87, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(88, 88, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(89, 89, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(90, 90, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(91, 91, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(92, 92, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(93, 93, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(94, 94, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(95, 95, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(96, 96, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(97, 97, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(98, 98, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(99, 99, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(100, 100, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(101, 101, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(102, 102, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'sliding', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(103, 103, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(104, 104, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(105, 105, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(106, 106, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(107, 107, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(108, 108, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(109, 109, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(110, 110, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(111, 111, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(112, 112, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'fixed', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(113, 113, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(114, 114, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(115, 115, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52'),
(116, 116, 1200, 2200, NULL, NULL, NULL, 1, NULL, 'swing_out', NULL, NULL, NULL, NULL, 'XF-001', NULL, NULL, '2025-12-16 19:07:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_structure_aluminum`
--

CREATE TABLE `item_structure_aluminum` (
  `id` bigint(20) NOT NULL,
  `item_version_id` bigint(20) NOT NULL,
  `profile_code` varchar(50) NOT NULL,
  `profile_name` varchar(255) DEFAULT NULL,
  `position` enum('frame_top','frame_bottom','frame_left','frame_right','sash_top','sash_bottom','sash_left','sash_right','mullion','transom','post','rail','handrail','infill_frame','rafter','purlin','ridge','other') NOT NULL,
  `direction` enum('horizontal','vertical','inclined') NOT NULL,
  `length_formula` varchar(100) DEFAULT NULL,
  `cut_angle` varchar(20) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_structure_consumables`
--

CREATE TABLE `item_structure_consumables` (
  `id` bigint(20) NOT NULL,
  `item_version_id` bigint(20) NOT NULL,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(255) DEFAULT NULL,
  `unit` enum('m','pcs','kg','tube','roll') DEFAULT 'm',
  `quantity_formula` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_structure_glass`
--

CREATE TABLE `item_structure_glass` (
  `id` bigint(20) NOT NULL,
  `item_version_id` bigint(20) NOT NULL,
  `glass_type_code` varchar(50) NOT NULL,
  `glass_type_name` varchar(255) DEFAULT NULL,
  `position` enum('sash','fixed','panel','roof','railing') NOT NULL,
  `width_formula` varchar(100) DEFAULT NULL,
  `height_formula` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_structure_hardware`
--

CREATE TABLE `item_structure_hardware` (
  `id` bigint(20) NOT NULL,
  `item_version_id` bigint(20) NOT NULL,
  `hardware_code` varchar(50) NOT NULL,
  `hardware_name` varchar(255) DEFAULT NULL,
  `quantity_formula` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_type_rules`
--

CREATE TABLE `item_type_rules` (
  `id` bigint(20) NOT NULL,
  `item_type` enum('door','window','railing','glass_partition','glass_roof','stair') NOT NULL,
  `rule_category` enum('structure','bom','pricing') NOT NULL,
  `rule_code` varchar(50) NOT NULL,
  `rule_name` varchar(255) NOT NULL,
  `formula` text DEFAULT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `priority` int(11) DEFAULT 0,
  `is_active` tinyint(4) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_type_rules`
--

INSERT INTO `item_type_rules` (`id`, `item_type`, `rule_category`, `rule_code`, `rule_name`, `formula`, `parameters`, `priority`, `is_active`, `sort_order`) VALUES
(1, 'door', 'structure', 'FRAME_VERTICAL', 'Khung bao đứng', 'H', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\"}', 1, 1, 1),
(2, 'door', 'structure', 'FRAME_HORIZONTAL', 'Khung bao ngang', 'W', '{\"position\":\"frame_top,frame_bottom\",\"direction\":\"horizontal\"}', 1, 1, 2),
(3, 'door', 'structure', 'SASH_VERTICAL', 'Cánh đứng', 'H-100', '{\"position\":\"sash_left,sash_right\",\"direction\":\"vertical\",\"per_leaf\":true}', 1, 1, 3),
(4, 'door', 'structure', 'SASH_HORIZONTAL', 'Cánh ngang', '(W/leaf_count)-50', '{\"position\":\"sash_top,sash_bottom\",\"direction\":\"horizontal\",\"per_leaf\":true}', 1, 1, 4),
(5, 'door', 'bom', 'GLASS_MAIN', 'Kính cánh', '(W/leaf_count-80)*(H-150)', '{\"position\":\"sash\"}', 1, 1, 1),
(6, 'door', 'bom', 'HINGE_3D', 'Bản lề 3D', '3*leaf_count', '{\"unit\":\"pcs\"}', 1, 1, 1),
(7, 'door', 'bom', 'LOCK_MULTIPOINT', 'Khóa đa điểm', '1', '{\"unit\":\"set\"}', 1, 1, 2),
(8, 'door', 'bom', 'HANDLE', 'Tay nắm', 'leaf_count', '{\"unit\":\"set\"}', 1, 1, 3),
(9, 'door', 'bom', 'GASKET_FRAME', 'Gioăng khung', 'perimeter', '{\"unit\":\"m\"}', 1, 1, 4),
(10, 'door', 'bom', 'SEALANT', 'Keo silicone', 'perimeter', '{\"unit\":\"m\"}', 1, 1, 5),
(11, 'window', 'structure', 'FRAME_VERTICAL', 'Khung bao đứng', 'H', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\"}', 1, 1, 1),
(12, 'window', 'structure', 'FRAME_HORIZONTAL', 'Khung bao ngang', 'W', '{\"position\":\"frame_top,frame_bottom\",\"direction\":\"horizontal\"}', 1, 1, 2),
(13, 'window', 'structure', 'SASH_VERTICAL', 'Cánh đứng', 'H-80', '{\"position\":\"sash_left,sash_right\",\"direction\":\"vertical\",\"per_leaf\":true}', 1, 1, 3),
(14, 'window', 'structure', 'SASH_HORIZONTAL', 'Cánh ngang', 'W/leaf_count-40', '{\"position\":\"sash_top,sash_bottom\",\"direction\":\"horizontal\",\"per_leaf\":true}', 1, 1, 4),
(15, 'window', 'bom', 'GLASS_MAIN', 'Kính cánh', '(W/leaf_count-60)*(H-120)', '{\"position\":\"sash\"}', 1, 1, 1),
(16, 'window', 'bom', 'HINGE_WINDOW', 'Bản lề cửa sổ', '2*leaf_count', '{\"unit\":\"pcs\"}', 1, 1, 1),
(17, 'window', 'bom', 'STAY_ARM', 'Chốt gió', 'leaf_count*2', '{\"unit\":\"pcs\"}', 1, 1, 2),
(18, 'window', 'bom', 'GASKET', 'Gioăng', 'perimeter*2', '{\"unit\":\"m\"}', 1, 1, 3),
(19, 'railing', 'structure', 'POST', 'Trụ đứng', 'H', '{\"position\":\"post\",\"direction\":\"vertical\"}', 1, 1, 1),
(20, 'railing', 'structure', 'HANDRAIL', 'Tay vịn', 'L', '{\"position\":\"handrail\",\"direction\":\"horizontal\",\"profile_code\":\"LC_TAY_VIN\"}', 1, 1, 2),
(21, 'railing', 'structure', 'RAIL_TOP', 'Thanh ray trên', 'L', '{\"position\":\"rail\",\"direction\":\"horizontal\"}', 1, 1, 3),
(22, 'railing', 'structure', 'RAIL_BOTTOM', 'Thanh ray dưới', 'L', '{\"position\":\"rail\",\"direction\":\"horizontal\"}', 1, 1, 4),
(23, 'railing', 'bom', 'GLASS_PANEL', 'Kính lan can', 'L*handrail_height/1000000', '{\"unit\":\"m2\",\"position\":\"railing\"}', 1, 1, 1),
(24, 'railing', 'bom', 'POST_CAP', 'Nắp trụ', 'span_count+1', '{\"unit\":\"pcs\"}', 1, 1, 1),
(25, 'railing', 'bom', 'GLASS_CLAMP', 'Kẹp kính', '(span_count+1)*4', '{\"unit\":\"pcs\"}', 1, 1, 2),
(26, 'glass_partition', 'structure', 'FRAME_VERTICAL', 'Khung đứng', 'H', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\"}', 1, 1, 1),
(27, 'glass_partition', 'structure', 'FRAME_HORIZONTAL', 'Khung ngang', 'W', '{\"position\":\"frame_top,frame_bottom\",\"direction\":\"horizontal\"}', 1, 1, 2),
(28, 'glass_partition', 'structure', 'MULLION', 'Đố giữa', 'H', '{\"position\":\"mullion\",\"direction\":\"vertical\",\"qty_formula\":\"span_count-1\",\"profile_code\":\"VK_DUNG\"}', 1, 1, 3),
(29, 'glass_partition', 'bom', 'GLASS_FIXED', 'Kính fix', '(W-100)*(H-100)', '{\"position\":\"fixed\"}', 1, 1, 1),
(30, 'glass_partition', 'bom', 'U_CHANNEL', 'Thanh U', 'perimeter', '{\"unit\":\"m\"}', 1, 1, 1),
(31, 'glass_roof', 'structure', 'RAFTER', 'Xà dọc', 'L/cos(slope*3.14159/180)', '{\"position\":\"rafter\",\"direction\":\"inclined\",\"qty_formula\":\"rafter_count\",\"profile_code\":\"MK_XA_NGANG\"}', 1, 1, 1),
(32, 'glass_roof', 'structure', 'PURLIN', 'Xà ngang', 'W', '{\"position\":\"purlin\",\"direction\":\"horizontal\",\"profile_code\":\"MK_XA_GO\"}', 1, 1, 2),
(33, 'glass_roof', 'bom', 'GLASS_ROOF', 'Kính mái', 'W*L/1000000', '{\"unit\":\"m2\",\"position\":\"roof\"}', 1, 1, 1),
(34, 'glass_roof', 'bom', 'WEATHER_SEAL', 'Gioăng chống nước', '2*(W+L)', '{\"unit\":\"m\"}', 1, 1, 1),
(35, 'glass_roof', 'bom', 'GLASS_CLIP', 'Kẹp kính mái', '(W*L)/500', '{\"unit\":\"pcs\"}', 1, 1, 2),
(36, 'stair', 'structure', 'STRINGER', 'Thanh dầm', 'L/cos(slope*3.14159/180)', '{\"position\":\"rail\",\"direction\":\"inclined\",\"profile_code\":\"CT_DO\"}', 1, 1, 1),
(37, 'stair', 'structure', 'HANDRAIL', 'Tay vịn', 'L', '{\"position\":\"handrail\",\"direction\":\"inclined\",\"profile_code\":\"CT_TAY_VIN\"}', 1, 1, 2),
(38, 'stair', 'bom', 'GLASS_BALUSTRADE', 'Kính lan can cầu thang', 'sqrt(H^2+L^2)*handrail_height', '{\"position\":\"railing\"}', 1, 1, 1),
(39, 'stair', 'bom', 'STANDOFF', 'Chân đế inox', 'sqrt(H^2+L^2)/200', '{\"unit\":\"pcs\"}', 1, 1, 1),
(40, 'door', 'structure', 'FRAME_TOP', 'Khung bao ngang trên', 'W', '{\"position\":\"frame_top\",\"direction\":\"horizontal\",\"profile_code\":\"XF55_KB100\"}', 0, 1, 1),
(41, 'door', 'structure', 'FRAME_BOTTOM', 'Khung bao ngang dưới', 'W', '{\"position\":\"frame_bottom\",\"direction\":\"horizontal\",\"profile_code\":\"XF55_KB100\"}', 0, 1, 2),
(42, 'door', 'structure', 'FRAME_SIDES', 'Khung bao đứng', 'H-50', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\",\"profile_code\":\"XF55_KB100\"}', 0, 1, 3),
(43, 'door', 'structure', 'SASH_TOP', 'Cánh ngang trên', 'W/leaf_count-50', '{\"position\":\"sash_top\",\"direction\":\"horizontal\",\"per_leaf\":true,\"profile_code\":\"XF55_CANH\"}', 0, 1, 4),
(44, 'door', 'structure', 'SASH_BOTTOM', 'Cánh ngang dưới', 'W/leaf_count-50', '{\"position\":\"sash_bottom\",\"direction\":\"horizontal\",\"per_leaf\":true,\"profile_code\":\"XF55_CANH\"}', 0, 1, 5),
(45, 'door', 'structure', 'SASH_SIDES', 'Cánh đứng', 'H-100', '{\"position\":\"sash_left,sash_right\",\"direction\":\"vertical\",\"per_leaf\":true,\"profile_code\":\"XF55_CANH\"}', 0, 1, 6),
(46, 'door', 'bom', 'GLASS_PANEL', 'Kính cánh', '(W/leaf_count-80)*(H-150)/1000000', '{\"unit\":\"m2\",\"position\":\"sash\",\"width_deduct\":80,\"height_deduct\":150}', 0, 1, 1),
(47, 'door', 'bom', 'HINGE', 'Bản lề', 'leaf_count*3', '{\"unit\":\"pcs\"}', 0, 1, 2),
(48, 'door', 'bom', 'LOCK', 'Khóa cửa', 'leaf_count', '{\"unit\":\"pcs\"}', 0, 1, 3),
(49, 'door', 'bom', 'GASKET_SASH', 'Gioăng cánh', 'perimeter*leaf_count', '{\"unit\":\"m\"}', 0, 1, 6),
(50, 'door', 'bom', 'SILICONE', 'Keo silicone', 'perimeter*0.5', '{\"unit\":\"m\"}', 0, 1, 7),
(53, 'window', 'structure', 'FRAME_TOP', 'Khung bao ngang trên', 'W', '{\"position\":\"frame_top\",\"direction\":\"horizontal\",\"profile_code\":\"XF55_KB65\"}', 0, 1, 1),
(54, 'window', 'structure', 'FRAME_BOTTOM', 'Khung bao ngang dưới', 'W', '{\"position\":\"frame_bottom\",\"direction\":\"horizontal\",\"profile_code\":\"XF55_KB65\"}', 0, 1, 2),
(55, 'window', 'structure', 'FRAME_SIDES', 'Khung bao đứng', 'H-40', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\",\"profile_code\":\"XF55_KB65\"}', 0, 1, 3),
(56, 'window', 'bom', 'GLASS_PANEL', 'Kính cánh', '(W/leaf_count-60)*(H-100)/1000000', '{\"unit\":\"m2\",\"position\":\"sash\",\"width_deduct\":60,\"height_deduct\":100}', 0, 1, 1),
(57, 'window', 'bom', 'LOCK_WINDOW', 'Khóa cửa sổ', 'leaf_count', '{\"unit\":\"pcs\"}', 0, 1, 3),
(62, 'railing', 'structure', 'TOP_RAIL', 'Thanh ngang trên', 'L', '{\"position\":\"rail\",\"direction\":\"horizontal\",\"profile_code\":\"LC_NGANG\"}', 0, 1, 2),
(63, 'railing', 'structure', 'BOTTOM_RAIL', 'Thanh ngang dưới', 'L', '{\"position\":\"rail\",\"direction\":\"horizontal\",\"profile_code\":\"LC_NGANG\"}', 0, 1, 3),
(64, 'railing', 'structure', 'POSTS', 'Trụ đứng', 'handrail_height', '{\"position\":\"post\",\"direction\":\"vertical\",\"qty_formula\":\"span_count+1\",\"profile_code\":\"LC_TRU\"}', 0, 1, 4),
(65, 'railing', 'bom', 'STANDOFF', 'Chân đế', '(span_count+1)*2', '{\"unit\":\"pcs\"}', 0, 1, 4),
(66, 'railing', 'bom', 'GASKET_RAIL', 'Gioăng lan can', 'L*2', '{\"unit\":\"m\"}', 0, 1, 5),
(71, 'glass_partition', 'structure', 'FRAME_TOP', 'Thanh ngang trên', 'W', '{\"position\":\"frame_top\",\"direction\":\"horizontal\",\"profile_code\":\"VK_NGANG\"}', 0, 1, 1),
(72, 'glass_partition', 'structure', 'FRAME_BOTTOM', 'Thanh ngang dưới', 'W', '{\"position\":\"frame_bottom\",\"direction\":\"horizontal\",\"profile_code\":\"VK_NGANG\"}', 0, 1, 2),
(73, 'glass_partition', 'bom', 'GLASS_PANEL', 'Kính vách', 'W*H/1000000', '{\"unit\":\"m2\",\"position\":\"panel\"}', 0, 1, 1),
(74, 'glass_partition', 'bom', 'SILICONE_STRUCT', 'Keo kết cấu', 'perimeter*2', '{\"unit\":\"m\"}', 0, 1, 2),
(75, 'glass_partition', 'bom', 'GASKET_VK', 'Gioăng vách', 'perimeter*2', '{\"unit\":\"m\"}', 0, 1, 3),
(77, 'glass_roof', 'bom', 'SILICONE_WEATHER', 'Keo chống thấm', 'perimeter*3', '{\"unit\":\"m\"}', 0, 1, 2),
(78, 'glass_roof', 'bom', 'GASKET_ROOF', 'Gioăng mái', '(W+L)*2', '{\"unit\":\"m\"}', 0, 1, 3),
(82, 'stair', 'bom', 'GLASS_STAIR', 'Kính cầu thang', 'L*handrail_height/1000000', '{\"unit\":\"m2\",\"position\":\"railing\"}', 0, 1, 1),
(83, 'stair', 'bom', 'BRACKET', 'Giá đỡ', 'L/500', '{\"unit\":\"pcs\"}', 0, 1, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_type_system_rules`
--

CREATE TABLE `item_type_system_rules` (
  `id` bigint(20) NOT NULL,
  `item_type` enum('door','window','railing','glass_partition','glass_roof','stair') NOT NULL,
  `aluminum_system` varchar(50) NOT NULL,
  `rule_category` enum('structure','bom','pricing') NOT NULL,
  `rule_code` varchar(50) NOT NULL,
  `rule_name` varchar(255) NOT NULL,
  `formula` text DEFAULT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `priority` int(11) DEFAULT 10,
  `is_active` tinyint(4) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_type_system_rules`
--

INSERT INTO `item_type_system_rules` (`id`, `item_type`, `aluminum_system`, `rule_category`, `rule_code`, `rule_name`, `formula`, `parameters`, `priority`, `is_active`, `sort_order`) VALUES
(1, 'door', 'XINGFA_55', 'structure', 'FRAME_VERTICAL', 'Khung bao đứng XF55', 'H', '{\"profile_code\":\"XF55_KB_DUNG\",\"position\":\"frame_left,frame_right\"}', 10, 1, 1),
(2, 'door', 'XINGFA_55', 'structure', 'FRAME_HORIZONTAL', 'Khung bao ngang XF55', 'W', '{\"profile_code\":\"XF55_KB_NGANG\",\"position\":\"frame_top,frame_bottom\"}', 10, 1, 2),
(3, 'door', 'XINGFA_55', 'structure', 'SASH_VERTICAL', 'Cánh đứng XF55', 'H-97', '{\"profile_code\":\"XF55_CD_DUNG\",\"position\":\"sash_left,sash_right\"}', 10, 1, 3),
(4, 'door', 'XINGFA_55', 'structure', 'SASH_HORIZONTAL', 'Cánh ngang XF55', '(W/leaf_count)-47', '{\"profile_code\":\"XF55_CD_NGANG\",\"position\":\"sash_top,sash_bottom\"}', 10, 1, 4),
(5, 'door', 'XINGFA_55', 'bom', 'GLASS_DEDUCTION', 'Giảm trừ kính XF55', '1', '{\"width_deduct\":85,\"height_deduct\":160}', 10, 1, 1),
(6, 'door', 'XINGFA_93', 'structure', 'FRAME_VERTICAL', 'Khung bao đứng XF93', 'H', '{\"profile_code\":\"XF93_KB_DUNG\",\"position\":\"frame_left,frame_right\"}', 10, 1, 1),
(7, 'door', 'XINGFA_93', 'structure', 'FRAME_HORIZONTAL', 'Khung bao ngang XF93', 'W', '{\"profile_code\":\"XF93_KB_NGANG\",\"position\":\"frame_top,frame_bottom\"}', 10, 1, 2),
(8, 'door', 'XINGFA_93', 'structure', 'SASH_VERTICAL', 'Cánh đứng XF93', 'H-105', '{\"profile_code\":\"XF93_CD_DUNG\",\"position\":\"sash_left,sash_right\"}', 10, 1, 3),
(9, 'door', 'XINGFA_93', 'structure', 'SASH_HORIZONTAL', 'Cánh ngang XF93', '(W/leaf_count)-55', '{\"profile_code\":\"XF93_CD_NGANG\",\"position\":\"sash_top,sash_bottom\"}', 10, 1, 4),
(10, 'door', 'XINGFA_93', 'bom', 'GLASS_DEDUCTION', 'Giảm trừ kính XF93', '1', '{\"width_deduct\":120,\"height_deduct\":200}', 10, 1, 1),
(11, 'door', 'XINGFA_93', 'bom', 'ROLLER', 'Bánh xe cửa lùa', '2*leaf_count', '{\"unit\":\"pcs\"}', 10, 1, 2),
(12, 'door', 'PMA', 'structure', 'FRAME_VERTICAL', 'Khung bao đứng PMA', 'H', '{\"profile_code\":\"PMA_KB_DUNG\",\"position\":\"frame_left,frame_right\"}', 10, 1, 1),
(13, 'door', 'PMA', 'structure', 'SASH_VERTICAL', 'Cánh đứng PMA', 'H-95', '{\"profile_code\":\"PMA_CD_DUNG\",\"position\":\"sash_left,sash_right\"}', 10, 1, 3),
(14, 'door', 'PMA', 'bom', 'GLASS_DEDUCTION', 'Giảm trừ kính PMA', '1', '{\"width_deduct\":70,\"height_deduct\":140}', 10, 1, 1),
(15, 'door', 'XINGFA_55', 'structure', 'FRAME_SIDES', 'Khung bao XF55', 'H-55', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\",\"profile_code\":\"XF55_KB100\",\"weight_per_m\":0.98}', 10, 1, 1),
(16, 'window', 'XINGFA_55', 'structure', 'FRAME_SIDES', 'Khung bao XF55', 'H-45', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\",\"profile_code\":\"XF55_KB65\",\"weight_per_m\":0.65}', 10, 1, 1),
(18, 'door', 'XINGFA_93', 'structure', 'FRAME_SIDES', 'Khung bao XF93', 'H-93', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\",\"profile_code\":\"XF93_KB140\",\"weight_per_m\":1.45}', 10, 1, 1),
(20, 'door', 'PMA', 'structure', 'FRAME_SIDES', 'Khung bao PMA', 'H-50', '{\"position\":\"frame_left,frame_right\",\"direction\":\"vertical\",\"profile_code\":\"PMA_KB65\",\"weight_per_m\":0.72}', 10, 1, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_versions`
--

CREATE TABLE `item_versions` (
  `id` bigint(20) NOT NULL,
  `project_item_id` bigint(20) NOT NULL,
  `version_number` int(11) NOT NULL DEFAULT 1,
  `status` enum('draft','confirmed','locked') DEFAULT 'draft',
  `description` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_versions`
--

INSERT INTO `item_versions` (`id`, `project_item_id`, `version_number`, `status`, `description`, `created_by`, `confirmed_at`, `confirmed_by`, `created_at`) VALUES
(1, 1, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-11-27 15:06:44'),
(2, 2, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-11-27 17:00:04'),
(3, 3, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-08 14:52:40'),
(4, 4, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-08 17:25:42'),
(5, 5, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-11 10:54:13'),
(6, 6, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-11 11:22:10'),
(7, 7, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-11 13:26:49'),
(8, 8, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-11 13:37:07'),
(9, 9, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-13 14:29:29'),
(10, 10, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-14 23:21:47'),
(11, 11, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-14 23:22:00'),
(12, 12, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-15 11:56:58'),
(13, 13, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-15 13:05:31'),
(14, 14, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-15 22:36:53'),
(15, 15, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-15 22:37:25'),
(16, 16, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(17, 17, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(18, 18, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(19, 19, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(20, 20, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(21, 21, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(22, 22, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(23, 23, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(24, 24, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(25, 25, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(26, 26, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(27, 27, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(28, 28, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(29, 29, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(30, 30, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(31, 31, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(32, 32, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(33, 33, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(34, 34, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(35, 35, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(36, 36, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(37, 37, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(38, 38, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(39, 39, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(40, 40, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(41, 41, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(42, 42, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(43, 43, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(44, 44, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(45, 45, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(46, 46, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(47, 47, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(48, 48, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(49, 49, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(50, 50, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(51, 51, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(52, 52, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(53, 53, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(54, 54, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(55, 55, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(56, 56, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(57, 57, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(58, 58, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(59, 59, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(60, 60, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(61, 61, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(62, 62, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(63, 63, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(64, 64, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(65, 65, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:02:30'),
(66, 66, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:03:05'),
(67, 67, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(68, 68, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(69, 69, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(70, 70, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(71, 71, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(72, 72, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(73, 73, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(74, 74, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(75, 75, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(76, 76, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(77, 77, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(78, 78, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(79, 79, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(80, 80, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(81, 81, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(82, 82, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(83, 83, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(84, 84, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(85, 85, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(86, 86, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(87, 87, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(88, 88, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(89, 89, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(90, 90, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(91, 91, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(92, 92, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(93, 93, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(94, 94, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(95, 95, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(96, 96, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(97, 97, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(98, 98, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(99, 99, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(100, 100, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(101, 101, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(102, 102, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(103, 103, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(104, 104, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(105, 105, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(106, 106, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(107, 107, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(108, 108, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(109, 109, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(110, 110, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(111, 111, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(112, 112, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(113, 113, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(114, 114, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(115, 115, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52'),
(116, 116, 1, 'confirmed', 'Migration từ door_designs', NULL, NULL, NULL, '2025-12-16 19:07:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `width_mm` int(11) DEFAULT NULL,
  `height_mm` int(11) DEFAULT NULL,
  `thickness_mm` decimal(10,2) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `materials`
--

INSERT INTO `materials` (`id`, `code`, `name`, `type`, `length_mm`, `width_mm`, `height_mm`, `thickness_mm`, `price`, `unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'XFA55-KD', 'Khung đứng Xingfa hệ 55', 'profile', 6000, NULL, NULL, NULL, 185000.00, 'm', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(2, 'XFA55-KN', 'Khung ngang Xingfa hệ 55', 'profile', 6000, NULL, NULL, NULL, 185000.00, 'm', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(3, 'XFA55-ND', 'Nẹp đố Xingfa hệ 55', 'profile', 6000, NULL, NULL, NULL, 160000.00, 'm', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(4, 'XFA55-CD', 'Cánh đứng Xingfa hệ 55', 'profile', 6000, NULL, NULL, NULL, 175000.00, 'm', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(5, 'K-8MM', 'Kính cường lực 8mm', 'glass', NULL, NULL, NULL, NULL, 450000.00, 'm2', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(6, 'K-10MM', 'Kính cường lực 10mm', 'glass', NULL, NULL, NULL, NULL, 550000.00, 'm2', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(7, 'BL-HAFELE', 'Bản lề Hafele', 'accessory', NULL, NULL, NULL, NULL, 55000.00, 'pcs', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(8, 'KHOA-3D', 'Khóa 3 điểm', 'accessory', NULL, NULL, NULL, NULL, 250000.00, 'pcs', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05'),
(9, 'GIOANG-EPDM', 'Gioăng EPDM', 'gasket', NULL, NULL, NULL, NULL, 15000.00, 'm', 1, '2025-12-07 10:47:05', '2025-12-07 10:47:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `reset_code` varchar(6) NOT NULL,
  `reset_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `email`, `reset_code`, `reset_token`, `expires_at`, `used`, `created_at`) VALUES
(1, 2, 'ly@gmail.com', '508930', 'be077bde54cfb5f8d3f582f509f7b47e1f04b40332f60f4afdc7a06d5bfc6847', '2025-12-08 05:58:28', 0, '2025-12-08 05:43:28'),
(2, 2, 'ly@gmail.com', '214048', 'b26c87675a4bb06f63d9a18d83ea5773a1bec9aadb58640942fef3b43b3e563e', '2025-12-08 05:58:39', 0, '2025-12-08 05:43:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `production_orders`
--

CREATE TABLE `production_orders` (
  `id` int(11) NOT NULL,
  `order_code` varchar(50) NOT NULL,
  `project_id` int(11) NOT NULL,
  `quotation_id` int(11) DEFAULT NULL,
  `order_date` date NOT NULL,
  `expected_start_date` date DEFAULT NULL,
  `expected_completion_date` date DEFAULT NULL,
  `actual_start_date` date DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `status` enum('pending','cutting','welding','gluing','accessories','finishing','packaging','completed') DEFAULT 'pending',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `notes` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `total_doors` int(11) DEFAULT 0,
  `completed_doors` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `production_orders`
--

INSERT INTO `production_orders` (`id`, `order_code`, `project_id`, `quotation_id`, `order_date`, `expected_start_date`, `expected_completion_date`, `actual_start_date`, `actual_completion_date`, `status`, `priority`, `notes`, `assigned_to`, `total_doors`, `completed_doors`, `created_at`, `updated_at`) VALUES
(1, 'SX-2025-0001', 4, NULL, '2025-11-27', NULL, NULL, NULL, NULL, 'packaging', 'high', 'Xong trong tháng 12', NULL, 0, 0, '2025-11-27 08:34:02', '2025-11-27 14:18:20'),
(3, 'SX-2025-0003', 3, NULL, '2025-11-27', NULL, NULL, NULL, NULL, '', 'normal', NULL, NULL, 0, 0, '2025-11-27 08:34:23', '2025-12-11 05:11:50'),
(4, 'SX-2025-0004', 7, NULL, '2025-12-11', NULL, NULL, NULL, NULL, 'pending', 'urgent', NULL, NULL, 0, 0, '2025-12-11 06:55:49', '2025-12-11 06:55:49'),
(6, 'SX-2025-0006', 2, NULL, '2025-12-12', NULL, NULL, NULL, NULL, 'pending', 'normal', NULL, NULL, 0, 0, '2025-12-12 08:47:14', '2025-12-12 08:47:14'),
(7, 'SX-2025-0005', 3, NULL, '2025-12-13', NULL, NULL, NULL, NULL, 'pending', 'normal', NULL, NULL, 0, 0, '2025-12-13 15:48:10', '2025-12-13 15:48:10'),
(11, 'SX-2025-0007', 9, 15, '2025-12-14', NULL, NULL, NULL, NULL, 'pending', 'normal', 'Tự động tạo từ báo giá BG-2025-0006', NULL, 0, 0, '2025-12-14 15:10:31', '2025-12-14 15:10:31'),
(12, 'SX-2025-0008', 10, 16, '2025-12-14', NULL, NULL, NULL, NULL, 'pending', 'normal', 'Tự động tạo từ báo giá BG-2025-0007', NULL, 0, 0, '2025-12-14 15:21:48', '2025-12-14 15:21:48'),
(13, 'SX-2025-0009', 11, 18, '2025-12-14', NULL, NULL, NULL, NULL, 'pending', 'normal', 'Tự động tạo từ báo giá BG-2025-0008', NULL, 0, 0, '2025-12-14 15:38:10', '2025-12-14 15:38:10'),
(14, 'SX-2025-0010', 14, 21, '2025-12-16', NULL, NULL, NULL, NULL, 'pending', 'normal', 'Tự động tạo từ báo giá BG-2025-0009', NULL, 0, 0, '2025-12-16 08:00:54', '2025-12-16 08:00:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `production_order_bom`
--

CREATE TABLE `production_order_bom` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_type` enum('aluminum','glass','accessory','other') NOT NULL,
  `item_code` varchar(50) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `weight_kg` decimal(8,3) DEFAULT NULL,
  `area_m2` decimal(10,4) DEFAULT NULL,
  `required_quantity` decimal(10,2) NOT NULL,
  `issued_quantity` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','partial','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `production_order_doors`
--

CREATE TABLE `production_order_doors` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `design_id` int(11) NOT NULL,
  `door_sequence` int(11) DEFAULT 1,
  `status` enum('pending','in_progress','completed','on_hold') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `production_progress`
--

CREATE TABLE `production_progress` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `design_id` int(11) NOT NULL,
  `stage` enum('cutting','welding','gluing','accessories','finishing','packaging','waiting_glass','waiting_transport','installation','completed') NOT NULL,
  `status` enum('pending','in_progress','completed','on_hold') DEFAULT 'pending',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_accessory_rules`
--

CREATE TABLE `product_accessory_rules` (
  `id` bigint(20) NOT NULL,
  `product_type` varchar(64) NOT NULL COMMENT 'door, window, glass_wall, railing, roof, stair, other',
  `accessory_id` bigint(20) NOT NULL,
  `quantity_rule` varchar(64) NOT NULL COMMENT '3_per_leaf, 1_per_door, per_meter:2, fixed:4',
  `default_qty` decimal(10,2) DEFAULT 1.00,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_bom_profiles`
--

CREATE TABLE `product_bom_profiles` (
  `id` bigint(20) NOT NULL,
  `product_template_id` bigint(20) NOT NULL,
  `profile_id` bigint(20) NOT NULL,
  `formula` varchar(255) NOT NULL COMMENT 'Ví dụ: "2*H", "4*(W/leaf_count)", "W+H"',
  `quantity` int(11) DEFAULT 1 COMMENT 'Số thanh',
  `waste_percent` decimal(5,2) DEFAULT 2.00 COMMENT '%',
  `notes` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_templates`
--

CREATE TABLE `product_templates` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL COMMENT 'Mã template: D1, W1, RAIL1, ROOF1...',
  `name` varchar(255) NOT NULL COMMENT 'Tên template',
  `product_type` enum('door','window','glass_wall','railing','roof','stair','other') NOT NULL DEFAULT 'door' COMMENT 'Loại sản phẩm chính',
  `category` varchar(50) NOT NULL COMMENT 'door_out, door_in, window_swing, glass_railing...',
  `sub_type` varchar(50) DEFAULT NULL COMMENT 'swing, tilt, slide, folding, fixed',
  `family` varchar(50) DEFAULT NULL COMMENT 'door_out_1l, win_swing_2lr...',
  `aluminum_system` varchar(50) NOT NULL COMMENT 'XINGFA_55, VW-D-001...',
  `aluminum_system_id` int(11) DEFAULT NULL COMMENT 'FK to aluminum_systems',
  `preview_image` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh preview',
  `template_json` longtext DEFAULT NULL COMMENT 'JSON chứa toàn bộ template (meta, panel_tree, bom)',
  `param_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Schema cho parameters (defaultWidth, defaultHeight...)' CHECK (json_valid(`param_schema`)),
  `structure_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Panel tree structure' CHECK (json_valid(`structure_json`)),
  `bom_rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Quy tắc BOM riêng cho template này' CHECK (json_valid(`bom_rules`)),
  `default_width_mm` int(11) DEFAULT 1200 COMMENT 'Chiều rộng mặc định (mm)',
  `default_height_mm` int(11) DEFAULT 2200 COMMENT 'Chiều cao mặc định (mm)',
  `glass_type` varchar(100) DEFAULT NULL COMMENT 'Loại kính mặc định',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profit_percent` decimal(5,2) DEFAULT 25.00,
  `open_style` varchar(64) DEFAULT NULL,
  `leaf_layout` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu tất cả mẫu sản phẩm (cửa, lan can, mái, cầu thang...)';

--
-- Đang đổ dữ liệu cho bảng `product_templates`
--

INSERT INTO `product_templates` (`id`, `code`, `name`, `product_type`, `category`, `sub_type`, `family`, `aluminum_system`, `aluminum_system_id`, `preview_image`, `template_json`, `param_schema`, `structure_json`, `bom_rules`, `default_width_mm`, `default_height_mm`, `glass_type`, `description`, `is_active`, `display_order`, `created_at`, `updated_at`, `profit_percent`, `open_style`, `leaf_layout`) VALUES
(1, 'D1', 'Cửa đi 1 cánh mở ngoài', 'door', '', NULL, 'door_out', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', '{\"type\": \"door_swing\", \"panels\": 1, \"open_direction\": \"left\", \"has_transom\": false, \"structure\": [{\"type\": \"frame\", \"position\": \"outer\"}, {\"type\": \"panel\", \"position\": \"center\", \"panels\": 1}]}', NULL, 1200, 2200, NULL, NULL, 1, 1, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(2, 'D2', 'Cửa đi 2 cánh mở ngoài', 'door', '', NULL, 'door_out', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 3000, \"default\": 1800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 2, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(3, 'CKCL', 'Cửa kính cường lực 1 cánh', 'door', '', NULL, 'door_out', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 3, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(4, 'CKCL2', 'Cửa kính cường lực 2 cánh', 'door', '', NULL, 'door_out', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 3000, \"default\": 1800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1500, \"default\": 900}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 4, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(5, 'CKCL3', 'Cửa kính cường lực 3 cánh', 'door', '', NULL, 'door_out', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 4000, \"default\": 2700}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 900}, {\"name\": \"K2\", \"label\": \"Cánh giữa (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 900}, {\"name\": \"K3\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 900}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 5, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(6, 'D1_IN', 'Cửa đi 1 cánh mở trong', 'door', '', NULL, 'door_in', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 10, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(7, 'CS1', 'Cửa sổ 1 cánh mở quay', 'window', '', NULL, 'window_swing', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 20, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(8, 'CS2', 'Cửa sổ 2 cánh mở quay', 'window', '', NULL, 'window_swing', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 800, \"max\": 3000, \"default\": 1600}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 21, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(9, 'CSL1', 'Cửa sổ 1 cánh trượt', 'window', '', NULL, 'window_sliding', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 30, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(10, 'CSL2', 'Cửa sổ 2 cánh trượt', 'window', '', NULL, 'window_sliding', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 800, \"max\": 3000, \"default\": 1600}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 31, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(11, 'DL1', 'Cửa đi 1 cánh trượt', 'door', '', NULL, 'door_sliding', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 3000, \"default\": 1200}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 40, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(12, 'DL2', 'Cửa đi 2 cánh trượt', 'door', '', NULL, 'door_sliding', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 4000, \"default\": 2400}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh trái (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}, {\"name\": \"K2\", \"label\": \"Cánh phải (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1200}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 41, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(13, 'DX1', 'Cửa đi xếp trượt 2 cánh', 'door', '', NULL, 'door_folding', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 4000, \"default\": 2400}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh 1 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K2\", \"label\": \"Cánh 2 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 50, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(14, 'DX2', 'Cửa đi xếp trượt 4 cánh', 'door', '', NULL, 'door_folding', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 2400, \"max\": 6000, \"default\": 4800}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1800, \"max\": 3000, \"default\": 2400}, {\"name\": \"K1\", \"label\": \"Cánh 1 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K2\", \"label\": \"Cánh 2 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K3\", \"label\": \"Cánh 3 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}, {\"name\": \"K4\", \"label\": \"Cánh 4 (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 1200, \"default\": 1200}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 51, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(15, 'VCS1', 'Vách + Cửa sổ quay 1 cánh', 'window', '', NULL, 'wall_window', 'XINGFA_55', 6, NULL, NULL, '{\"params\": [{\"name\": \"B\", \"label\": \"Chiều rộng (mm)\", \"type\": \"number\", \"min\": 800, \"max\": 3000, \"default\": 2000}, {\"name\": \"H\", \"label\": \"Chiều cao (mm)\", \"type\": \"number\", \"min\": 1200, \"max\": 3000, \"default\": 2400}, {\"name\": \"H1\", \"label\": \"Chiều cao vách (mm)\", \"type\": \"number\", \"min\": 400, \"max\": 1500, \"default\": 800}, {\"name\": \"H2\", \"label\": \"Chiều cao cửa sổ (mm)\", \"type\": \"number\", \"min\": 600, \"max\": 2000, \"default\": 1600}]}', NULL, NULL, 1200, 2200, NULL, NULL, 1, 60, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(16, 'DOOR_OUT_1L_01', 'Cửa đi 1 cánh mở ngoài trái', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa đi 1 cánh mở quay ngoài, cánh mở sang trái', 1, 1, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(17, 'DOOR_OUT_1R_01', 'Cửa đi 1 cánh mở ngoài phải', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa đi 1 cánh mở quay ngoài, cánh mở sang phải', 1, 2, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(18, 'DOOR_OUT_2LR_01', 'Cửa đi 2 cánh mở quay ngoài (2 cánh bằng)', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1600,\"defaultHeight\":2200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi 2 cánh mở quay ngoài, 2 cánh bằng nhau', 1, 3, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(19, 'DOOR_OUT_2LR_ASYM_01', 'Cửa đi 2 cánh lệch (cánh chính + cánh phụ)', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1500,\"defaultHeight\":2200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[2,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi 2 cánh lệch, cánh chính rộng gấp đôi cánh phụ', 1, 4, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(20, 'DOOR_OUT_2LR_TOPFIX_01', 'Cửa đi 2 cánh + fix trên', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1600,\"defaultHeight\":2600}', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi 2 cánh mở quay + ô gió fix phía trên', 1, 5, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(21, 'DOOR_OUT_2LR_SIDEFIX_01', 'Cửa đi 2 cánh + fix 2 bên', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":2200,\"defaultHeight\":2300}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,2,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi 2 cánh mở quay + 2 ô fix 2 bên', 1, 6, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(22, 'DOOR_OUT_4L_01', 'Cửa đi 4 cánh mở quay ngoài', 'door', '', NULL, 'door_out', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":3200,\"defaultHeight\":2400}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi 4 cánh mở quay ngoài, xen kẽ trái-phải', 1, 7, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(23, 'DOOR_IN_1L_01', 'Cửa đi 1 cánh mở trong trái', 'door', '', NULL, 'door_in', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa đi 1 cánh mở quay trong, cánh mở sang trái', 1, 8, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(24, 'DOOR_IN_1R_01', 'Cửa đi 1 cánh mở trong phải', 'door', '', NULL, 'door_in', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":900,\"defaultHeight\":2200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa đi 1 cánh mở quay trong, cánh mở sang phải', 1, 9, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(25, 'DOOR_IN_2LR_01', 'Cửa đi 2 cánh mở quay trong (2 cánh bằng)', 'door', '', NULL, 'door_in', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1600,\"defaultHeight\":2200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi 2 cánh mở quay trong, 2 cánh bằng nhau', 1, 10, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(26, 'WIN_SWING_1L_01', 'Cửa sổ 1 cánh mở quay trái', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":800,\"defaultHeight\":1200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa sổ 1 cánh mở quay, cánh mở sang trái', 1, 11, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(27, 'WIN_SWING_1R_01', 'Cửa sổ 1 cánh mở quay phải', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":800,\"defaultHeight\":1200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa sổ 1 cánh mở quay, cánh mở sang phải', 1, 12, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(28, 'WIN_SWING_2LR_01', 'Cửa sổ 2 cánh mở quay', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1200,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ 2 cánh mở quay, xen kẽ trái-phải', 1, 13, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(29, 'WIN_SWING_3_01', 'Cửa sổ 3 cánh (2 mở quay + 1 fix giữa)', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1800,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ 3 cánh, 2 cánh mở quay 2 bên, 1 cánh fix giữa', 1, 14, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(30, 'WIN_SWING_4_01', 'Cửa sổ 4 cánh mở quay', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":2400,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ 4 cánh mở quay, xen kẽ trái-phải', 1, 15, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(31, 'WIN_SWING_2LR_TOPFIX_01', 'Cửa sổ 2 cánh mở quay + fix trên', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1200,\"defaultHeight\":1600}', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ 2 cánh mở quay + ô gió fix phía trên', 1, 16, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(32, 'WIN_TILT_1_01', 'Cửa sổ 1 cánh mở hất', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":900,\"defaultHeight\":900}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"tilt\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa sổ 1 cánh mở hất (top-hung)', 1, 17, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(33, 'WIN_TILT_2_01', 'Cửa sổ 2 cánh mở hất', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1600,\"defaultHeight\":900}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"tilt\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"tilt\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ 2 cánh mở hất', 1, 18, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(34, 'WIN_TILT_TURN_1_01', 'Cửa sổ 1 cánh mở hất-mở quay', 'window', '', NULL, 'window_swing', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":900,\"defaultHeight\":1200}', '{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"tilt-turn\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa sổ 1 cánh mở hất-mở quay (tilt-turn)', 1, 19, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(35, 'SLID_WIN_2_01', 'Cửa sổ lùa 2 cánh', 'window', '', NULL, 'window_sliding', 'XINGFA_55', 20, NULL, NULL, '{\"defaultWidth\":1600,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ lùa 2 cánh', 1, 20, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(36, 'SLID_WIN_3_01', 'Cửa sổ lùa 3 cánh', 'window', '', NULL, 'window_sliding', 'XINGFA_55', 20, NULL, NULL, '{\"defaultWidth\":2100,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ lùa 3 cánh', 1, 21, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(37, 'SLID_WIN_4_01', 'Cửa sổ lùa 4 cánh', 'window', '', NULL, 'window_sliding', 'XINGFA_55', 20, NULL, NULL, '{\"defaultWidth\":2800,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"window\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ lùa 4 cánh', 1, 22, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(38, 'SLID_DOOR_2_01', 'Cửa đi lùa 2 cánh', 'door', '', NULL, 'door_sliding', 'XINGFA_55', 20, NULL, NULL, '{\"defaultWidth\":2000,\"defaultHeight\":2200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi lùa 2 cánh', 1, 23, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(39, 'SLID_DOOR_4_01', 'Cửa đi lùa 4 cánh', 'door', '', NULL, 'door_sliding', 'XINGFA_55', 20, NULL, NULL, '{\"defaultWidth\":3200,\"defaultHeight\":2300}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K3\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K4\",\"role\":\"door\",\"openType\":\"sliding\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa đi lùa 4 cánh', 1, 24, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(40, 'PARTITION_DOOR_1L_01', 'Vách 2 bên + cửa đi 1 cánh giữa', 'window', '', NULL, 'wall_window', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":2600,\"defaultHeight\":2600}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F3\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Vách kính 2 bên + cửa đi 1 cánh ở giữa + fix trên', 1, 25, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(41, 'PARTITION_DOOR_2LR_01', 'Vách 2 bên + cửa đi 2 cánh giữa + fix trên', 'window', '', NULL, 'wall_window', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":3200,\"defaultHeight\":2800}', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[4,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,2,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"K1\",\"role\":\"door\",\"openType\":\"turn-left\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"K2\",\"role\":\"door\",\"openType\":\"turn-right\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]},{\"type\":\"leaf\",\"id\":\"F3\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Vách kính 2 bên + cửa đi 2 cánh ở giữa + fix trên', 1, 26, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(42, 'FIXED_WINDOW_1_01', 'Cửa sổ fix 1 ô', 'glass_wall', '', NULL, 'fixed', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":1200,\"defaultHeight\":1200}', '{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}', NULL, 1200, 2200, NULL, 'Cửa sổ fix 1 ô', 1, 27, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(43, 'FIXED_WINDOW_2_01', 'Cửa sổ fix 2 ô', 'glass_wall', '', NULL, 'fixed', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":2400,\"defaultHeight\":1200}', '{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}', NULL, 1200, 2200, NULL, 'Cửa sổ fix 2 ô', 1, 28, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL),
(44, 'FIXED_WINDOW_4_01', 'Cửa sổ fix 4 ô', 'glass_wall', '', NULL, 'fixed', 'XINGFA_55', 12, NULL, NULL, '{\"defaultWidth\":2400,\"defaultHeight\":2400}', '{\"direction\":\"horizontal\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F1\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F2\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]},{\"direction\":\"vertical\",\"split\":true,\"ratio\":[1,1],\"children\":[{\"type\":\"leaf\",\"id\":\"F3\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"},{\"type\":\"leaf\",\"id\":\"F4\",\"role\":\"fixed\",\"openType\":\"fixed\",\"glass\":\"CLEAR_8\"}]}]}', NULL, 1200, 2200, NULL, 'Cửa sổ fix 4 ô (2x2)', 1, 29, '2025-12-15 09:23:28', '2025-12-15 09:23:28', 25.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_template_accessories`
--

CREATE TABLE `product_template_accessories` (
  `id` int(11) NOT NULL,
  `product_template_id` int(11) NOT NULL COMMENT 'FK to product_templates',
  `accessory_id` int(11) NOT NULL COMMENT 'FK to accessories',
  `quantity_override` decimal(10,2) DEFAULT NULL COMMENT 'NULL = dùng default từ accessory_applications',
  `is_excluded` tinyint(1) DEFAULT 0 COMMENT 'True = không dùng phụ kiện này cho template',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Override phụ kiện cho template cụ thể';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `project_code` varchar(50) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('new','designing','quotation_pending','quotation_approved','in_production','completed','paused','cancelled') DEFAULT 'new',
  `progress_percent` int(11) DEFAULT 0,
  `total_value` decimal(15,2) DEFAULT 0.00,
  `material_cost` decimal(15,2) DEFAULT 0.00 COMMENT 'Tổng chi phí vật tư',
  `assigned_to` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `projects`
--

INSERT INTO `projects` (`id`, `project_code`, `project_name`, `customer_id`, `start_date`, `deadline`, `status`, `progress_percent`, `total_value`, `material_cost`, `assigned_to`, `notes`, `created_at`, `updated_at`) VALUES
(2, 'CT2025-002', 'Nhà phố Thanh Xuân', 2, '2025-01-25', '2025-02-10', 'completed', 100, 89500000.00, 1000000.00, NULL, 'Chờ duyệt bản vẽ', '2025-11-26 16:57:55', '2025-12-11 08:56:36'),
(3, 'CT2025-003', 'Chung cư Vinhomes', 3, '2025-01-28', '2025-02-15', 'completed', 100, 0.00, 0.00, NULL, 'Đang thiết kế', '2025-11-26 16:57:55', '2025-12-13 07:28:51'),
(4, 'CT2025-004', 'Biệt thự Ecopark', 4, '2025-01-15', '2025-02-05', 'completed', 100, 245000000.00, 0.00, NULL, 'Gần hoàn thành', '2025-11-26 16:57:55', '2025-12-11 06:00:43'),
(5, 'CT2025-005', 'Nhà phố Cầu Giấy', 5, '2025-01-15', '2025-01-28', 'completed', 100, 125000000.00, 0.00, NULL, 'Đang cắt nhôm', '2025-11-26 16:57:55', '2025-12-11 06:00:51'),
(6, 'CT2025-006', 'Căn hộ The Manor', 6, '2025-01-20', '2025-02-12', 'designing', 25, 189000000.00, 0.00, NULL, 'Đang sản xuất', '2025-11-26 16:57:55', '2025-12-11 06:55:58'),
(7, 'CT2025-440', 'Anh Vũ', 9, '2025-12-01', '2026-01-30', 'completed', 100, 0.00, 10000.00, NULL, 'Giao sản phẩm đúng', '2025-12-11 03:57:53', '2025-12-12 15:46:53'),
(8, 'CT2025-154', 'Anh Vũ - Nam Định', 9, '2025-12-14', '2026-01-14', 'completed', 100, 0.00, 1100000.00, NULL, 'Làm nhanh', '2025-12-14 10:39:17', '2025-12-14 13:19:18'),
(9, 'CT2025-567', 'Biệt thự Hải', 7, '2025-12-14', '2026-01-14', 'designing', 40, 1000000.00, 8478000.00, NULL, NULL, '2025-12-14 13:40:38', '2025-12-16 07:10:20'),
(10, 'CT2025-783', 'Cam Ly', 7, '2025-12-14', '2026-01-14', 'in_production', 60, 21800000.00, 0.00, NULL, NULL, '2025-12-14 15:20:08', '2025-12-16 08:10:52'),
(11, 'CT2025-068', 'aa', 7, '2025-12-14', '2026-01-14', 'completed', 100, 3000000000.00, 1389000.00, NULL, NULL, '2025-12-14 15:30:08', '2025-12-16 07:10:46'),
(12, 'CT2025-712', 'Cam Ly 122', 9, '2025-12-14', '2026-01-14', 'designing', 25, 45000000.00, 0.00, NULL, NULL, '2025-12-14 15:39:44', '2025-12-14 15:40:37'),
(13, 'CT2025-260', 'Anh Hải - Hà Nam', 7, '2025-12-15', '2026-01-15', 'designing', 25, 0.00, 0.00, NULL, NULL, '2025-12-15 03:38:18', '2025-12-15 06:08:57'),
(14, 'CT2025-196', 'Nhà Cẩm Ly', 13, '2025-12-16', '2026-01-16', 'designing', 25, 72000000.00, 0.00, NULL, NULL, '2025-12-16 07:41:59', '2025-12-16 08:11:24'),
(15, 'CT2025-760', 'Nhà S10', 9, '2025-12-17', '2026-01-17', 'new', 0, 0.00, 0.00, NULL, NULL, '2025-12-17 02:18:02', '2025-12-17 02:18:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `projects_material_summary`
--

CREATE TABLE `projects_material_summary` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `item_type` varchar(50) DEFAULT NULL,
  `item_code` varchar(100) DEFAULT NULL,
  `total_qty` decimal(10,3) DEFAULT NULL,
  `total_length_mm` int(11) DEFAULT NULL,
  `total_area_m2` decimal(10,3) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_accessories_summary`
--

CREATE TABLE `project_accessories_summary` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `accessory_id` int(11) DEFAULT NULL,
  `accessory_code` varchar(50) NOT NULL,
  `accessory_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(50) NOT NULL,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_aluminum_summary`
--

CREATE TABLE `project_aluminum_summary` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `aluminum_system_id` int(11) NOT NULL,
  `profile_name` varchar(255) NOT NULL,
  `profile_code` varchar(50) DEFAULT NULL,
  `symbol` varchar(50) DEFAULT NULL,
  `weight_per_meter` decimal(8,3) NOT NULL,
  `total_length_mm` int(11) NOT NULL DEFAULT 0,
  `total_weight_kg` decimal(10,3) NOT NULL DEFAULT 0.000,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price_per_kg` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  `pano_bars` decimal(8,2) DEFAULT 0.00,
  `pano_weight_kg` decimal(10,3) DEFAULT 0.000,
  `total_with_pano_kg` decimal(10,3) DEFAULT 0.000,
  `total_with_pano_price` decimal(15,2) DEFAULT 0.00,
  `actual_cut_kg` decimal(10,3) DEFAULT 0.000,
  `efficiency_percent` decimal(5,2) DEFAULT 0.00,
  `bar_size_mm` int(11) DEFAULT 6000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_cutting_details`
--

CREATE TABLE `project_cutting_details` (
  `id` int(11) NOT NULL,
  `optimization_id` int(11) NOT NULL,
  `bar_number` int(11) NOT NULL,
  `profile_name` varchar(255) NOT NULL,
  `profile_code` varchar(50) DEFAULT NULL,
  `cut_length_mm` int(11) NOT NULL,
  `position_order` int(11) DEFAULT NULL,
  `is_waste` tinyint(1) DEFAULT 0,
  `waste_length_mm` int(11) DEFAULT 0,
  `is_reusable` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_cutting_optimization`
--

CREATE TABLE `project_cutting_optimization` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `aluminum_system_id` int(11) NOT NULL,
  `bar_size_mm` int(11) DEFAULT 6000,
  `total_bars_needed` decimal(8,2) DEFAULT 0.00,
  `total_weight_kg` decimal(10,3) DEFAULT 0.000,
  `pano_bars` decimal(8,2) DEFAULT 0.00,
  `pano_weight_kg` decimal(10,3) DEFAULT 0.000,
  `total_with_pano_kg` decimal(10,3) DEFAULT 0.000,
  `actual_cut_kg` decimal(10,3) DEFAULT 0.000,
  `efficiency_percent` decimal(5,2) DEFAULT 0.00,
  `unit_price_per_kg` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  `optimization_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`optimization_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `project_doors_compat_view`
-- (See below for the actual view)
--
CREATE TABLE `project_doors_compat_view` (
`id` int(11)
,`project_id` int(11)
,`project_name` varchar(255)
,`door_template_id` int(11)
,`door_code` varchar(50)
,`door_name` varchar(255)
,`door_category` varchar(50)
,`aluminum_system` varchar(50)
,`quantity` int(11)
,`width_mm` int(11)
,`height_mm` int(11)
,`glass_type` varchar(100)
,`preview_image` varchar(255)
,`location` varchar(255)
,`notes` text
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_finances`
--

CREATE TABLE `project_finances` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `revenue_from_quotation` decimal(15,2) DEFAULT 0.00,
  `revenue_other_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`revenue_other_items`)),
  `contract_signing_date` date DEFAULT NULL,
  `aluminum_cost` decimal(15,2) DEFAULT 0.00,
  `glass_cost` decimal(15,2) DEFAULT 0.00,
  `accessories_cost` decimal(15,2) DEFAULT 0.00,
  `gaskets_glue_cost` decimal(15,2) DEFAULT 0.00,
  `auxiliary_materials_cost` decimal(15,2) DEFAULT 0.00,
  `labor_cost` decimal(15,2) DEFAULT 0.00,
  `cost_other_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cost_other_items`)),
  `total_cost` decimal(15,2) DEFAULT 0.00,
  `customer_payments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customer_payments`)),
  `total_customer_debt` decimal(15,2) DEFAULT 0.00,
  `profit_before_debt` decimal(15,2) DEFAULT 0.00,
  `profit_after_debt` decimal(15,2) DEFAULT 0.00,
  `purchase_amount` decimal(15,2) DEFAULT 0.00,
  `purchase_paid` decimal(15,2) DEFAULT 0.00,
  `supplier_debt` decimal(15,2) DEFAULT 0.00,
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `project_finances`
--

INSERT INTO `project_finances` (`id`, `project_id`, `revenue_from_quotation`, `revenue_other_items`, `contract_signing_date`, `aluminum_cost`, `glass_cost`, `accessories_cost`, `gaskets_glue_cost`, `auxiliary_materials_cost`, `labor_cost`, `cost_other_items`, `total_cost`, `customer_payments`, `total_customer_debt`, `profit_before_debt`, `profit_after_debt`, `purchase_amount`, `purchase_paid`, `supplier_debt`, `last_updated_at`, `created_at`) VALUES
(2, 2, 100000000.00, NULL, '2025-01-25', 30000000.00, 5000000.00, 8000000.00, 300000.00, 0.00, 10000000.00, NULL, 53300000.00, NULL, 0.00, 46700000.00, 46700000.00, 0.00, 0.00, 0.00, '2025-11-27 07:49:10', '2025-11-27 07:49:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_gaskets_summary`
--

CREATE TABLE `project_gaskets_summary` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_type` enum('gasket','glue','sealant','other') NOT NULL,
  `length_mm` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(50) NOT NULL,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_glass_summary`
--

CREATE TABLE `project_glass_summary` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `glass_type` varchar(100) NOT NULL,
  `glass_code` varchar(50) DEFAULT NULL,
  `thickness_mm` int(11) DEFAULT NULL,
  `width_mm` int(11) NOT NULL,
  `height_mm` int(11) NOT NULL,
  `area_m2` decimal(10,4) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_area_m2` decimal(10,4) NOT NULL,
  `unit_price_per_m2` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_items`
--

CREATE TABLE `project_items` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL COMMENT 'ID dự án',
  `product_template_id` int(11) NOT NULL COMMENT 'ID mẫu sản phẩm từ product_templates',
  `aluminum_system` varchar(50) NOT NULL COMMENT 'Hệ nhôm được chọn',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng',
  `custom_width_mm` int(11) DEFAULT NULL COMMENT 'Chiều rộng tùy chỉnh (NULL = dùng mặc định)',
  `custom_height_mm` int(11) DEFAULT NULL COMMENT 'Chiều cao tùy chỉnh (NULL = dùng mặc định)',
  `custom_glass_type` varchar(100) DEFAULT NULL COMMENT 'Loại kính tùy chỉnh',
  `custom_accessories_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Phụ kiện tùy chỉnh' CHECK (json_valid(`custom_accessories_json`)),
  `snapshot_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Snapshot cấu hình tại thời điểm chốt báo giá' CHECK (json_valid(`snapshot_config`)),
  `bom_override` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Override BOM nếu cần điều chỉnh thủ công' CHECK (json_valid(`bom_override`)),
  `calc_cache` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`calc_cache`)),
  `location` varchar(255) DEFAULT NULL COMMENT 'Vị trí lắp đặt: Phòng khách, Tầng 2...',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `status` enum('DESIGNING','DESIGN_CONFIRMED','BOM_EXTRACTED','EXPORTED') DEFAULT 'DESIGNING',
  `source_quotation_id` int(11) DEFAULT NULL,
  `source_quotation_item_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng liên kết sản phẩm với dự án - hỗ trợ snapshot và override';

--
-- Đang đổ dữ liệu cho bảng `project_items`
--

INSERT INTO `project_items` (`id`, `project_id`, `product_template_id`, `aluminum_system`, `quantity`, `custom_width_mm`, `custom_height_mm`, `custom_glass_type`, `custom_accessories_json`, `snapshot_config`, `bom_override`, `calc_cache`, `location`, `notes`, `status`, `source_quotation_id`, `source_quotation_item_id`, `created_at`, `updated_at`, `name`) VALUES
(1, 9, 1, '', 1, NULL, NULL, NULL, NULL, '{\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"cưa\",\"confirmed_at\":\"2025-12-15T16:28:17.917Z\",\"confirmed_by\":null}', NULL, NULL, NULL, NULL, 'DESIGN_CONFIRMED', 15, 5, '2025-12-15 16:27:26', '2025-12-15 16:28:17', NULL),
(2, 9, 1, '', 1, NULL, NULL, NULL, NULL, '{\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"cưa\",\"confirmed_at\":\"2025-12-15T17:01:21.120Z\",\"confirmed_by\":null}', NULL, NULL, NULL, NULL, 'DESIGN_CONFIRMED', 15, 5, '2025-12-15 17:01:03', '2025-12-15 17:01:21', NULL),
(11, 14, 1, 'PMA-101', 5, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa đi 1 cánh mở ngoài (1200×2200mm)\",\"original_unit_price\":\"1000000.00\",\"original_total_price\":\"5000000.00\",\"original_quantity\":\"5.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa đi 1 cánh mở ngoài (1200×2200mm)', 'DESIGNING', 21, 12, '2025-12-16 14:28:15', '2025-12-17 03:16:59', NULL),
(12, 14, 1, 'PMA-101', 4, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa đi 1 cánh mở ngoài trái (1200×2200mm)\",\"original_unit_price\":\"1500000.00\",\"original_total_price\":\"6000000.00\",\"original_quantity\":\"4.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa đi 1 cánh mở ngoài trái (1200×2200mm)', 'DESIGNING', 21, 13, '2025-12-16 14:28:41', '2025-12-17 03:16:59', NULL),
(13, 14, 1, 'PMA-101', 5, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa đi 2 cánh mở ngoài (1200×2200mm)\",\"original_unit_price\":\"2000000.00\",\"original_total_price\":\"10000000.00\",\"original_quantity\":\"5.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa đi 2 cánh mở ngoài (1200×2200mm)', 'DESIGNING', 21, 15, '2025-12-16 14:28:45', '2025-12-17 03:16:59', NULL),
(14, 14, 1, 'PMA-101', 5, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa đi 1 cánh mở ngoài phải (1200×2200mm)\",\"original_unit_price\":\"1200000.00\",\"original_total_price\":\"6000000.00\",\"original_quantity\":\"5.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa đi 1 cánh mở ngoài phải (1200×2200mm)', 'DESIGNING', 21, 14, '2025-12-16 14:28:58', '2025-12-17 03:16:59', NULL),
(15, 14, 1, 'PMA-101', 5, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa đi 2 cánh mở quay ngoài (2 cánh bằng) (1200×2200mm)\",\"original_unit_price\":\"2200000.00\",\"original_total_price\":\"11000000.00\",\"original_quantity\":\"5.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa đi 2 cánh mở quay ngoài (2 cánh bằng) (1200×2200mm)', 'DESIGNING', 21, 16, '2025-12-16 14:30:47', '2025-12-17 03:16:59', NULL),
(16, 14, 7, 'PMA-101', 4, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa sổ 4 cánh mở quay (1200×2200mm)\",\"original_unit_price\":\"1700000.00\",\"original_total_price\":\"6800000.00\",\"original_quantity\":\"4.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa sổ 4 cánh mở quay (1200×2200mm)', 'DESIGNING', 21, 20, '2025-12-16 14:30:50', '2025-12-17 03:16:59', NULL),
(17, 14, 7, 'PMA-101', 7, 1200, 2200, NULL, NULL, '{\"source\":\"quotation\",\"quotation_date\":\"2025-12-16T07:59:23.000Z\",\"original_item_name\":\"Cửa sổ 1 cánh trượt (1200×2200mm)\",\"original_unit_price\":\"1100000.00\",\"original_total_price\":\"7700000.00\",\"original_quantity\":\"7.00\",\"size\":{\"w\":1200,\"h\":2200,\"unit\":\"mm\"},\"open_direction\":\"left\",\"open_style\":\"swing\",\"leaf_count\":1,\"aluminum_system\":\"XINGFA_55\",\"glass\":{\"type\":\"tempered\",\"thickness_mm\":8},\"color\":\"white\",\"notes\":\"\"}', NULL, NULL, NULL, 'Cửa sổ 1 cánh trượt (1200×2200mm)', 'DESIGNING', 21, 18, '2025-12-17 01:51:07', '2025-12-17 03:16:59', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_items_v2`
--

CREATE TABLE `project_items_v2` (
  `id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `item_type` enum('door','window','railing','glass_partition','glass_roof','stair') NOT NULL DEFAULT 'door',
  `item_code` varchar(50) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `source_type` enum('quotation','catalog','manual') DEFAULT 'manual',
  `source_quotation_id` bigint(20) DEFAULT NULL,
  `source_quotation_item_id` bigint(20) DEFAULT NULL,
  `status` enum('draft','configured','structured','bom_generated','priced','locked') DEFAULT 'draft',
  `current_version_id` bigint(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `project_items_v2`
--

INSERT INTO `project_items_v2` (`id`, `project_id`, `item_type`, `item_code`, `item_name`, `quantity`, `source_type`, `source_quotation_id`, `source_quotation_item_id`, `status`, `current_version_id`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 'door', 'CT2025-003-C001', 'CT2025-003-C001', 1, 'catalog', NULL, NULL, 'bom_generated', 1, 'Migrated from door_designs.id=1', '2025-11-27 15:06:44', '2025-12-16 23:18:34'),
(2, 2, 'door', 'CT2025-002-C002', 'CT2025-002-C002', 1, 'catalog', NULL, NULL, 'configured', 2, 'Migrated from door_designs.id=5', '2025-11-27 17:00:04', '2025-12-16 22:42:35'),
(3, 5, 'door', 'CT2025-005-C001', 'CT2025-005-C001', 1, 'catalog', NULL, NULL, 'configured', 3, 'Migrated from door_designs.id=13', '2025-12-08 14:52:40', '2025-12-16 22:42:35'),
(4, 5, 'door', 'CT2025-005-C002', 'CT2025-005-C002', 1, 'catalog', NULL, NULL, 'configured', 4, 'Migrated from door_designs.id=14', '2025-12-08 17:25:42', '2025-12-16 22:42:35'),
(5, 3, 'window', 'CT2025-003-C002', 'CT2025-003-C002', 1, 'catalog', NULL, NULL, 'configured', 5, 'Migrated from door_designs.id=19', '2025-12-11 10:54:13', '2025-12-16 22:42:35'),
(6, 7, 'door', 'CT2025-440-C001', 'CT2025-440-C001', 1, 'catalog', NULL, NULL, 'configured', 6, 'Migrated from door_designs.id=20', '2025-12-11 11:22:10', '2025-12-16 22:42:35'),
(7, 4, 'door', 'CT2025-004-C001', 'CT2025-004-C001', 1, 'catalog', NULL, NULL, 'configured', 7, 'Migrated from door_designs.id=21', '2025-12-11 13:26:49', '2025-12-16 22:42:35'),
(8, 7, 'door', 'CT2025-440-C002', 'CT2025-440-C002', 1, 'catalog', NULL, NULL, 'configured', 8, 'Migrated from door_designs.id=22', '2025-12-11 13:37:07', '2025-12-16 22:42:35'),
(9, 7, 'window', 'CT2025-440-C003', 'CT2025-440-C003', 1, 'catalog', NULL, NULL, 'configured', 9, 'Migrated from door_designs.id=23', '2025-12-13 14:29:29', '2025-12-16 22:42:35'),
(10, 11, 'door', 'CT2025-068-C001', 'CT2025-068-C001', 1, 'catalog', NULL, NULL, 'configured', 10, 'Migrated from door_designs.id=24', '2025-12-14 23:21:47', '2025-12-16 22:42:35'),
(11, 11, 'glass_partition', 'CT2025-068-C002', 'CT2025-068-C002', 1, 'catalog', NULL, NULL, 'bom_generated', 11, 'Migrated from door_designs.id=25', '2025-12-14 23:22:00', '2025-12-17 09:39:12'),
(12, 13, 'window', 'CT2025-260-C001', 'CT2025-260-C001', 1, 'catalog', NULL, NULL, 'bom_generated', 12, 'Migrated from door_designs.id=26', '2025-12-15 11:56:58', '2025-12-17 09:02:05'),
(13, 12, 'door', 'CT2025-712-C001', 'CT2025-712-C001', 1, 'catalog', NULL, NULL, 'bom_generated', 13, 'Migrated from door_designs.id=27', '2025-12-15 13:05:31', '2025-12-17 09:12:53'),
(14, 9, 'window', 'CT2025-567-C001', 'CT2025-567-C001', 1, 'catalog', NULL, NULL, 'bom_generated', 14, 'Migrated from door_designs.id=28', '2025-12-15 22:36:53', '2025-12-17 08:14:48'),
(15, 9, 'railing', 'CT2025-567-C002', 'CT2025-567-C002', 1, 'catalog', NULL, NULL, 'bom_generated', 15, 'Migrated from door_designs.id=29', '2025-12-15 22:37:25', '2025-12-16 23:33:59'),
(16, 14, 'window', 'CT2025-196-C001', 'CT2025-196-C001', 1, 'catalog', NULL, NULL, 'bom_generated', 16, 'Migrated from door_designs.id=30', '2025-12-16 19:02:30', '2025-12-16 23:34:07'),
(17, 14, 'window', 'CT2025-196-C002', 'CT2025-196-C002', 1, 'catalog', NULL, NULL, 'bom_generated', 17, 'Migrated from door_designs.id=31', '2025-12-16 19:02:30', '2025-12-17 08:51:07'),
(18, 14, 'window', 'CT2025-196-C003', 'CT2025-196-C003', 1, 'catalog', NULL, NULL, 'configured', 18, 'Migrated from door_designs.id=32', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(19, 14, 'window', 'CT2025-196-C004', 'CT2025-196-C004', 1, 'catalog', NULL, NULL, 'configured', 19, 'Migrated from door_designs.id=33', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(20, 14, 'window', 'CT2025-196-C005', 'CT2025-196-C005', 1, 'catalog', NULL, NULL, 'configured', 20, 'Migrated from door_designs.id=34', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(21, 14, 'window', 'CT2025-196-C006', 'CT2025-196-C006', 1, 'catalog', NULL, NULL, 'configured', 21, 'Migrated from door_designs.id=35', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(22, 14, 'window', 'CT2025-196-C007', 'CT2025-196-C007', 1, 'catalog', NULL, NULL, 'configured', 22, 'Migrated from door_designs.id=36', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(23, 14, 'window', 'CT2025-196-C008', 'CT2025-196-C008', 1, 'catalog', NULL, NULL, 'configured', 23, 'Migrated from door_designs.id=37', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(24, 14, 'window', 'CT2025-196-C009', 'CT2025-196-C009', 1, 'catalog', NULL, NULL, 'configured', 24, 'Migrated from door_designs.id=38', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(25, 14, 'window', 'CT2025-196-C010', 'CT2025-196-C010', 1, 'catalog', NULL, NULL, 'configured', 25, 'Migrated from door_designs.id=39', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(26, 14, 'window', 'CT2025-196-C011', 'CT2025-196-C011', 1, 'catalog', NULL, NULL, 'configured', 26, 'Migrated from door_designs.id=40', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(27, 14, 'window', 'CT2025-196-C012', 'CT2025-196-C012', 1, 'catalog', NULL, NULL, 'configured', 27, 'Migrated from door_designs.id=41', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(28, 14, 'window', 'CT2025-196-C013', 'CT2025-196-C013', 1, 'catalog', NULL, NULL, 'configured', 28, 'Migrated from door_designs.id=42', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(29, 14, 'window', 'CT2025-196-C014', 'CT2025-196-C014', 1, 'catalog', NULL, NULL, 'configured', 29, 'Migrated from door_designs.id=43', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(30, 14, 'window', 'CT2025-196-C015', 'CT2025-196-C015', 1, 'catalog', NULL, NULL, 'configured', 30, 'Migrated from door_designs.id=44', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(31, 14, 'window', 'CT2025-196-C016', 'CT2025-196-C016', 1, 'catalog', NULL, NULL, 'configured', 31, 'Migrated from door_designs.id=45', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(32, 14, 'window', 'CT2025-196-C017', 'CT2025-196-C017', 1, 'catalog', NULL, NULL, 'configured', 32, 'Migrated from door_designs.id=46', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(33, 14, 'window', 'CT2025-196-C018', 'CT2025-196-C018', 1, 'catalog', NULL, NULL, 'configured', 33, 'Migrated from door_designs.id=47', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(34, 14, 'window', 'CT2025-196-C019', 'CT2025-196-C019', 1, 'catalog', NULL, NULL, 'configured', 34, 'Migrated from door_designs.id=48', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(35, 14, 'window', 'CT2025-196-C020', 'CT2025-196-C020', 1, 'catalog', NULL, NULL, 'configured', 35, 'Migrated from door_designs.id=49', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(36, 14, 'window', 'CT2025-196-C021', 'CT2025-196-C021', 1, 'catalog', NULL, NULL, 'configured', 36, 'Migrated from door_designs.id=50', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(37, 14, 'window', 'CT2025-196-C022', 'CT2025-196-C022', 1, 'catalog', NULL, NULL, 'configured', 37, 'Migrated from door_designs.id=51', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(38, 14, 'window', 'CT2025-196-C023', 'CT2025-196-C023', 1, 'catalog', NULL, NULL, 'configured', 38, 'Migrated from door_designs.id=52', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(39, 14, 'window', 'CT2025-196-C024', 'CT2025-196-C024', 1, 'catalog', NULL, NULL, 'configured', 39, 'Migrated from door_designs.id=53', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(40, 14, 'window', 'CT2025-196-C025', 'CT2025-196-C025', 1, 'catalog', NULL, NULL, 'configured', 40, 'Migrated from door_designs.id=54', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(41, 14, 'window', 'CT2025-196-C026', 'CT2025-196-C026', 1, 'catalog', NULL, NULL, 'configured', 41, 'Migrated from door_designs.id=55', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(42, 14, 'window', 'CT2025-196-C027', 'CT2025-196-C027', 1, 'catalog', NULL, NULL, 'configured', 42, 'Migrated from door_designs.id=56', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(43, 14, 'window', 'CT2025-196-C028', 'CT2025-196-C028', 1, 'catalog', NULL, NULL, 'configured', 43, 'Migrated from door_designs.id=57', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(44, 14, 'window', 'CT2025-196-C029', 'CT2025-196-C029', 1, 'catalog', NULL, NULL, 'configured', 44, 'Migrated from door_designs.id=58', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(45, 14, 'window', 'CT2025-196-C030', 'CT2025-196-C030', 1, 'catalog', NULL, NULL, 'configured', 45, 'Migrated from door_designs.id=59', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(46, 14, 'window', 'CT2025-196-C031', 'CT2025-196-C031', 1, 'catalog', NULL, NULL, 'configured', 46, 'Migrated from door_designs.id=60', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(47, 14, 'window', 'CT2025-196-C032', 'CT2025-196-C032', 1, 'catalog', NULL, NULL, 'configured', 47, 'Migrated from door_designs.id=61', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(48, 14, 'window', 'CT2025-196-C033', 'CT2025-196-C033', 1, 'catalog', NULL, NULL, 'configured', 48, 'Migrated from door_designs.id=62', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(49, 14, 'window', 'CT2025-196-C034', 'CT2025-196-C034', 1, 'catalog', NULL, NULL, 'configured', 49, 'Migrated from door_designs.id=63', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(50, 14, 'window', 'CT2025-196-C035', 'CT2025-196-C035', 1, 'catalog', NULL, NULL, 'configured', 50, 'Migrated from door_designs.id=64', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(51, 14, 'window', 'CT2025-196-C036', 'CT2025-196-C036', 1, 'catalog', NULL, NULL, 'configured', 51, 'Migrated from door_designs.id=65', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(52, 14, 'window', 'CT2025-196-C037', 'CT2025-196-C037', 1, 'catalog', NULL, NULL, 'configured', 52, 'Migrated from door_designs.id=66', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(53, 14, 'window', 'CT2025-196-C038', 'CT2025-196-C038', 1, 'catalog', NULL, NULL, 'configured', 53, 'Migrated from door_designs.id=67', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(54, 14, 'window', 'CT2025-196-C039', 'CT2025-196-C039', 1, 'catalog', NULL, NULL, 'configured', 54, 'Migrated from door_designs.id=68', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(55, 14, 'window', 'CT2025-196-C040', 'CT2025-196-C040', 1, 'catalog', NULL, NULL, 'configured', 55, 'Migrated from door_designs.id=69', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(56, 14, 'window', 'CT2025-196-C041', 'CT2025-196-C041', 1, 'catalog', NULL, NULL, 'configured', 56, 'Migrated from door_designs.id=70', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(57, 14, 'window', 'CT2025-196-C042', 'CT2025-196-C042', 1, 'catalog', NULL, NULL, 'configured', 57, 'Migrated from door_designs.id=71', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(58, 14, 'window', 'CT2025-196-C043', 'CT2025-196-C043', 1, 'catalog', NULL, NULL, 'configured', 58, 'Migrated from door_designs.id=72', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(59, 14, 'window', 'CT2025-196-C044', 'CT2025-196-C044', 1, 'catalog', NULL, NULL, 'configured', 59, 'Migrated from door_designs.id=73', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(60, 14, 'window', 'CT2025-196-C045', 'CT2025-196-C045', 1, 'catalog', NULL, NULL, 'configured', 60, 'Migrated from door_designs.id=74', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(61, 14, 'window', 'CT2025-196-C046', 'CT2025-196-C046', 1, 'catalog', NULL, NULL, 'configured', 61, 'Migrated from door_designs.id=75', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(62, 14, 'window', 'CT2025-196-C047', 'CT2025-196-C047', 1, 'catalog', NULL, NULL, 'configured', 62, 'Migrated from door_designs.id=76', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(63, 14, 'window', 'CT2025-196-C048', 'CT2025-196-C048', 1, 'catalog', NULL, NULL, 'configured', 63, 'Migrated from door_designs.id=77', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(64, 14, 'window', 'CT2025-196-C049', 'CT2025-196-C049', 1, 'catalog', NULL, NULL, 'configured', 64, 'Migrated from door_designs.id=78', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(65, 14, 'window', 'CT2025-196-C050', 'CT2025-196-C050', 1, 'catalog', NULL, NULL, 'configured', 65, 'Migrated from door_designs.id=79', '2025-12-16 19:02:30', '2025-12-16 22:42:35'),
(66, 14, 'window', 'CT2025-196-C051', 'CT2025-196-C051', 1, 'catalog', NULL, NULL, 'configured', 66, 'Migrated from door_designs.id=80', '2025-12-16 19:03:05', '2025-12-16 22:42:35'),
(67, 14, 'window', 'CT2025-196-C052', 'CT2025-196-C052', 1, 'catalog', NULL, NULL, 'configured', 67, 'Migrated from door_designs.id=81', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(68, 14, 'window', 'CT2025-196-C053', 'CT2025-196-C053', 1, 'catalog', NULL, NULL, 'configured', 68, 'Migrated from door_designs.id=82', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(69, 14, 'window', 'CT2025-196-C054', 'CT2025-196-C054', 1, 'catalog', NULL, NULL, 'configured', 69, 'Migrated from door_designs.id=83', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(70, 14, 'window', 'CT2025-196-C055', 'CT2025-196-C055', 1, 'catalog', NULL, NULL, 'configured', 70, 'Migrated from door_designs.id=84', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(71, 14, 'window', 'CT2025-196-C056', 'CT2025-196-C056', 1, 'catalog', NULL, NULL, 'configured', 71, 'Migrated from door_designs.id=85', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(72, 14, 'window', 'CT2025-196-C057', 'CT2025-196-C057', 1, 'catalog', NULL, NULL, 'configured', 72, 'Migrated from door_designs.id=86', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(73, 14, 'window', 'CT2025-196-C058', 'CT2025-196-C058', 1, 'catalog', NULL, NULL, 'configured', 73, 'Migrated from door_designs.id=87', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(74, 14, 'window', 'CT2025-196-C059', 'CT2025-196-C059', 1, 'catalog', NULL, NULL, 'configured', 74, 'Migrated from door_designs.id=88', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(75, 14, 'window', 'CT2025-196-C060', 'CT2025-196-C060', 1, 'catalog', NULL, NULL, 'configured', 75, 'Migrated from door_designs.id=89', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(76, 14, 'window', 'CT2025-196-C061', 'CT2025-196-C061', 1, 'catalog', NULL, NULL, 'configured', 76, 'Migrated from door_designs.id=90', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(77, 14, 'window', 'CT2025-196-C062', 'CT2025-196-C062', 1, 'catalog', NULL, NULL, 'configured', 77, 'Migrated from door_designs.id=91', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(78, 14, 'window', 'CT2025-196-C063', 'CT2025-196-C063', 1, 'catalog', NULL, NULL, 'configured', 78, 'Migrated from door_designs.id=92', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(79, 14, 'window', 'CT2025-196-C064', 'CT2025-196-C064', 1, 'catalog', NULL, NULL, 'configured', 79, 'Migrated from door_designs.id=93', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(80, 14, 'window', 'CT2025-196-C065', 'CT2025-196-C065', 1, 'catalog', NULL, NULL, 'configured', 80, 'Migrated from door_designs.id=94', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(81, 14, 'window', 'CT2025-196-C066', 'CT2025-196-C066', 1, 'catalog', NULL, NULL, 'configured', 81, 'Migrated from door_designs.id=95', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(82, 14, 'window', 'CT2025-196-C067', 'CT2025-196-C067', 1, 'catalog', NULL, NULL, 'configured', 82, 'Migrated from door_designs.id=96', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(83, 14, 'window', 'CT2025-196-C068', 'CT2025-196-C068', 1, 'catalog', NULL, NULL, 'configured', 83, 'Migrated from door_designs.id=97', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(84, 14, 'window', 'CT2025-196-C069', 'CT2025-196-C069', 1, 'catalog', NULL, NULL, 'configured', 84, 'Migrated from door_designs.id=98', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(85, 14, 'window', 'CT2025-196-C070', 'CT2025-196-C070', 1, 'catalog', NULL, NULL, 'configured', 85, 'Migrated from door_designs.id=99', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(86, 14, 'window', 'CT2025-196-C071', 'CT2025-196-C071', 1, 'catalog', NULL, NULL, 'configured', 86, 'Migrated from door_designs.id=100', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(87, 14, 'window', 'CT2025-196-C072', 'CT2025-196-C072', 1, 'catalog', NULL, NULL, 'configured', 87, 'Migrated from door_designs.id=101', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(88, 14, 'window', 'CT2025-196-C073', 'CT2025-196-C073', 1, 'catalog', NULL, NULL, 'configured', 88, 'Migrated from door_designs.id=102', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(89, 14, 'window', 'CT2025-196-C074', 'CT2025-196-C074', 1, 'catalog', NULL, NULL, 'configured', 89, 'Migrated from door_designs.id=103', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(90, 14, 'window', 'CT2025-196-C075', 'CT2025-196-C075', 1, 'catalog', NULL, NULL, 'configured', 90, 'Migrated from door_designs.id=104', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(91, 14, 'window', 'CT2025-196-C076', 'CT2025-196-C076', 1, 'catalog', NULL, NULL, 'configured', 91, 'Migrated from door_designs.id=105', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(92, 14, 'window', 'CT2025-196-C077', 'CT2025-196-C077', 1, 'catalog', NULL, NULL, 'configured', 92, 'Migrated from door_designs.id=106', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(93, 14, 'window', 'CT2025-196-C078', 'CT2025-196-C078', 1, 'catalog', NULL, NULL, 'configured', 93, 'Migrated from door_designs.id=107', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(94, 14, 'window', 'CT2025-196-C079', 'CT2025-196-C079', 1, 'catalog', NULL, NULL, 'configured', 94, 'Migrated from door_designs.id=108', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(95, 14, 'window', 'CT2025-196-C080', 'CT2025-196-C080', 1, 'catalog', NULL, NULL, 'configured', 95, 'Migrated from door_designs.id=109', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(96, 14, 'window', 'CT2025-196-C081', 'CT2025-196-C081', 1, 'catalog', NULL, NULL, 'configured', 96, 'Migrated from door_designs.id=110', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(97, 14, 'window', 'CT2025-196-C082', 'CT2025-196-C082', 1, 'catalog', NULL, NULL, 'configured', 97, 'Migrated from door_designs.id=111', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(98, 14, 'window', 'CT2025-196-C083', 'CT2025-196-C083', 1, 'catalog', NULL, NULL, 'configured', 98, 'Migrated from door_designs.id=112', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(99, 14, 'window', 'CT2025-196-C084', 'CT2025-196-C084', 1, 'catalog', NULL, NULL, 'configured', 99, 'Migrated from door_designs.id=113', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(100, 14, 'window', 'CT2025-196-C085', 'CT2025-196-C085', 1, 'catalog', NULL, NULL, 'configured', 100, 'Migrated from door_designs.id=114', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(101, 14, 'window', 'CT2025-196-C086', 'CT2025-196-C086', 1, 'catalog', NULL, NULL, 'configured', 101, 'Migrated from door_designs.id=115', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(102, 14, 'window', 'CT2025-196-C087', 'CT2025-196-C087', 1, 'catalog', NULL, NULL, 'configured', 102, 'Migrated from door_designs.id=116', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(103, 14, 'window', 'CT2025-196-C088', 'CT2025-196-C088', 1, 'catalog', NULL, NULL, 'configured', 103, 'Migrated from door_designs.id=117', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(104, 14, 'window', 'CT2025-196-C089', 'CT2025-196-C089', 1, 'catalog', NULL, NULL, 'configured', 104, 'Migrated from door_designs.id=118', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(105, 14, 'window', 'CT2025-196-C090', 'CT2025-196-C090', 1, 'catalog', NULL, NULL, 'configured', 105, 'Migrated from door_designs.id=119', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(106, 14, 'window', 'CT2025-196-C091', 'CT2025-196-C091', 1, 'catalog', NULL, NULL, 'configured', 106, 'Migrated from door_designs.id=120', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(107, 14, 'window', 'CT2025-196-C092', 'CT2025-196-C092', 1, 'catalog', NULL, NULL, 'configured', 107, 'Migrated from door_designs.id=121', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(108, 14, 'window', 'CT2025-196-C093', 'CT2025-196-C093', 1, 'catalog', NULL, NULL, 'configured', 108, 'Migrated from door_designs.id=122', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(109, 14, 'window', 'CT2025-196-C094', 'CT2025-196-C094', 1, 'catalog', NULL, NULL, 'configured', 109, 'Migrated from door_designs.id=123', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(110, 14, 'window', 'CT2025-196-C095', 'CT2025-196-C095', 1, 'catalog', NULL, NULL, 'configured', 110, 'Migrated from door_designs.id=124', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(111, 14, 'window', 'CT2025-196-C096', 'CT2025-196-C096', 1, 'catalog', NULL, NULL, 'configured', 111, 'Migrated from door_designs.id=125', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(112, 14, 'window', 'CT2025-196-C097', 'CT2025-196-C097', 1, 'catalog', NULL, NULL, 'configured', 112, 'Migrated from door_designs.id=126', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(113, 14, 'window', 'CT2025-196-C098', 'CT2025-196-C098', 1, 'catalog', NULL, NULL, 'configured', 113, 'Migrated from door_designs.id=127', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(114, 14, 'window', 'CT2025-196-C099', 'CT2025-196-C099', 1, 'catalog', NULL, NULL, 'configured', 114, 'Migrated from door_designs.id=128', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(115, 14, 'window', 'CT2025-196-C100', 'CT2025-196-C100', 1, 'catalog', NULL, NULL, 'configured', 115, 'Migrated from door_designs.id=129', '2025-12-16 19:07:52', '2025-12-16 22:42:35'),
(116, 14, 'window', 'CT2025-196-C101', 'CT2025-196-C101', 1, 'catalog', NULL, NULL, 'configured', 116, 'Migrated from door_designs.id=130', '2025-12-16 19:07:52', '2025-12-16 22:42:35');

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `project_items_view`
-- (See below for the actual view)
--
CREATE TABLE `project_items_view` (
`id` int(11)
,`project_id` int(11)
,`project_name` varchar(255)
,`product_template_id` int(11)
,`product_code` varchar(50)
,`product_name` varchar(255)
,`product_type` enum('door','window','glass_wall','railing','roof','stair','other')
,`product_category` varchar(50)
,`aluminum_system` varchar(50)
,`quantity` int(11)
,`width_mm` int(11)
,`height_mm` int(11)
,`glass_type` varchar(100)
,`preview_image` varchar(255)
,`location` varchar(255)
,`notes` text
,`snapshot_config` longtext
,`bom_override` longtext
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_logs`
--

CREATE TABLE `project_logs` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `log_type` enum('status_change','progress_update','note','file_upload','other') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_materials`
--

CREATE TABLE `project_materials` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL COMMENT 'ID dự án',
  `material_type` enum('accessory','aluminum','glass','other') DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `material_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL COMMENT 'ID vật tư từ bảng inventory (nhôm, kính)',
  `accessory_id` int(11) DEFAULT NULL COMMENT 'ID phụ kiện từ bảng accessories',
  `transaction_id` int(11) DEFAULT NULL COMMENT 'ID giao dịch xuất kho (để trace lại)',
  `quantity_used` decimal(10,2) NOT NULL COMMENT 'Số lượng đã xuất',
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Giá đơn vị tại thời điểm xuất',
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng chi phí = quantity_used × unit_price',
  `item_name` varchar(255) DEFAULT NULL COMMENT 'Tên vật tư (lưu để tránh mất dữ liệu khi vật tư bị xóa)',
  `item_unit` varchar(50) DEFAULT NULL COMMENT 'Đơn vị tính',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vật tư đã sử dụng cho dự án';

--
-- Đang đổ dữ liệu cho bảng `project_materials`
--

INSERT INTO `project_materials` (`id`, `project_id`, `material_type`, `material_id`, `material_name`, `quantity`, `unit`, `inventory_id`, `accessory_id`, `transaction_id`, `quantity_used`, `unit_price`, `total_cost`, `item_name`, `item_unit`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, NULL, NULL, NULL, NULL, 2, NULL, 9, 1.00, 1000000.00, 1000000.00, 'Nhôm', 'cái', NULL, '2025-12-11 08:56:36', '2025-12-11 08:56:36'),
(2, 7, NULL, NULL, NULL, NULL, NULL, 1, NULL, 11, 1.00, 10000.00, 10000.00, 'Kính vip', 'cái', NULL, '2025-12-12 15:46:53', '2025-12-12 15:46:53'),
(3, 8, NULL, NULL, NULL, NULL, NULL, 4, NULL, 12, 11.00, 100000.00, 1100000.00, 'Keo', 'Cái', NULL, '2025-12-14 13:19:18', '2025-12-14 13:19:18'),
(4, 11, 'accessory', 2, 'Bản lề 3D cao cấp', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 85000.00, 85000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(5, 11, 'accessory', 10, 'Bản lề 3D cao cấp - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 85000.00, 85000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(6, 11, 'accessory', 12, 'Bản lề ẩn - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 110000.00, 110000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(7, 11, 'aluminum', 26, 'Đố ngang', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(8, 11, 'aluminum', 29, 'Khung bao dọc', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(9, 11, 'glass', 1, 'Kính cửa', 1.00, 'm²', NULL, NULL, NULL, 0.00, 1000000.00, 1000000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(10, 11, 'other', 5, 'Keo 502', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 9000.00, 9000.00, NULL, NULL, NULL, '2025-12-15 02:57:54', '2025-12-15 02:57:54'),
(11, 9, 'accessory', 2, 'Bản lề 3D cao cấp', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 85000.00, 85000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(12, 9, 'accessory', 10, 'Bản lề 3D cao cấp - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 85000.00, 85000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(13, 9, 'accessory', 12, 'Bản lề ẩn - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 110000.00, 110000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(14, 9, 'accessory', 11, 'Bản lề cửa sổ - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 60000.00, 60000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(15, 9, 'accessory', 6, 'Bánh xe lùa inox', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 180000.00, 180000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(16, 9, 'accessory', 20, 'Bánh xe lùa inox - ViralWindow', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 180000.00, 180000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(17, 9, 'accessory', 24, 'Chốt gió cửa sổ - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 35000.00, 35000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(18, 9, 'accessory', 4, 'Gioăng cao su EPDM', 1.00, 'Mét', NULL, NULL, NULL, 0.00, 15000.00, 15000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(19, 9, 'accessory', 15, 'Gioăng cao su EPDM - ViralWindow', 1.00, 'Mét', NULL, NULL, NULL, 0.00, 15000.00, 15000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(20, 9, 'accessory', 17, 'Gioăng cửa lùa - ViralWindow', 1.00, 'Mét', NULL, NULL, NULL, 0.00, 20000.00, 20000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(21, 9, 'accessory', 16, 'Gioăng kính - ViralWindow', 1.00, 'Mét', NULL, NULL, NULL, 0.00, 18000.00, 18000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(22, 9, 'accessory', 19, 'Keo dán kính - ViralWindow', 1.00, 'Chai', NULL, NULL, NULL, 0.00, 55000.00, 55000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(23, 9, 'accessory', 5, 'Keo silicone chống thấm', 1.00, 'Chai', NULL, NULL, NULL, 0.00, 45000.00, 45000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(24, 9, 'accessory', 18, 'Keo silicone chống thấm - ViralWindow', 1.00, 'Chai', NULL, NULL, NULL, 0.00, 45000.00, 45000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(25, 9, 'accessory', 8, 'Khóa chốt cửa đi - ViralWindow', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 120000.00, 120000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(26, 9, 'accessory', 9, 'Khóa cửa sổ - ViralWindow', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 90000.00, 90000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(27, 9, 'accessory', 1, 'Khóa tay gạt inox 304', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 250000.00, 250000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(28, 9, 'accessory', 7, 'Khóa tay gạt inox 304 - ViralWindow', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 250000.00, 250000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(29, 9, 'accessory', 22, 'Nẹp che khe - ViralWindow', 1.00, 'Mét', NULL, NULL, NULL, 0.00, 10000.00, 10000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(30, 9, 'accessory', 21, 'Ray trượt cửa lùa - ViralWindow', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 250000.00, 250000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(31, 9, 'accessory', 14, 'Tay nắm inox - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 95000.00, 95000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(32, 9, 'accessory', 3, 'Tay nắm nhôm đúc', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 120000.00, 120000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(33, 9, 'accessory', 13, 'Tay nắm nhôm đúc - ViralWindow', 1.00, 'Cái', NULL, NULL, NULL, 0.00, 120000.00, 120000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(34, 9, 'accessory', 23, 'Vít bắt cửa - ViralWindow', 1.00, 'Bộ', NULL, NULL, NULL, 0.00, 25000.00, 25000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(35, 9, 'aluminum', 27, 'Đố dọc', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(36, 9, 'aluminum', 26, 'Đố ngang', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(37, 9, 'aluminum', 29, 'Khung bao dọc', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(38, 9, 'aluminum', 28, 'Khung bao ngang', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(39, 9, 'aluminum', 2, 'Thanh dọc cửa đi', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(40, 9, 'aluminum', 13, 'Thanh dọc cửa đi', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(41, 9, 'aluminum', 17, 'Thanh dọc cửa sổ', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(42, 9, 'aluminum', 25, 'Thanh dọc cửa xếp trượt', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(43, 9, 'aluminum', 9, 'Thanh dọc lùa', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(44, 9, 'aluminum', 20, 'Thanh dọc lùa', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(45, 9, 'aluminum', 5, 'Thanh ngang', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(46, 9, 'aluminum', 1, 'Thanh ngang cửa đi', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(47, 9, 'aluminum', 12, 'Thanh ngang cửa đi', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(48, 9, 'aluminum', 8, 'Thanh ngang cửa sổ', 1.00, 'm', NULL, NULL, NULL, 0.00, 5000000.00, 5000000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(49, 9, 'aluminum', 11, 'Thanh ngang cửa sổ', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(50, 9, 'aluminum', 16, 'Thanh ngang cửa sổ', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(51, 9, 'aluminum', 10, 'Thanh ngang cửa xếp trượt', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(52, 9, 'aluminum', 24, 'Thanh ngang cửa xếp trượt', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(53, 9, 'aluminum', 15, 'Thanh ngang dưới cửa đi', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(54, 9, 'aluminum', 19, 'Thanh ngang dưới cửa sổ', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(55, 9, 'aluminum', 22, 'Thanh ngang dưới lùa', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(56, 9, 'aluminum', 14, 'Thanh ngang trên cửa đi', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(57, 9, 'aluminum', 18, 'Thanh ngang trên cửa sổ', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(58, 9, 'aluminum', 21, 'Thanh ngang trên lùa', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26'),
(59, 9, 'aluminum', 23, 'Thanh ray lùa', 1.00, 'm', NULL, NULL, NULL, 0.00, 50000.00, 50000.00, NULL, NULL, NULL, '2025-12-15 03:44:26', '2025-12-15 03:44:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_pricing`
--

CREATE TABLE `project_pricing` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `item_type` enum('aluminum','glass','accessory','gasket','glue') NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_code` varchar(50) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quotations`
--

CREATE TABLE `quotations` (
  `id` int(11) NOT NULL,
  `quotation_code` varchar(50) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `quotation_date` date NOT NULL,
  `validity_days` int(11) DEFAULT 30,
  `status` enum('draft','sent','pending','approved','rejected','expired') DEFAULT 'draft',
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `profit_margin_percent` decimal(5,2) DEFAULT 20.00,
  `profit_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `bom_calculated` tinyint(1) DEFAULT 0,
  `glass_area_m2` decimal(10,4) DEFAULT 0.0000,
  `aluminum_weight_kg` decimal(10,3) DEFAULT 0.000,
  `installation_cost` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `advance_amount` decimal(15,2) DEFAULT 0.00,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quotations`
--

INSERT INTO `quotations` (`id`, `quotation_code`, `project_id`, `customer_id`, `quotation_date`, `validity_days`, `status`, `subtotal`, `profit_margin_percent`, `profit_amount`, `total_amount`, `bom_calculated`, `glass_area_m2`, `aluminum_weight_kg`, `installation_cost`, `notes`, `advance_amount`, `created_by`, `created_at`, `updated_at`) VALUES
(15, 'BG-2025-0006', 9, 7, '2025-12-14', 30, 'approved', 1000000.00, 0.00, 0.00, 1000000.00, 0, 0.0000, 0.000, 0.00, NULL, 300000.00, NULL, '2025-12-14 15:03:20', '2025-12-14 15:10:31'),
(16, 'BG-2025-0007', 10, 7, '2025-12-14', 30, 'approved', 21800000.00, 0.00, 0.00, 21800000.00, 0, 0.0000, 0.000, 0.00, NULL, 6540000.00, NULL, '2025-12-14 15:21:18', '2025-12-14 15:21:48'),
(18, 'BG-2025-0008', 11, 7, '2025-12-14', 30, 'approved', 3000000000.00, 0.00, 0.00, 3000000000.00, 0, 0.0000, 0.000, 0.00, NULL, 900000000.00, NULL, '2025-12-14 15:31:55', '2025-12-14 15:38:10'),
(21, 'BG-2025-0009', 14, 13, '2025-12-16', 30, 'approved', 72000000.00, 0.00, 0.00, 72000000.00, 0, 0.0000, 0.000, 0.00, NULL, 21600000.00, NULL, '2025-12-16 07:59:23', '2025-12-16 08:00:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quotation_items`
--

CREATE TABLE `quotation_items` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `item_type` enum('material','labor','other') DEFAULT 'material',
  `bom_item_id` int(11) DEFAULT NULL,
  `snapshot_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`snapshot_config`)),
  `cost_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cost_snapshot`)),
  `price_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`price_snapshot`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quotation_items`
--

INSERT INTO `quotation_items` (`id`, `quotation_id`, `item_name`, `quantity`, `unit`, `unit_price`, `total_price`, `item_type`, `bom_item_id`, `snapshot_config`, `cost_snapshot`, `price_snapshot`) VALUES
(5, 15, 'cưa', 1.00, 'bộ', 1000000.00, 1000000.00, 'material', NULL, NULL, NULL, NULL),
(6, 16, 'Cua chinh', 4.00, 'bộ', 1200000.00, 4800000.00, 'material', NULL, NULL, NULL, NULL),
(7, 16, 'Cua so', 8.00, 'bộ', 1000000.00, 8000000.00, 'material', NULL, NULL, NULL, NULL),
(8, 16, 'cau thang', 3.00, 'bộ', 3000000.00, 9000000.00, 'material', NULL, NULL, NULL, NULL),
(10, 18, '112', 3.00, 'bộ', 1000000000.00, 3000000000.00, 'material', NULL, NULL, NULL, NULL),
(12, 21, 'Cửa đi 1 cánh mở ngoài (1200×2200mm)', 5.00, 'bộ', 1000000.00, 5000000.00, 'material', NULL, NULL, NULL, NULL),
(13, 21, 'Cửa đi 1 cánh mở ngoài trái (1200×2200mm)', 4.00, 'bộ', 1500000.00, 6000000.00, 'material', NULL, NULL, NULL, NULL),
(14, 21, 'Cửa đi 1 cánh mở ngoài phải (1200×2200mm)', 5.00, 'bộ', 1200000.00, 6000000.00, 'material', NULL, NULL, NULL, NULL),
(15, 21, 'Cửa đi 2 cánh mở ngoài (1200×2200mm)', 5.00, 'bộ', 2000000.00, 10000000.00, 'material', NULL, NULL, NULL, NULL),
(16, 21, 'Cửa đi 2 cánh mở quay ngoài (2 cánh bằng) (1200×2200mm)', 5.00, 'bộ', 2200000.00, 11000000.00, 'material', NULL, NULL, NULL, NULL),
(17, 21, 'Cửa đi 2 cánh lệch (cánh chính + cánh phụ) (1200×2200mm)', 5.00, 'bộ', 2300000.00, 11500000.00, 'material', NULL, NULL, NULL, NULL),
(18, 21, 'Cửa sổ 1 cánh trượt (1200×2200mm)', 7.00, 'bộ', 1100000.00, 7700000.00, 'material', NULL, NULL, NULL, NULL),
(19, 21, 'Cửa sổ fix 1 ô (1200×2200mm)', 10.00, 'bộ', 800000.00, 8000000.00, 'material', NULL, NULL, NULL, NULL),
(20, 21, 'Cửa sổ 4 cánh mở quay (1200×2200mm)', 4.00, 'bộ', 1700000.00, 6800000.00, 'material', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `railing_templates_view`
-- (See below for the actual view)
--
CREATE TABLE `railing_templates_view` (
`id` int(11)
,`code` varchar(50)
,`name` varchar(255)
,`product_type` enum('door','window','glass_wall','railing','roof','stair','other')
,`category` varchar(50)
,`sub_type` varchar(50)
,`family` varchar(50)
,`aluminum_system` varchar(50)
,`aluminum_system_id` int(11)
,`preview_image` varchar(255)
,`template_json` longtext
,`param_schema` longtext
,`structure_json` longtext
,`bom_rules` longtext
,`default_width_mm` int(11)
,`default_height_mm` int(11)
,`glass_type` varchar(100)
,`description` text
,`is_active` tinyint(1)
,`display_order` int(11)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `roof_templates_view`
-- (See below for the actual view)
--
CREATE TABLE `roof_templates_view` (
`id` int(11)
,`code` varchar(50)
,`name` varchar(255)
,`product_type` enum('door','window','glass_wall','railing','roof','stair','other')
,`category` varchar(50)
,`sub_type` varchar(50)
,`family` varchar(50)
,`aluminum_system` varchar(50)
,`aluminum_system_id` int(11)
,`preview_image` varchar(255)
,`template_json` longtext
,`param_schema` longtext
,`structure_json` longtext
,`bom_rules` longtext
,`default_width_mm` int(11)
,`default_height_mm` int(11)
,`glass_type` varchar(100)
,`description` text
,`is_active` tinyint(1)
,`display_order` int(11)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `stair_templates_view`
-- (See below for the actual view)
--
CREATE TABLE `stair_templates_view` (
`id` int(11)
,`code` varchar(50)
,`name` varchar(255)
,`product_type` enum('door','window','glass_wall','railing','roof','stair','other')
,`category` varchar(50)
,`sub_type` varchar(50)
,`family` varchar(50)
,`aluminum_system` varchar(50)
,`aluminum_system_id` int(11)
,`preview_image` varchar(255)
,`template_json` longtext
,`param_schema` longtext
,`structure_json` longtext
,`bom_rules` longtext
,`default_width_mm` int(11)
,`default_height_mm` int(11)
,`glass_type` varchar(100)
,`description` text
,`is_active` tinyint(1)
,`display_order` int(11)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` enum('admin','user','manager') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `avatar_url` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `full_name`, `phone`, `email`, `address`, `password`, `user_type`, `is_active`, `last_login`, `created_at`, `updated_at`, `avatar_url`) VALUES
(1, 'Văn Thị Cẩm Ly', '0866025044', 'hai2504le@gmail.com', 'Hà Đông', '$2a$10$u4dRYgM9k9pfyOelSYzaR.httYqQoX23ixTtcBuHRaVrbK6KPVM4u', 'admin', 1, '2025-12-05 12:39:45', '2025-11-26 15:14:49', '2025-12-05 14:38:57', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAEsAKUDASIAAhEBAxEB/8QAHQAAAAcBAQEAAAAAAAAAAAAAAAIDBAUGBwEICf/EAD8QAAIBAwIEAwQIBQQBBAMAAAECAwAEEQUhBhIxQRNRYSJxgaEHFDJCkbHB0RUjUuHwCDNicvEWgpKiJLLC/8QAGgEAAgMBAQAAAAAAAAAAAAAAAQIAAwQFBv/EACIRAAICAgMBAQADAQAAAAAAAAABAhEDIQQSMUETIlFhI//aAAwDAQACEQMRAD8AwvWdds0k5LO2ibH3ygqtz3fMpBC77nHf301keRsFsIjfOkykZbclh/xqhRoLk36dKyTtyxjmPpQaJYR7ftv5Dp/euyXMcSgKvKPJT195pNbyTBIIROmfOjQKFQjyjLDkUnvRHkhgyEAz5nc00muHY7NtSBYk7naiQXnuy5woz6mm5Zy253rjLy4x0Nd27ZqBo6o3o2PWuL1o4GaAwUKc5BpSGPfJNcJIIUUrEjscBTRojFQ5AwNq6G6bBj60bwWzjpRigVtgeneoC0F5S/tHGT6UvHHGQeYnYdhXI0c4XB39KdxWjDKlCxHfGKZFcnSCQRQE4kG3oachbWNMiN+b1bI/Kl0gPJtbovbIBzSkNuC/LyZPQnmHemEEIpUI5Y4oyx78uT+VKeCxAwqe7kqVs2tbdXEnhEjoroSM9OxprPNK+RHDDg9AoIA/D96jChk9qoPtqMny2oU5YXRwTDbpnsQ1CkHsqPMWbJOfea7JIwwowBTZck53oxUkjLACjVBDnmUE4yfM70ixLdck0YEKcAFj59qVFzcrtHlfcKAUN1Riw2J8gB1pVbWc+20QUD+s8oo3jXjDl8WXBPTmOK6Fucf70mP+xo+gOC3klOZJOUeSoT+QxRvq8a4wZGP/ACAUfM0tDaSSKXmkbHT2j1peG1tl3O+/lmpSD2GiwIT2z6N+1OYbEvk4wo+dSECwqQIlUE9GYZxT1YVRA5uFc53ABz+VShXMi1seUZWNyT3NLw6XPKNgQ2OlTVsqCMv4hA7jpRvGXnAiVR/UQMH4E5NOoorc2yNt9EuipkfKKO7DHzNKQ2cMb4ebnGDnOOtSqW7yRiWWZ2I33OAR8c0m/JlVjDEnY4UAfic1KQE3YzZgqGNYsx46YAFM5pT4hbAUHtj/ADNSs4kKlZOcoM4DNUZKkRf+TEpPTrnH40nhYlYEvpQAG9oDpmjS6hzlS1vG2B3zRPq853cxID/zGaUjs1OMyc3qooWFRsJ9Yt3YNJCV8xGxH504jlt2xyGXbs5z+tLppI2IwQO560+h0N2QOcKM7HY5oFigRuSPsu6+5KFS40qVBjlJoVKD1M6d7cj2FfHrtSTEHoDTvlgKjliJxSyAcuFtFHqxNNaKxlGoxuN6VQEnCpmnJypAUKcdgK64mcjJwKlgbCKsgGeflHcCgxXI9rNLJaTMQWUhf6idqdPYGNQzMFz09g7/ABIqCuQ0iQMwO4HXfpTm3t8n7JwfPb5b0rbWiM+7scdgBUlDaR8yq4VWzuGGT8RUoWyPjjAYqOQMDtsxP4AGpS2sb+7IPKzL28QcvyG4pzG8dqSI4Y2fqSzhQPeN64+qySuPEuDIAfZS2TA/+Rp0gN2KvpcNsA15Osh7oD/hpL61aQ+zbwq8gGBvSbFZ3LSQlieihy7H4Dp8TTiFJ0l8RbaO1CgAM6cxHw7/ADosCVnUhllk/nIEAGfID4UW4ji35HGwweX9z+ldu5V8TMztMW+1zDAz22HSkkgaUAhDy/1HYYpGyyMGxo6My8qE83qSaQWzYtu5O/QVNRabJIPEZxGnmepp7a6dHzERAt6sMUjkaY4myL07TWZgBGG/7CpuDSQQDhc+SLUnpmlyDAKb/jVl03SWZwpXAHciq5TNMMKS2V3TeH5ZmBI5V/pxuanv4CqlURFc9enQVbbKxRIxkYXGBtvUzpukC4YOyBEI2BG5x3NJ2ZYoxWikW/D8zRgraRkHuUJJ/DpQrU4tOjiGOTJPUsxH4AUKliNqzw8JGJ9kke4YFdwWbLxpnzJNIozE4waWVct/MYgVec8OrKh2SPPXZc/nS0c07SAoEj8mCquKQzArbFmz0wacwRmRSVjfH9ROMfGjRXIVkikcZub5mXz5iR8/0rkRskdViiedu/O2FPyzSkFvboC0ivO39Ibb4kj9DTiM3TBksoUhbpzou49xO/6elMkJ6KozL/MdBAndE9jb3nc03kvIgU5GJUbAdh8P3zSkOjl5Abyfc9d85/z3VJfVLS3jXwoo0YfePtEn8h8qgaQygt7u45XMIEec5fOPnt8ql7fT7UKbi7mmu2x9gAIoPlnuPhTG91G0gkX6xI74G+TzfDH7Ukl9c3kxMUQhiHeTqB7u1FMKTJb63DEAsahcdApwBUfPftIzHlKjsSetIscsMF5Cew7nzPnThUWJgJgqPyg4x9nNK5WPCGw0EEsoVpgijHs837Gpe0ibkVY4x78ZppYRxrIZXYOzHY+Qq16Glu8oRsYPT1pHdGyEUhnZ6VLLjnBbvip6w0WXACQjfzNWSy0+MKgQLk9MCp2y0hmlRCSARk4qls0JpELouhHqT335Bk1cLPR1ijDCMqB3PWpbTbGK3QLGqqcU+RCzBCO/XG1KTs2RdvpaqBzLzMe59al4LRVAXoBjptn0pxGqIBkZ3604jQbsNz8qJLEPqqE5kHN5DsKFOvaHUChQorZ4LOnCROWS8WFRsFWMb/gaROnW6OB9YaRfILv+dOHnkdh/LUY38zSbNdNn+ZyLn7zhRWykcy2GjjtYQTFbEDHVwTj9KWjniUMZSu/kgb86aBoskyOPeMnPuooS1b2mll/9oGPxNQFseQ3lspZzBzHzkblH4DejfXOYN4cUhY9/sqB76YxzWiBiLOWU9nZ9vypOW/uG+zEIgPNd6lhokkupBgGNWI3PLsB73NMbrUJFfEk/Ip+7D7Z/E7fgaYzTXMzbyAnz60paW6pJ4sjtNIOgAwB8aFjKI90y1dmM4hJAP+4/Qe81JPPzYhjx4YPMQoxv5n/CaZ+OWjCli46kClbeF5cKPZUnpS2XRhZ1ryRHIgIDEYJH6Uextp5pC7c7H1qxaRw6JIkldMknbNaNwtwnAnI0wDHOSAuN/fSOaRqx4WzNLLTr/kBELnHYAmpW1SaGQFyysvXGa3ew4bs3jVWiA9MYp3ccHaXcR8ot4kY+Qpf0LHhrwyDReITazIksjsM+daDw9xHbTy/bBJ7eVQHF30Zzxu1xpkm/9ONqpJtdZ0m8HOZYyrYxQtMCi16eiLK5ilAIYEntTxSSSV2xtvWY8GcRM7Kk8vM3QA9c1othN4sQ5TljvtStUPRLW6IsfM5znzp5GoI22phaqQAGPMaexnlO/SoRoV8NPX40KTL5Oc0KgrSPnubp4wSPaPrSUck07FiWX3bUI0bm55pCfJRsDXJSQck/AVqbObSFTyjG/M3c9hRHkWP2iS7eRO1Iczs22w9KOLeeUhY4yfNqFkoSkkZjmRsnsM0rFbSzpzjCRKMszHAFO7e0tbZWeYfWJuyjoPef8+FMtQ1BWk5WMbhRsifZH4VAoULmIFogI4ugY/e93nRPrEroUAbB8zTJZ3nfmkOT5dh7qltHt3uJkjVScnyoWPGNkzwJY/xA3NlIgEsZDrnrjv8ApV10bhsrcqGB2NVy2iuOFeKbHUJoj9XuI8MM4B7HP4it4h0gXNjHeWsYRygbkOO4z/nuqmUtm7FBNU/SI0uwiikQcgCpg1ZrK9tLcjxJY097AVUxJq9zdy2kVgqLF/uys5wvpt1PpTFtZ0TTNSaGe0e4z94gsR/8SoO9I4uRc5LGvDW9K1rT5Ps3UXv5qsdlNBOgZJUbbqDmsb0v6ROGdPtzBe2bxcwxFzRueYdMkg7VebDj/gLU+UWzJA2AoYOyDm8suM/Km/F/Cl8mP1FtnTKlWGxqo8SaDbXJZxCpbHlUxp2piZiEmW4gO6nqV9Mjr8cU6d45lJX51TJSiy6MotaMgm0CW0vPFOQO3KK0bhMypaxxuxbA6nqaLf2aNJgqMZp5o0RVgMYFFSsZxSWixWynY08QUhbjYU4zgdKYqYR0BNCiyOA3lQprQKZ88+fmzy7+tBIXc9Me+lhKEGFRR643o6MqgtIQSeg8q0nLTCJHHEvMwHvNIX+rukZji5Rt15Rmi3lwGBHMWbz7Codz7R5tzQCgXFzcTn+bI7L5E7URd9gK4aVt5mh+xgMerY3Hu8qg3UcWkR58Ns2dx5VpX0daUJruMldl3Y4rOdJXnnUeZrdvo2tljhTAGTjJqvI9Gnjxt7LJxjwQ3EXCLQW2BeQHxYMnHMwH2fiMj34q78A22k2uh22i6rfz6bfwwhE8c4WQAYOCQVPTuy9qkdFh/lISNsdKLxCgudU0yz8IOOYucjp90fM/Kqoy+M2Sx3tCFro0cemSJzPIk0jkO+OZ15jgnG2T1226VFXPCtjcIIZUUqGyjAbqa0O4sgbdY0GFRQAPIVXr2G4gcqwYL5ig5UzTCFqmYd9JXD82ma3Erwk20keIZO2e4quabZgXpjnQMBkBD54r0ZNb215b/VLq2iu7cnLJMM/h3FMtK4S4Wt9RF6NL5JQQQjOWRT6CrI5UkZMnDlevCvaBo2pcP8K2GpRM0YO80BOzIWODjzxWj6UVn06C5jkwXXOeoNDVrf8AiNlJaoUCMpG5xQ4T025seHIbS7KtNGzdOgGdqonK2WQxqMN+nb1YBD4jsInXv91v2/L3U50yNcA4rstuXJVlDKeoNH4fVY7yawJyU9tAfLy/KpFAb1RKxjC52oSPgUrIhVdxTC7kCgnNM3RWvRvd3HK4GM/GhUbPLzPu3zoUllvRHhlyqDmLAnyG9JIxkJc9OwFAKH3NKqmFAA6VuuzjVQwujgEYA3zUc+Sc5qR1AAOQNzUewojIKKHeud9qGdqA1kvoK81xGB3YV6K+ju1CwwsRtgGsA4Oi8W+iGM716T4JhMcMeRsAKqyGzjrVmmaXGBCuPKko7fxuNrdGH+3bCT5v/b8KdaUP5Sg9xR7WM/8ArUSn71mFA9xaqom1+FmEY5QMUhdWUco3GaeJ9mj8vejVjplbn0JSSUJGaQXRplOM5q1EDFc5R5ZpeiY36SRB2umujDmYY7ipMIqIBgU49gE5wKZajMsUbMSAoGcmh1M85NsSlIByelQ9jPK/El2bNmMsUHIAIy+Wyp36AbedM73VzGZp52MdvEgkBH3h/fbFTn0e6fONKfVZ1KTX7eLg9l+6PmT7iKdKkVNDt9UhykV2JbSQgAmaLlTPf2gSK7f2M6w+LIuI2+y43U/HpSl5KROI5VyDTfUD9W02eSwnezlCEgxMFUnHdT7J+INI3Yyi0V7U42gdMty8wJ6E5/ChUPq2uyajJF/CbJkjhjCyeMc+13CleoHnQpehYnKjx6ImpRYsL06DJp7DEJCGx0zSV7HyqwX7uFz2PrW6jiX8K7e5aRz60ydd8VJToGV9uhJz570xlXDYNEZCDCiHIpWT0opBA6VPgWi2fRxyyamq+Rr0rwnHiGMe6vL3At19V16HJwGODXqLhFw9qpznOKoyem7jv+JoOmNsoFSTxEX1pdr9wlXH/E/586idKJ5QasFsVZcMAc1UjX2JdFGBjpjY+dKKNqbwyBFAC5XypxGyH7J38qdE7f2cZdtqbyvy5HlTp+nSoq/ZwcKDQYbsHi4cktUVxAXurWSCJhzMvIfjStxIIoy8rhB5mqvcT3uvXxsdJMlva55bm8I6juq0EJITsrWbibV4NK5g2mWPL9bdBhZXUbKPPPU/+K12JQlrygAKBgAdqgeHtNttNs4rW1TkRR17k9yT3NTrsBARTP8AwoUWV/W5UjJYjp0qA1kteSRaeCS0jbgeQ65qX1f27gI3Qe0fdUdw5bi61G61OU5w5jiHYY6/561U/TTFDeXTIYAsSRhVUY22oVZGhRjllBoVKLO9HhxYVhtU9tclgAPPzb86i9XkwFQjlAY5Of8AOmal7yUB0VSp8FdgepJO36/jUFqxUyyISSq+wT38z+lb2ebiRcR/lsjY5gSKZSjLnansgzMSAcEDr501IJkbboaUtQ35M0Cu29OUiLPgVySFg5GNqno4nayPBcJMhIZGBFen/ou1CO+0m3lVvtIPyrzEUxtWq/QdxALadtMmfBB5o89x3FV5FqzTxpbo9P6UMxqRmp+1X2R51V+HblZoUKsDVqtfs59KzpmxjyJWxtS6ocbgUlC4BwTTyMgjINEil/YiyMBsT+NQuo6tcWrNEbeLJGxcHerGTUXrunpfQY+y6/ZYdqFteDx6t7IILHqAEl4RJt9kDC/3+NLW0sEVyIY+RVHQAYAqtcRaZxBHbvHZ3rQ56NGgzVd4WudatLxotWma4ZTtIwwxHrSObNMcCb0bTaMpVSCKczkBetVPTtWQoCXwKc/xmOa4EKyZbGTjtTqaoqnhaO6tzeJJKNx4ZovC6cmjR4GCWYn35NLsRK2OXKgYPrSNjKLMm2lBVAcq3YigtirRJE0KTaRScg5HpQqykI2eGpZgbp5Qq8qnlXPcgYB/HH41BKBI0jPkgH8ST/apK6dltyQ33D08h3/Ooy2bEbAjJIzjyxitbZwIoj5iVkMZORnY+dHtrZpFLgHrXJFEkxCnO+M1Y7O2A4eB5Rzht/PJ6b+6lL0tEJYQl5iAucdakbix8ZwYhzAKM121R7eWWVUBA2Zcds9ako3iQHlRuh69zUGort5YmNC/IdjRNIuJrDUIruHKtG2RirI8QuoFjCcp8/8APgaQk0kRxl/DxjOaWTpbHxxd2j0F9GXEK3tnA/PsyjO9a5pk6umc9q8nfRxqUunXa27MQhbK/qP1r0Rwvqfi2yENnIrG9M6SVxTLu3+2cdcUS0v0JMRbDDtSFvOGjGTvULxHayyj6zZzmK4j3U9j6GmT0SMLdMuKycwBzXSc+tZnpfHT6fcLaa1GYsnAl6qfjV4stc0+6RTHcIeb1qJpjSwTj8JN4kYbqD8KhdZ4dguZBLFHysepFS0d1CXCrIDmnXNtnrQaTJGcoMrEXDyxxhQevWnek6DBaSeIBk+tTTOB5ZrofA7UOiJLNN+iMkCYwBiou/gJB2518qkri4Vd2KgepqA1nXbaytpZZZY1RFJZicACpdeAi2iMlufq8hjjlmiH9KttQrFuL/ppRNWaPRrGO5gXIMshIDn0A7UKtUMjRW8+JPbMbx43ImNpGCe4Co+WTkLlBnxFIA9DUkFWGAOx3OCMdhg/2qMUhmZwM+yFH7/OtZxoi2j2P1i5hjXq7gH3E1cdQtEgmuLcLlefn5SN/wDiMdu9RPCmba5guguSrjAPTrVos7eS9nurqQErkbg5Of8AM0poxoaaBpn1aezuL2PmguX8HGOoYflvVvsOBYYrnwbvmQFjyNjY7dPfSlrbQTNodkRk/WYmIO2wXetS06xF9poaSJyFOzN1byPv/eqMk/6N2PGjPbngaGG1c29qWO5VmfYHGKqNzpMkUhiukwy7Z65Fby1u8UIjJ54+mcdKq/FmgpdQc9umJVGx23Hf5n86o/R/TRHErMgFobZsgEMp643x1FapwDquURHbcioRNHjuQDKvK2fDlUDdW7H3U60jS5LVZVDMstu+xxjIwD8wc1U52zXHDqjYLOXnQcp7U21kzx2zyR5OKh+HNUxiG4IDAbHzq8W8Nvd2nKQrKwpk7WjNL/nLZj3EskN3CqyIChfDZ7UW3026tArabeyYwSYpDlfgauPF3BhmV2sjjm+6ehqt6f8AW9NlFvqELxuDy57YFI7Xp6Lg5cWSHUPpfEOppKkExZZVbBB2+FWscXSrAiTSqjYx61DXSaddyB2jjPLsSO5p1ZWMUo5YYcqO/LsPjUTZZyMOFxtotGia9FPF7RZz54pW91hY87hB796znjbjnSuELX6uCLi9I9mCM4I9WPYVhnFHHvEmvyv4l81vAxx4UB5AB6nqfxq6EJyR5fPlxqb0bzxx9JWg6KrLNefWLgdIIjzN8ew+NYJxzx1q/FMhSWUWtjn2YEJx728zVXk5ebJcluu43J9P3NFjtpJJAeQyjGcA4A9/lWnHjUTBl5EpaQ2MUkntDlA7Fu9CpdBCg/m2wmbHQbKvoKFWGahlq7ZYIdiF5dqYRKBGSB1O3uFObl+fJO5XagI8QKgPtvjGPfk/nRvZUkywaHGzW4AGw3Y4q/8ADESNpUrtEH8RyqDG3Tr+H51R9P547aOLJQuOY/rWh6RHzWUNrArtNKqFEXsNv8J9arkzfhhqiwcJWf17i2yYpyx2yuw22yR/Yith0yJBalCozjoB12Gao/BumfUliiRB44DNMcZ36D860KyiYJhiy4PQVmk7ZsqkkR15aBo28JfZJPMp7HPX0qEuLZYpGhkQsGyu/baraYyWbnzJnp2wP8zULq6NHgKpx/n7VW0PBlB1KzFvexuFx4kgic+eSMH5rRWBSZJD0ZRzbdetSnEcTNDsAxQrIfTsPnimd3C8l+8S7gA9O24H6GqJX6bsU/g0ctFBG3NggA5q4cDa+s8JgMoLJ0qla4ORPCDHPSoRLmazdTauyS9QV7U8RcyUtM9Bx3cUigNg++k7nT7K6GJYkYHzFZFDxfqVjZc8zrK42VSNyarlh9M2t3tkJ4bS2jIyJA5JwauSb+GJy/J6dG7x6Ho1uS62sI7nIrKfpi+lOy0iF9E4YaOe+PsPLHgpF2OPM/IfKsw4q+kji/XDJYyXxhgOQ0cA5AR6nrj0zVCvZyAYoHDn7746n9qsx4d2yjNy5te2dvbyS4uZJ7+SS4ncliCx3Y9yeppvCWklCsGfOyovX3ClbSwmnzI2y9SxG1WDRtDubr27SPC82DMw26dF8z7v71q8MFtuyPisba3j8a6nDyn7NvBnb/s2MfhmnlnpV/fMkKWvgx5LBETb4/3xV50Dg9rhVYp4mQcODlnPT2fT1zj31oHD3C9vaRIRHEvKcoR7RB7nJ2z7htQckiVZQ9B+j6UWQMzchbfChT8c9/y9TQrYoLVIlKhnO+SeYjP4daFL3Jo8dSFVRIl3Lsc/Af3o8GGnQEbp7QB8zt+lJBPaD7sEXPTpk4qT0ux8a7heXIQ4yOmw3P51YJGLZNaaGurh0iUyOR3+yo/Wtn4R0v8Ah8c0pk8S4MCkyOBlRynZfLpiqBwZp5lLukfsBG6jYbN3rVeH25C0UsZLiFQc532Ix5bHNZskjq4YUi08MgGe4uAp5Q/Imx6cp+fSrdbDmQNzA7dvM1X+D0KafI8pJIkzsP8AiP3qwB0CKDudvgapY0nsNMQJAAPu1X9XcNMYkOWxv8aeXVzLJK6RHGRjmH+daib5hDzKSVGfaOdx/eklsaCoi9QjRrPuRM4DAdSobb8aKlsB4zkczs/l3IHT0/al4Uknu0lkU+FF7Mca9c43Pv7YqTjteReZwPMnpv1/LFClQ6lTKDxNatGgYbs7YqBWJYgRzA4/3JPXyFWjih/rV94cIJ5Ntvy99QF7E1upBUM4HToq/vUoucr9IHiGdbaweTdFVSxP3m2+VZHHdSROyo4QOxZvIVoPHc8q6QyOxHiZb/tjzrMVA8id61YlSOfyNyHaO03MuXCnc9y5qRttPBSKSSE8p+zGPv47k9/8xRtCtprqVYoLcykEFgB18hWmcL8CXU7m41dvDRhhogfbPoT0Uf8AEZO/Y71cmZJIrvD+jPeSJNcwCZObEVvHkAHzOM4HzrSdH4Yd/Cm1AIGjPsW8a4RB5kdz6nNWDTNLtLGIR2VssRAwCQc4/HP41IxqF7kserHvQbsTwTtbOKGMoigZ6nrmnvLhdjSSsNzj3V0vtSgbDc2Ns0KTJzvQo0gHkK1ga4jdYvaYeyMDrVktYYgy8hwfCQY8iw3+WKYcPeBbRpO+7KuQuftMT0qR0bLWF3cKo9gDH4gfpRlI04oGlfR9EttpV0HXk5o8F/LP/itAS1Md3YSLkoshjYE9c9CfxNVDgyJF00Fnj5rp41JJzynOD+Rq767cW9paiGFi7Rvz+1t2xn51mmzdDwm+GplGlMxLFHkJGMYwMU7nv+duWNHbrjHTHp+9VPhzUn/gFt7LF2Y8vs4H2tsDvVitX8ONQWCO25weZ295pGw9PoqJZlyscYE2/MzEYQe4dqYTRAHdyzD7Uh8/QU95faAb2dvsg5/H1rscAkk+zkDcZG1L6RNILZQqVHskcowo/U031q9AjMEHtytlUHr3Jp5esIIDyZZzsADjNR8VsHmR23AXJPY/2/OgFV6NY7OK0tAD7cvV2PUnvVU1q2LubiTIXry+nYn3+VXm5UzNyqv8sEA4+8fL3VA8Q2+IWLfZALsfM/tTxJdmGfSbMEDbgNIOVV8l7/l86z5AuQBtvUvxprS6txFdNGQbaH+VFjuAdz8TUTYpJc30cESlmdgqgeZrVFUjFkmnLRtf0J6HGLSfUpYSzcwRGPQbZP51pwVQRy7AeQpHRtHfQ9DsdOkZTJHCPEKjYt3+Hb4U5GOwqemefoFPqRRs+dFyK5kURLDkjFFLUUsKIWztUAK8woUiGIoUtEo8yadHLPGsSuPDiRiBjpmrDpto1twlfy86D2lHJyZz1Gc++o8aNe2ICEkezzEgYB6HGadTJPDphgUuyuwVmz/y8qkmdCCNQ4Ms47caV4vPJGsSSYBxjb0wfvE1dNUmiAuUjgH8yHPIqjp5sf3qu8EKbmV54YREoAQFnLkKNu3fJPftUxxNzJo+oTIGVfCKMenM2NvmRWebNMUH4MtWfR7Se4JKmL2BsOVTnoatEcgMZS1iMZI9p3O5phwvpZh0u3jdpJGSMIOYdABj96sEdusa8oGMHO+9KCct0NLa1blBYnHqck04kxBD0GfICnLEJucYFR7ZuJSDspO/oKFCdhvHA1zIZXyEHT1pRYgX5EXOfM/M09KhIwqD/qKNHGI4wgwWc5dvKmqhew3WBCQceyuy+/uazb6eddTh/gW48Fgt1enwIR3GepHuGa1FiFi38q8n/wCoriM6zxodPifNrpqmIAHYyHdj+Q+BqyEbZXkn1izMYCRt186vP0M6c2q/SHo9sEyouRK3/VPbOfwqkxjlG3et1/0o6E0+s6lr0iHw7WEQREjbnc5OPcB/9q0zVKzDjk5SSNq4iTlVXB6HFQ3PirBxSALUHyYVWSwxVUHotyLYqGyNzigWFIeIBXCw+NMVVQqTRC2O9E5jik2eoAWMnqaFNy1CiiWZtqCys/tKhMLFDht9yAfkPnTGeB5lkgjy7+JFGFJ2ySvzqTkjEUMk5b2ZRnf+oY5fzb8BTTh2OTUOItPto5OUGdGBQbkgEk/gKpOr4jbOGLOK00KFI0Gw5Acbk/8Anek+JY1khtbVebklukXkHfBy2fgDU5ZxpDbZKjAUYHf1qOWEz6zaeIpPJmX44x//AFVT9GUiwWqCOFEycgbnNKlgMUQHeiufI0tlYlcMZDyDoOp/SlbSIKCx6Z/E1yJA83KBjl3Y+Rp4sYJGOg6UyQrZxY+Vi56kbe6uYBjcdSe9LsCQPM0jKeVselFuhSr/AEja7Dw5wjqGrSkc0MREan7znZR+JFeJ7yeW5upLiZy8kjFnYnck9TW6f6puJRLdWnDVu+RH/wDkXOD3OQg/M/hWEsPOtWGNRsxcme6QeFOdwAMnO1ezfol4cHCnAljpsihbp18e6238R9yD7hhf/bXnv/Tzwmdf4xj1G6jDafphE0nMNnk+4v4jJ9B616lmnCg5NLnn8Q/HhqyM4umAtVTIyzVVi/lTzX7w3N1gN7CbComSbkUt1x2oQVIM/RyGJoyyInXBzUBqGvQwx4gy8rAhV8j60bRNQ+uI6O2ZU67YyDR0K4SStk4zdxSRIogbA3rhbPaiVh80KT58bdKFMSkUzUrdRYTXE0nKqqHCg4AIBIz8RSv0K2IuOIfrDBv5NsWJJzgu2B/9R86j+LLkLazwoBhm5SM9Adh/+tX36ENMFlww95Iv826k5s/8FGF/z1rM3o6j0X6d8AgEYA2pvpiO+oTzY6KqEH3Z/UD4UoW55SCTyoMt+1L6KCYHlYbyOW/H/wAVV/pL0Ok2bLGjcrHKjBZiAPSuhS7HAyBt8aXjQAjt5mihWxSNFjUIv/nzpVQBRU5ctjz3rrmjYjAGwc5OKieIdSt9M0u71K6cRw20TSO2egAzUgzHJrDv9TvFYt9Mh4YtZMS3X825wdxGDsPiRn4etNCNuhZS6qzCOLNXn17iC91a5J8S6lMmM/ZHZfgMD4VGQQyXFwkEUbSSOwVVUZLE7AD1rjY6mtU/08cMfxDXn4iu4wbSwOIcj7cxHUf9Qc+8rW2T6RMEU8kzaPo24dh4Q4OtNMVV+sEeLdOPvSt194HQegrvFOqXH1aW3sJAs+Ptdh6UtrmqCJTFEfbPyquGQtknfPWskYuTtm1zUdIh/wCO3ckMkgtIyYdpU58Nn0FR0uvNqNzDbQiSBXYBiNzvS3EVswnFzbsyuRyyhfvL3+NRNtbW0ur281ksksf2ygP2SOmT76fZtxyw05Vuiw29lFbqz49pgQWY5PxpbQ7QW/iSk5LHCbY9mlYoScNMQzf0joP3p0GFPpHLnOUvWKliRRecAUQvt1onPUTsrFs5oUiG9aFEhQ4rWbXOL00uIDlLhXZd+XAyxPu3HwrdtLhis7JYIVCxRgKoHYAAfpWWfQZZwut/qThmuS/h8xPbqa1InCtjuRWSTOrLYuf9g748Q7/H+1SNsPDt0jUEMwx8Ov61HMf58K9uUmpa03iVj1NLYno+gjVIwO+K6wya7IeWIkeVEQls57bUfRArS8gVcE570GLY3G3vroGCaI5ITNEhHcQ6tZ6PpFzqN5KI4beMu5Pp+teMOMNcu+IeIrzWLonnuJCwU/cXoq/AYrbf9TGqXiWljpaScttNzSSAdWK4wD6b1gDjO5rVhjSsy55Xo5YWlxqN9BYWsZee4kEaKO5JxXqPQrG04T4XtdJtiCYkwzd3c7sx95rHPoDsoLjiy5u5V5pLW3zF5AscE+/H51qmtTytdtls42FTK7dAwrpHscklaSQu75J86ZXt4YcBBzE7daTuZnSMlT0FRelyNe3jmc8wHQdqiAK3EryIZZ5xFEOrdB7vWmOlatbQasIrdma1lGGJHRuxFDjGFWktQSwUnl5QdsVKaJpVnaRJNHGWkKg8znJHu8qV+nUxY8UON+k7d2THNtQB86JQFRnIFCwomaDVw9KBA2aFJEnNCmBR/9k='),
(2, 'Van Thi Cam Ly', '0866025042', 'ly@gmail.com', 'Vinh Phuc', '$2a$10$EVcQVnBkwaN.i7iUCBtBk.JJQUHZ.rq94H9lLs9ksSwnj.NRgPaOu', 'user', 1, '2025-12-14 15:08:01', '2025-11-26 15:19:43', '2025-12-14 15:08:01', 'data:image/jpeg;base64,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'),
(3, 'Lê Văn Hải', '0866025041', 'hai2504@gmail.com', 'Xuân Phương Hà Nội', '$2a$10$l7lN0wJkU.LhzkGSy5dQX.1Z5uTvIViTSaZ4dt7fRWL4t.r1lTj4C', 'admin', 1, '2025-12-17 00:53:45', '2025-12-08 05:44:30', '2025-12-17 00:53:45', 'data:image/jpeg;base64,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');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_door_library`
--

CREATE TABLE `user_door_library` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Người dùng tạo',
  `template_id` int(11) DEFAULT NULL COMMENT 'Template gốc (nếu có)',
  `custom_name` varchar(255) NOT NULL COMMENT 'Tên cửa tự tạo',
  `custom_code` varchar(50) DEFAULT NULL COMMENT 'Mã cửa tự tạo',
  `custom_image` varchar(500) DEFAULT NULL COMMENT 'Ảnh preview',
  `family` enum('door_out','door_in','window_swing','window_sliding','door_sliding','door_folding','wall_window','fixed','other') NOT NULL,
  `param_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Schema tham số' CHECK (json_valid(`param_schema`)),
  `params_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Giá trị mặc định' CHECK (json_valid(`params_json`)),
  `aluminum_system_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `door_designs_compat`
--
DROP TABLE IF EXISTS `door_designs_compat`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `door_designs_compat`  AS SELECT `pi`.`id` AS `id`, `pi`.`project_id` AS `project_id`, `pi`.`item_code` AS `design_code`, `ic`.`width_mm` AS `width_mm`, `ic`.`height_mm` AS `height_mm`, `ic`.`leaf_count` AS `number_of_panels`, `ic`.`open_style` AS `door_type`, `ic`.`aluminum_system` AS `aluminum_system_code`, `pi`.`status` AS `status`, `pi`.`created_at` AS `created_at`, `pi`.`updated_at` AS `updated_at` FROM ((`project_items_v2` `pi` left join `item_versions` `iv` on(`iv`.`id` = `pi`.`current_version_id`)) left join `item_config` `ic` on(`ic`.`item_version_id` = `iv`.`id`)) WHERE `pi`.`item_type` in ('door','window') ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `door_templates_view`
--
DROP TABLE IF EXISTS `door_templates_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `door_templates_view`  AS SELECT `product_templates`.`id` AS `id`, `product_templates`.`code` AS `code`, `product_templates`.`name` AS `name`, `product_templates`.`product_type` AS `product_type`, `product_templates`.`category` AS `category`, `product_templates`.`sub_type` AS `sub_type`, `product_templates`.`family` AS `family`, `product_templates`.`aluminum_system` AS `aluminum_system`, `product_templates`.`aluminum_system_id` AS `aluminum_system_id`, `product_templates`.`preview_image` AS `preview_image`, `product_templates`.`template_json` AS `template_json`, `product_templates`.`param_schema` AS `param_schema`, `product_templates`.`structure_json` AS `structure_json`, `product_templates`.`bom_rules` AS `bom_rules`, `product_templates`.`default_width_mm` AS `default_width_mm`, `product_templates`.`default_height_mm` AS `default_height_mm`, `product_templates`.`glass_type` AS `glass_type`, `product_templates`.`description` AS `description`, `product_templates`.`is_active` AS `is_active`, `product_templates`.`display_order` AS `display_order`, `product_templates`.`created_at` AS `created_at`, `product_templates`.`updated_at` AS `updated_at` FROM `product_templates` WHERE `product_templates`.`product_type` in ('door','window') AND `product_templates`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `project_doors_compat_view`
--
DROP TABLE IF EXISTS `project_doors_compat_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `project_doors_compat_view`  AS SELECT `pi`.`id` AS `id`, `pi`.`project_id` AS `project_id`, `p`.`project_name` AS `project_name`, `pi`.`product_template_id` AS `door_template_id`, `pt`.`code` AS `door_code`, `pt`.`name` AS `door_name`, `pt`.`category` AS `door_category`, `pi`.`aluminum_system` AS `aluminum_system`, `pi`.`quantity` AS `quantity`, coalesce(`pi`.`custom_width_mm`,`pt`.`default_width_mm`) AS `width_mm`, coalesce(`pi`.`custom_height_mm`,`pt`.`default_height_mm`) AS `height_mm`, coalesce(`pi`.`custom_glass_type`,`pt`.`glass_type`) AS `glass_type`, `pt`.`preview_image` AS `preview_image`, `pi`.`location` AS `location`, `pi`.`notes` AS `notes`, `pi`.`created_at` AS `created_at`, `pi`.`updated_at` AS `updated_at` FROM ((`project_items` `pi` join `product_templates` `pt` on(`pt`.`id` = `pi`.`product_template_id`)) join `projects` `p` on(`p`.`id` = `pi`.`project_id`)) WHERE `pt`.`product_type` in ('door','window') AND `pt`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `project_items_view`
--
DROP TABLE IF EXISTS `project_items_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `project_items_view`  AS SELECT `pi`.`id` AS `id`, `pi`.`project_id` AS `project_id`, `p`.`project_name` AS `project_name`, `pi`.`product_template_id` AS `product_template_id`, `pt`.`code` AS `product_code`, `pt`.`name` AS `product_name`, `pt`.`product_type` AS `product_type`, `pt`.`category` AS `product_category`, `pi`.`aluminum_system` AS `aluminum_system`, `pi`.`quantity` AS `quantity`, coalesce(`pi`.`custom_width_mm`,`pt`.`default_width_mm`) AS `width_mm`, coalesce(`pi`.`custom_height_mm`,`pt`.`default_height_mm`) AS `height_mm`, coalesce(`pi`.`custom_glass_type`,`pt`.`glass_type`) AS `glass_type`, `pt`.`preview_image` AS `preview_image`, `pi`.`location` AS `location`, `pi`.`notes` AS `notes`, `pi`.`snapshot_config` AS `snapshot_config`, `pi`.`bom_override` AS `bom_override`, `pi`.`created_at` AS `created_at`, `pi`.`updated_at` AS `updated_at` FROM ((`project_items` `pi` join `product_templates` `pt` on(`pt`.`id` = `pi`.`product_template_id`)) join `projects` `p` on(`p`.`id` = `pi`.`project_id`)) WHERE `pt`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `railing_templates_view`
--
DROP TABLE IF EXISTS `railing_templates_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `railing_templates_view`  AS SELECT `product_templates`.`id` AS `id`, `product_templates`.`code` AS `code`, `product_templates`.`name` AS `name`, `product_templates`.`product_type` AS `product_type`, `product_templates`.`category` AS `category`, `product_templates`.`sub_type` AS `sub_type`, `product_templates`.`family` AS `family`, `product_templates`.`aluminum_system` AS `aluminum_system`, `product_templates`.`aluminum_system_id` AS `aluminum_system_id`, `product_templates`.`preview_image` AS `preview_image`, `product_templates`.`template_json` AS `template_json`, `product_templates`.`param_schema` AS `param_schema`, `product_templates`.`structure_json` AS `structure_json`, `product_templates`.`bom_rules` AS `bom_rules`, `product_templates`.`default_width_mm` AS `default_width_mm`, `product_templates`.`default_height_mm` AS `default_height_mm`, `product_templates`.`glass_type` AS `glass_type`, `product_templates`.`description` AS `description`, `product_templates`.`is_active` AS `is_active`, `product_templates`.`display_order` AS `display_order`, `product_templates`.`created_at` AS `created_at`, `product_templates`.`updated_at` AS `updated_at` FROM `product_templates` WHERE `product_templates`.`product_type` = 'railing' AND `product_templates`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `roof_templates_view`
--
DROP TABLE IF EXISTS `roof_templates_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `roof_templates_view`  AS SELECT `product_templates`.`id` AS `id`, `product_templates`.`code` AS `code`, `product_templates`.`name` AS `name`, `product_templates`.`product_type` AS `product_type`, `product_templates`.`category` AS `category`, `product_templates`.`sub_type` AS `sub_type`, `product_templates`.`family` AS `family`, `product_templates`.`aluminum_system` AS `aluminum_system`, `product_templates`.`aluminum_system_id` AS `aluminum_system_id`, `product_templates`.`preview_image` AS `preview_image`, `product_templates`.`template_json` AS `template_json`, `product_templates`.`param_schema` AS `param_schema`, `product_templates`.`structure_json` AS `structure_json`, `product_templates`.`bom_rules` AS `bom_rules`, `product_templates`.`default_width_mm` AS `default_width_mm`, `product_templates`.`default_height_mm` AS `default_height_mm`, `product_templates`.`glass_type` AS `glass_type`, `product_templates`.`description` AS `description`, `product_templates`.`is_active` AS `is_active`, `product_templates`.`display_order` AS `display_order`, `product_templates`.`created_at` AS `created_at`, `product_templates`.`updated_at` AS `updated_at` FROM `product_templates` WHERE `product_templates`.`product_type` = 'roof' AND `product_templates`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `stair_templates_view`
--
DROP TABLE IF EXISTS `stair_templates_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `stair_templates_view`  AS SELECT `product_templates`.`id` AS `id`, `product_templates`.`code` AS `code`, `product_templates`.`name` AS `name`, `product_templates`.`product_type` AS `product_type`, `product_templates`.`category` AS `category`, `product_templates`.`sub_type` AS `sub_type`, `product_templates`.`family` AS `family`, `product_templates`.`aluminum_system` AS `aluminum_system`, `product_templates`.`aluminum_system_id` AS `aluminum_system_id`, `product_templates`.`preview_image` AS `preview_image`, `product_templates`.`template_json` AS `template_json`, `product_templates`.`param_schema` AS `param_schema`, `product_templates`.`structure_json` AS `structure_json`, `product_templates`.`bom_rules` AS `bom_rules`, `product_templates`.`default_width_mm` AS `default_width_mm`, `product_templates`.`default_height_mm` AS `default_height_mm`, `product_templates`.`glass_type` AS `glass_type`, `product_templates`.`description` AS `description`, `product_templates`.`is_active` AS `is_active`, `product_templates`.`display_order` AS `display_order`, `product_templates`.`created_at` AS `created_at`, `product_templates`.`updated_at` AS `updated_at` FROM `product_templates` WHERE `product_templates`.`product_type` = 'stair' AND `product_templates`.`is_active` = 1 ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `accessories`
--
ALTER TABLE `accessories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_code` (`code`);

--
-- Chỉ mục cho bảng `accessory_applications`
--
ALTER TABLE `accessory_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_accessory_product` (`accessory_id`,`product_type`),
  ADD KEY `idx_accessory_id` (`accessory_id`),
  ADD KEY `idx_product_type` (`product_type`);

--
-- Chỉ mục cho bảng `accessory_usage_rules`
--
ALTER TABLE `accessory_usage_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rule` (`accessory_id`,`door_type`,`position`),
  ADD KEY `idx_accessory` (`accessory_id`),
  ADD KEY `idx_door_type` (`door_type`);

--
-- Chỉ mục cho bảng `aluminum_colors`
--
ALTER TABLE `aluminum_colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_system_color` (`system_id`,`color_name`),
  ADD KEY `idx_system` (`system_id`);

--
-- Chỉ mục cho bảng `aluminum_profiles`
--
ALTER TABLE `aluminum_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_system_profile` (`system_id`,`profile_code`),
  ADD KEY `idx_system` (`system_id`),
  ADD KEY `idx_type` (`profile_type`),
  ADD KEY `idx_code` (`profile_code`);

--
-- Chỉ mục cho bảng `aluminum_scraps`
--
ALTER TABLE `aluminum_scraps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `used_in_project_id` (`used_in_project_id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_used` (`is_used`);

--
-- Chỉ mục cho bảng `aluminum_systems`
--
ALTER TABLE `aluminum_systems`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_brand` (`brand`),
  ADD KEY `idx_code` (`code`);

--
-- Chỉ mục cho bảng `atc_aluminum_profiles`
--
ALTER TABLE `atc_aluminum_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `atc_glass_types`
--
ALTER TABLE `atc_glass_types`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `atc_product_accessory_rules`
--
ALTER TABLE `atc_product_accessory_rules`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `atc_product_bom_profiles`
--
ALTER TABLE `atc_product_bom_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `bom_items`
--
ALTER TABLE `bom_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `accessory_id` (`accessory_id`),
  ADD KEY `idx_design` (`design_id`),
  ADD KEY `idx_type` (`item_type`);

--
-- Chỉ mục cho bảng `company_config`
--
ALTER TABLE `company_config`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_code` (`customer_code`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_code` (`customer_code`),
  ADD KEY `idx_status` (`customer_status`),
  ADD KEY `idx_followup` (`next_followup_date`);

--
-- Chỉ mục cho bảng `customer_appointments`
--
ALTER TABLE `customer_appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_date` (`appointment_date`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `customer_interactions`
--
ALTER TABLE `customer_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `related_quotation_id` (`related_quotation_id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_date` (`interaction_date`),
  ADD KEY `idx_type` (`interaction_type`);

--
-- Chỉ mục cho bảng `cutting_details`
--
ALTER TABLE `cutting_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bom_item_id` (`bom_item_id`),
  ADD KEY `idx_optimization` (`optimization_id`);

--
-- Chỉ mục cho bảng `cutting_formulas`
--
ALTER TABLE `cutting_formulas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_formula` (`system_id`,`door_type`,`profile_type`,`dimension_type`),
  ADD KEY `idx_system` (`system_id`),
  ADD KEY `idx_door_type` (`door_type`),
  ADD KEY `idx_profile` (`profile_type`);

--
-- Chỉ mục cho bảng `cutting_optimizations`
--
ALTER TABLE `cutting_optimizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluminum_profile_id` (`aluminum_profile_id`),
  ADD KEY `idx_design` (`design_id`);

--
-- Chỉ mục cho bảng `debts`
--
ALTER TABLE `debts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `quotation_id` (`quotation_id`),
  ADD KEY `idx_type` (`debt_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Chỉ mục cho bảng `decals`
--
ALTER TABLE `decals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `source_project_id` (`source_project_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_length` (`length_mm`);

--
-- Chỉ mục cho bảng `deduction_formulas`
--
ALTER TABLE `deduction_formulas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`formula_type`),
  ADD KEY `fk_formula_system` (`system_id`);

--
-- Chỉ mục cho bảng `door_aluminum_calculations`
--
ALTER TABLE `door_aluminum_calculations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_drawing` (`door_drawing_id`);

--
-- Chỉ mục cho bảng `door_bom_lines`
--
ALTER TABLE `door_bom_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_drawing_id` (`door_drawing_id`),
  ADD KEY `idx_item_type` (`item_type`),
  ADD KEY `idx_material_id` (`material_id`);

--
-- Chỉ mục cho bảng `door_bom_summary`
--
ALTER TABLE `door_bom_summary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_drawing_id` (`door_drawing_id`),
  ADD KEY `idx_item_type` (`item_type`);

--
-- Chỉ mục cho bảng `door_cutting_plan`
--
ALTER TABLE `door_cutting_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_drawing_id` (`door_drawing_id`),
  ADD KEY `idx_profile_code` (`profile_code`);

--
-- Chỉ mục cho bảng `door_designs`
--
ALTER TABLE `door_designs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `design_code` (`design_code`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `formula_id` (`formula_id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_door_designs_template` (`template_id`),
  ADD KEY `idx_door_designs_project_template` (`project_id`,`template_id`),
  ADD KEY `idx_template` (`template_id`),
  ADD KEY `door_drawing_id` (`door_drawing_id`),
  ADD KEY `idx_project_item_id` (`project_item_id`);

--
-- Chỉ mục cho bảng `door_drawings`
--
ALTER TABLE `door_drawings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_door_design` (`door_design_id`);

--
-- Chỉ mục cho bảng `door_glass_calculations`
--
ALTER TABLE `door_glass_calculations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_drawing` (`door_drawing_id`);

--
-- Chỉ mục cho bảng `door_structure_items`
--
ALTER TABLE `door_structure_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_drawing` (`door_drawing_id`),
  ADD KEY `idx_item_type` (`item_type`);

--
-- Chỉ mục cho bảng `door_templates`
--
ALTER TABLE `door_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `idx_family` (`family`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`);

--
-- Chỉ mục cho bảng `financial_transactions`
--
ALTER TABLE `financial_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `idx_date` (`transaction_date`),
  ADD KEY `idx_type` (`transaction_type`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `production_order_id` (`production_order_id`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `gasket_rules`
--
ALTER TABLE `gasket_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_system_id` (`system_id`),
  ADD KEY `idx_gasket_code` (`gasket_code`);

--
-- Chỉ mục cho bảng `glass_rules`
--
ALTER TABLE `glass_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_system_id` (`system_id`),
  ADD KEY `idx_glass_type` (`glass_type`);

--
-- Chỉ mục cho bảng `glass_types`
--
ALTER TABLE `glass_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_glass_code` (`code`),
  ADD KEY `idx_type` (`type`);

--
-- Chỉ mục cho bảng `hardware_rules`
--
ALTER TABLE `hardware_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_system_id` (`system_id`),
  ADD KEY `idx_panel_type` (`panel_type`),
  ADD KEY `idx_hardware_code` (`hardware_code`);

--
-- Chỉ mục cho bảng `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_code` (`item_code`),
  ADD KEY `idx_type` (`item_type`);

--
-- Chỉ mục cho bảng `inventory_in`
--
ALTER TABLE `inventory_in`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_code` (`receipt_code`),
  ADD KEY `idx_code` (`receipt_code`),
  ADD KEY `idx_date` (`receipt_date`),
  ADD KEY `idx_source` (`source_type`,`source_reference`);

--
-- Chỉ mục cho bảng `inventory_notifications`
--
ALTER TABLE `inventory_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warning_id` (`warning_id`),
  ADD KEY `idx_recipient` (`recipient_id`),
  ADD KEY `idx_sent` (`sent_at`);

--
-- Chỉ mục cho bảng `inventory_out`
--
ALTER TABLE `inventory_out`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `issue_code` (`issue_code`),
  ADD KEY `production_order_id` (`production_order_id`),
  ADD KEY `idx_code` (`issue_code`),
  ADD KEY `idx_date` (`issue_date`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Chỉ mục cho bảng `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventory_id` (`inventory_id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_accessory_id` (`accessory_id`);

--
-- Chỉ mục cho bảng `inventory_warnings`
--
ALTER TABLE `inventory_warnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_inventory` (`inventory_id`);

--
-- Chỉ mục cho bảng `item_bom_lines`
--
ALTER TABLE `item_bom_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bom` (`bom_version_id`),
  ADD KEY `idx_group` (`material_group`),
  ADD KEY `idx_material` (`material_code`);

--
-- Chỉ mục cho bảng `item_bom_versions`
--
ALTER TABLE `item_bom_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_item_bom` (`project_item_id`,`bom_version_number`),
  ADD KEY `idx_source` (`source_item_version_id`);

--
-- Chỉ mục cho bảng `item_config`
--
ALTER TABLE `item_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_version` (`item_version_id`);

--
-- Chỉ mục cho bảng `item_structure_aluminum`
--
ALTER TABLE `item_structure_aluminum`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_version` (`item_version_id`);

--
-- Chỉ mục cho bảng `item_structure_consumables`
--
ALTER TABLE `item_structure_consumables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_version` (`item_version_id`);

--
-- Chỉ mục cho bảng `item_structure_glass`
--
ALTER TABLE `item_structure_glass`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_version` (`item_version_id`);

--
-- Chỉ mục cho bảng `item_structure_hardware`
--
ALTER TABLE `item_structure_hardware`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_version` (`item_version_id`);

--
-- Chỉ mục cho bảng `item_type_rules`
--
ALTER TABLE `item_type_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_type_rule` (`item_type`,`rule_category`,`rule_code`),
  ADD KEY `idx_type` (`item_type`,`rule_category`);

--
-- Chỉ mục cho bảng `item_type_system_rules`
--
ALTER TABLE `item_type_system_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_type_system_rule` (`item_type`,`aluminum_system`,`rule_category`,`rule_code`),
  ADD KEY `idx_type_system` (`item_type`,`aluminum_system`,`rule_category`);

--
-- Chỉ mục cho bảng `item_versions`
--
ALTER TABLE `item_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_item_version` (`project_item_id`,`version_number`),
  ADD KEY `idx_item` (`project_item_id`);

--
-- Chỉ mục cho bảng `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_type` (`type`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email_active` (`email`,`reset_code`,`used`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_token` (`reset_token`),
  ADD KEY `idx_code` (`reset_code`);

--
-- Chỉ mục cho bảng `production_orders`
--
ALTER TABLE `production_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `quotation_id` (`quotation_id`),
  ADD KEY `idx_code` (`order_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_project` (`project_id`);

--
-- Chỉ mục cho bảng `production_order_bom`
--
ALTER TABLE `production_order_bom`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_type` (`item_type`);

--
-- Chỉ mục cho bảng `production_order_doors`
--
ALTER TABLE `production_order_doors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_order_door` (`order_id`,`design_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_design` (`design_id`);

--
-- Chỉ mục cho bảng `production_progress`
--
ALTER TABLE `production_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `design_id` (`design_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_stage` (`stage`);

--
-- Chỉ mục cho bảng `product_accessory_rules`
--
ALTER TABLE `product_accessory_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_type` (`product_type`),
  ADD KEY `idx_accessory` (`accessory_id`);

--
-- Chỉ mục cho bảng `product_bom_profiles`
--
ALTER TABLE `product_bom_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_template` (`product_template_id`),
  ADD KEY `idx_profile` (`profile_id`);

--
-- Chỉ mục cho bảng `product_templates`
--
ALTER TABLE `product_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_product_type` (`product_type`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_sub_type` (`sub_type`),
  ADD KEY `idx_family` (`family`),
  ADD KEY `idx_aluminum_system` (`aluminum_system`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_is_active` (`is_active`,`display_order`);

--
-- Chỉ mục cho bảng `product_template_accessories`
--
ALTER TABLE `product_template_accessories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_template_accessory` (`product_template_id`,`accessory_id`),
  ADD KEY `idx_template_id` (`product_template_id`),
  ADD KEY `idx_accessory_id` (`accessory_id`);

--
-- Chỉ mục cho bảng `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_code` (`project_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_code` (`project_code`),
  ADD KEY `idx_customer` (`customer_id`);

--
-- Chỉ mục cho bảng `projects_material_summary`
--
ALTER TABLE `projects_material_summary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_item_type` (`item_type`);

--
-- Chỉ mục cho bảng `project_accessories_summary`
--
ALTER TABLE `project_accessories_summary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accessory_id` (`accessory_id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_category` (`category`);

--
-- Chỉ mục cho bảng `project_aluminum_summary`
--
ALTER TABLE `project_aluminum_summary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_aluminum_system` (`aluminum_system_id`);

--
-- Chỉ mục cho bảng `project_cutting_details`
--
ALTER TABLE `project_cutting_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_optimization` (`optimization_id`);

--
-- Chỉ mục cho bảng `project_cutting_optimization`
--
ALTER TABLE `project_cutting_optimization`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `idx_project` (`project_id`);

--
-- Chỉ mục cho bảng `project_finances`
--
ALTER TABLE `project_finances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_id` (`project_id`),
  ADD KEY `idx_project` (`project_id`);

--
-- Chỉ mục cho bảng `project_gaskets_summary`
--
ALTER TABLE `project_gaskets_summary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_type` (`item_type`);

--
-- Chỉ mục cho bảng `project_glass_summary`
--
ALTER TABLE `project_glass_summary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`);

--
-- Chỉ mục cho bảng `project_items`
--
ALTER TABLE `project_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_product_template_id` (`product_template_id`),
  ADD KEY `idx_aluminum_system` (`aluminum_system`),
  ADD KEY `idx_project_items_status` (`status`),
  ADD KEY `idx_project_items_source` (`source_quotation_id`);

--
-- Chỉ mục cho bảng `project_items_v2`
--
ALTER TABLE `project_items_v2`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_type` (`item_type`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `project_logs`
--
ALTER TABLE `project_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_date` (`created_at`);

--
-- Chỉ mục cho bảng `project_materials`
--
ALTER TABLE `project_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_inventory_id` (`inventory_id`),
  ADD KEY `idx_accessory_id` (`accessory_id`),
  ADD KEY `idx_transaction_id` (`transaction_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_material_type` (`material_type`),
  ADD KEY `idx_material_id` (`material_id`);

--
-- Chỉ mục cho bảng `project_pricing`
--
ALTER TABLE `project_pricing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_type` (`item_type`);

--
-- Chỉ mục cho bảng `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotation_code` (`quotation_code`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `idx_code` (`quotation_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_project` (`project_id`);

--
-- Chỉ mục cho bảng `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bom_item_id` (`bom_item_id`),
  ADD KEY `idx_quotation` (`quotation_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_user_type` (`user_type`);

--
-- Chỉ mục cho bảng `user_door_library`
--
ALTER TABLE `user_door_library`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `aluminum_system_id` (`aluminum_system_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_family` (`family`),
  ADD KEY `idx_active` (`is_active`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `accessories`
--
ALTER TABLE `accessories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `accessory_applications`
--
ALTER TABLE `accessory_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `accessory_usage_rules`
--
ALTER TABLE `accessory_usage_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `aluminum_colors`
--
ALTER TABLE `aluminum_colors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `aluminum_profiles`
--
ALTER TABLE `aluminum_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `aluminum_scraps`
--
ALTER TABLE `aluminum_scraps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `aluminum_systems`
--
ALTER TABLE `aluminum_systems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT cho bảng `atc_aluminum_profiles`
--
ALTER TABLE `atc_aluminum_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `atc_glass_types`
--
ALTER TABLE `atc_glass_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `atc_product_accessory_rules`
--
ALTER TABLE `atc_product_accessory_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `atc_product_bom_profiles`
--
ALTER TABLE `atc_product_bom_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=158;

--
-- AUTO_INCREMENT cho bảng `bom_items`
--
ALTER TABLE `bom_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT cho bảng `company_config`
--
ALTER TABLE `company_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `customer_appointments`
--
ALTER TABLE `customer_appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `customer_interactions`
--
ALTER TABLE `customer_interactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cutting_details`
--
ALTER TABLE `cutting_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cutting_formulas`
--
ALTER TABLE `cutting_formulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cutting_optimizations`
--
ALTER TABLE `cutting_optimizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `debts`
--
ALTER TABLE `debts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `decals`
--
ALTER TABLE `decals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `deduction_formulas`
--
ALTER TABLE `deduction_formulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `door_aluminum_calculations`
--
ALTER TABLE `door_aluminum_calculations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_bom_lines`
--
ALTER TABLE `door_bom_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_bom_summary`
--
ALTER TABLE `door_bom_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_cutting_plan`
--
ALTER TABLE `door_cutting_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_designs`
--
ALTER TABLE `door_designs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT cho bảng `door_drawings`
--
ALTER TABLE `door_drawings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_glass_calculations`
--
ALTER TABLE `door_glass_calculations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_structure_items`
--
ALTER TABLE `door_structure_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `door_templates`
--
ALTER TABLE `door_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT cho bảng `financial_transactions`
--
ALTER TABLE `financial_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT cho bảng `gasket_rules`
--
ALTER TABLE `gasket_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `glass_rules`
--
ALTER TABLE `glass_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `glass_types`
--
ALTER TABLE `glass_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `hardware_rules`
--
ALTER TABLE `hardware_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT cho bảng `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `inventory_in`
--
ALTER TABLE `inventory_in`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventory_notifications`
--
ALTER TABLE `inventory_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventory_out`
--
ALTER TABLE `inventory_out`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `inventory_warnings`
--
ALTER TABLE `inventory_warnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `item_bom_lines`
--
ALTER TABLE `item_bom_lines`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=339;

--
-- AUTO_INCREMENT cho bảng `item_bom_versions`
--
ALTER TABLE `item_bom_versions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT cho bảng `item_config`
--
ALTER TABLE `item_config`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT cho bảng `item_structure_aluminum`
--
ALTER TABLE `item_structure_aluminum`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `item_structure_consumables`
--
ALTER TABLE `item_structure_consumables`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `item_structure_glass`
--
ALTER TABLE `item_structure_glass`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `item_structure_hardware`
--
ALTER TABLE `item_structure_hardware`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `item_type_rules`
--
ALTER TABLE `item_type_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT cho bảng `item_type_system_rules`
--
ALTER TABLE `item_type_system_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `item_versions`
--
ALTER TABLE `item_versions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT cho bảng `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `production_orders`
--
ALTER TABLE `production_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `production_order_bom`
--
ALTER TABLE `production_order_bom`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `production_order_doors`
--
ALTER TABLE `production_order_doors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `production_progress`
--
ALTER TABLE `production_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_accessory_rules`
--
ALTER TABLE `product_accessory_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_bom_profiles`
--
ALTER TABLE `product_bom_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_templates`
--
ALTER TABLE `product_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT cho bảng `product_template_accessories`
--
ALTER TABLE `product_template_accessories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `projects_material_summary`
--
ALTER TABLE `projects_material_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `project_accessories_summary`
--
ALTER TABLE `project_accessories_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `project_aluminum_summary`
--
ALTER TABLE `project_aluminum_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `project_cutting_details`
--
ALTER TABLE `project_cutting_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `project_cutting_optimization`
--
ALTER TABLE `project_cutting_optimization`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `project_finances`
--
ALTER TABLE `project_finances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `project_gaskets_summary`
--
ALTER TABLE `project_gaskets_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `project_glass_summary`
--
ALTER TABLE `project_glass_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `project_items`
--
ALTER TABLE `project_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `project_items_v2`
--
ALTER TABLE `project_items_v2`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT cho bảng `project_logs`
--
ALTER TABLE `project_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `project_materials`
--
ALTER TABLE `project_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT cho bảng `project_pricing`
--
ALTER TABLE `project_pricing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `quotation_items`
--
ALTER TABLE `quotation_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `user_door_library`
--
ALTER TABLE `user_door_library`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `accessory_applications`
--
ALTER TABLE `accessory_applications`
  ADD CONSTRAINT `fk_aa_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `accessory_usage_rules`
--
ALTER TABLE `accessory_usage_rules`
  ADD CONSTRAINT `accessory_usage_rules_ibfk_1` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `aluminum_colors`
--
ALTER TABLE `aluminum_colors`
  ADD CONSTRAINT `aluminum_colors_ibfk_1` FOREIGN KEY (`system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `aluminum_profiles`
--
ALTER TABLE `aluminum_profiles`
  ADD CONSTRAINT `aluminum_profiles_ibfk_1` FOREIGN KEY (`system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `aluminum_scraps`
--
ALTER TABLE `aluminum_scraps`
  ADD CONSTRAINT `aluminum_scraps_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aluminum_scraps_ibfk_2` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`),
  ADD CONSTRAINT `aluminum_scraps_ibfk_3` FOREIGN KEY (`used_in_project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `bom_items`
--
ALTER TABLE `bom_items`
  ADD CONSTRAINT `bom_items_ibfk_1` FOREIGN KEY (`design_id`) REFERENCES `door_designs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bom_items_ibfk_2` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bom_items_ibfk_3` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `customer_appointments`
--
ALTER TABLE `customer_appointments`
  ADD CONSTRAINT `customer_appointments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `customer_interactions`
--
ALTER TABLE `customer_interactions`
  ADD CONSTRAINT `customer_interactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_interactions_ibfk_2` FOREIGN KEY (`related_quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `cutting_details`
--
ALTER TABLE `cutting_details`
  ADD CONSTRAINT `cutting_details_ibfk_1` FOREIGN KEY (`optimization_id`) REFERENCES `cutting_optimizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cutting_details_ibfk_2` FOREIGN KEY (`bom_item_id`) REFERENCES `bom_items` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cutting_formulas`
--
ALTER TABLE `cutting_formulas`
  ADD CONSTRAINT `cutting_formulas_ibfk_1` FOREIGN KEY (`system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cutting_optimizations`
--
ALTER TABLE `cutting_optimizations`
  ADD CONSTRAINT `cutting_optimizations_ibfk_1` FOREIGN KEY (`design_id`) REFERENCES `door_designs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cutting_optimizations_ibfk_2` FOREIGN KEY (`aluminum_profile_id`) REFERENCES `aluminum_systems` (`id`);

--
-- Các ràng buộc cho bảng `debts`
--
ALTER TABLE `debts`
  ADD CONSTRAINT `debts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `debts_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `debts_ibfk_3` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `decals`
--
ALTER TABLE `decals`
  ADD CONSTRAINT `decals_ibfk_1` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`),
  ADD CONSTRAINT `decals_ibfk_2` FOREIGN KEY (`source_project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `deduction_formulas`
--
ALTER TABLE `deduction_formulas`
  ADD CONSTRAINT `fk_formula_system` FOREIGN KEY (`system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `door_aluminum_calculations`
--
ALTER TABLE `door_aluminum_calculations`
  ADD CONSTRAINT `door_aluminum_calculations_ibfk_1` FOREIGN KEY (`door_drawing_id`) REFERENCES `door_drawings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `door_designs`
--
ALTER TABLE `door_designs`
  ADD CONSTRAINT `door_designs_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `door_designs_ibfk_2` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`),
  ADD CONSTRAINT `door_designs_ibfk_3` FOREIGN KEY (`formula_id`) REFERENCES `deduction_formulas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `door_designs_ibfk_4` FOREIGN KEY (`door_drawing_id`) REFERENCES `door_drawings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_door_template` FOREIGN KEY (`template_id`) REFERENCES `door_templates` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `door_drawings`
--
ALTER TABLE `door_drawings`
  ADD CONSTRAINT `door_drawings_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `door_drawings_ibfk_2` FOREIGN KEY (`door_design_id`) REFERENCES `door_designs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `door_drawings_ibfk_3` FOREIGN KEY (`template_id`) REFERENCES `door_templates` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `door_glass_calculations`
--
ALTER TABLE `door_glass_calculations`
  ADD CONSTRAINT `door_glass_calculations_ibfk_1` FOREIGN KEY (`door_drawing_id`) REFERENCES `door_drawings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `door_structure_items`
--
ALTER TABLE `door_structure_items`
  ADD CONSTRAINT `door_structure_items_ibfk_1` FOREIGN KEY (`door_drawing_id`) REFERENCES `door_drawings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `door_templates`
--
ALTER TABLE `door_templates`
  ADD CONSTRAINT `door_templates_ibfk_1` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `financial_transactions`
--
ALTER TABLE `financial_transactions`
  ADD CONSTRAINT `financial_transactions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `financial_transactions_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `financial_transactions_ibfk_3` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `inventory_notifications`
--
ALTER TABLE `inventory_notifications`
  ADD CONSTRAINT `inventory_notifications_ibfk_1` FOREIGN KEY (`warning_id`) REFERENCES `inventory_warnings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `inventory_out`
--
ALTER TABLE `inventory_out`
  ADD CONSTRAINT `inventory_out_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_out_ibfk_2` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_out_ibfk_3` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `fk_inventory_transactions_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_transactions_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_transactions_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `inventory_warnings`
--
ALTER TABLE `inventory_warnings`
  ADD CONSTRAINT `inventory_warnings_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `production_orders`
--
ALTER TABLE `production_orders`
  ADD CONSTRAINT `production_orders_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_orders_ibfk_2` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `production_order_bom`
--
ALTER TABLE `production_order_bom`
  ADD CONSTRAINT `production_order_bom_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `production_order_doors`
--
ALTER TABLE `production_order_doors`
  ADD CONSTRAINT `production_order_doors_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_order_doors_ibfk_2` FOREIGN KEY (`design_id`) REFERENCES `door_designs` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `production_progress`
--
ALTER TABLE `production_progress`
  ADD CONSTRAINT `production_progress_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_progress_ibfk_2` FOREIGN KEY (`design_id`) REFERENCES `door_designs` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_template_accessories`
--
ALTER TABLE `product_template_accessories`
  ADD CONSTRAINT `fk_pta_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pta_template` FOREIGN KEY (`product_template_id`) REFERENCES `product_templates` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Các ràng buộc cho bảng `project_accessories_summary`
--
ALTER TABLE `project_accessories_summary`
  ADD CONSTRAINT `project_accessories_summary_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_accessories_summary_ibfk_2` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `project_aluminum_summary`
--
ALTER TABLE `project_aluminum_summary`
  ADD CONSTRAINT `project_aluminum_summary_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_aluminum_summary_ibfk_2` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`);

--
-- Các ràng buộc cho bảng `project_cutting_details`
--
ALTER TABLE `project_cutting_details`
  ADD CONSTRAINT `project_cutting_details_ibfk_1` FOREIGN KEY (`optimization_id`) REFERENCES `project_cutting_optimization` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `project_cutting_optimization`
--
ALTER TABLE `project_cutting_optimization`
  ADD CONSTRAINT `project_cutting_optimization_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_cutting_optimization_ibfk_2` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`);

--
-- Các ràng buộc cho bảng `project_finances`
--
ALTER TABLE `project_finances`
  ADD CONSTRAINT `project_finances_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `project_gaskets_summary`
--
ALTER TABLE `project_gaskets_summary`
  ADD CONSTRAINT `project_gaskets_summary_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `project_glass_summary`
--
ALTER TABLE `project_glass_summary`
  ADD CONSTRAINT `project_glass_summary_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `project_items`
--
ALTER TABLE `project_items`
  ADD CONSTRAINT `fk_pi_product_template` FOREIGN KEY (`product_template_id`) REFERENCES `product_templates` (`id`),
  ADD CONSTRAINT `fk_pi_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `project_logs`
--
ALTER TABLE `project_logs`
  ADD CONSTRAINT `project_logs_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `project_materials`
--
ALTER TABLE `project_materials`
  ADD CONSTRAINT `project_materials_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_materials_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `project_materials_ibfk_3` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `project_materials_ibfk_4` FOREIGN KEY (`transaction_id`) REFERENCES `inventory_transactions` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `project_pricing`
--
ALTER TABLE `project_pricing`
  ADD CONSTRAINT `project_pricing_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Các ràng buộc cho bảng `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD CONSTRAINT `quotation_items_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotation_items_ibfk_2` FOREIGN KEY (`bom_item_id`) REFERENCES `bom_items` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `user_door_library`
--
ALTER TABLE `user_door_library`
  ADD CONSTRAINT `user_door_library_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_door_library_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `door_templates` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `user_door_library_ibfk_3` FOREIGN KEY (`aluminum_system_id`) REFERENCES `aluminum_systems` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
