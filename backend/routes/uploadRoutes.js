const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// ============================================
// MULTER CONFIGURATION FOR QUOTATION ITEM FILES
// ============================================

// Storage for images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage for design PDFs
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/designs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh (jpg, png, gif, webp)'));
        }
    }
});

const uploadPdf = multer({
    storage: pdfStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for PDFs
    fileFilter: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase() === '.pdf';
        const mimetype = file.mimetype === 'application/pdf';
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file PDF'));
        }
    }
});

// ============================================
// UPLOAD IMAGE FOR QUOTATION ITEM
// ============================================
router.post("/image/:itemId", uploadImage.single('image'), async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;

        // Update quotation item with image URL
        await db.query(
            `UPDATE quotation_items SET image_url = ? WHERE id = ?`,
            [imageUrl, itemId]
        );

        res.json({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                image_url: imageUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPLOAD DESIGN FILE FOR PROJECT (PDF, DWG, Images)
// ============================================
const designStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectId = req.params.projectId || 'general';
        const uploadDir = path.join(__dirname, `../uploads/designs/${projectId}`);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'design-' + uniqueSuffix + ext);
    }
});

const uploadDesign = multer({
    storage: designStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        // Allow PDF, DWG, DXF, and images
        const allowedTypes = /pdf|dwg|dxf|jpeg|jpg|png|gif|webp/i;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file PDF, DWG, DXF hoặc ảnh'));
        }
    }
});

// Route cho upload design theo project
router.post("/design/:projectId", uploadDesign.single('design'), async (req, res) => {
    try {
        const { projectId } = req.params;

        console.log('Upload design for project:', projectId);
        console.log('File:', req.file);

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
        }

        const fileUrl = `/uploads/designs/${projectId}/${req.file.filename}`;
        const designDir = path.join(__dirname, `../uploads/designs/${projectId}`);
        const metadataFile = path.join(designDir, 'metadata.json');

        // Lưu metadata (originalName) vào file JSON
        let metadata = {};
        if (fs.existsSync(metadataFile)) {
            try {
                const metadataContent = fs.readFileSync(metadataFile, 'utf8');
                metadata = JSON.parse(metadataContent);
            } catch (e) {
                console.warn('Could not read metadata file, creating new one:', e.message);
                metadata = {};
            }
        }

        // Lưu mapping: filename (unique) -> originalName
        metadata[req.file.filename] = {
            originalName: req.file.originalname,
            uploadedAt: new Date().toISOString(),
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        // Ghi lại metadata file
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf8');
        console.log('✅ Saved metadata for file:', req.file.filename, '->', req.file.originalname);

        res.json({
            success: true,
            message: 'Upload bản thiết kế thành công',
            fileUrl: fileUrl,
            filename: req.file.filename,  // Tên unique trên server
            originalName: req.file.originalname,  // Tên gốc để hiển thị
            size: req.file.size
        });
    } catch (error) {
        console.error('Error uploading design:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route để list tất cả design files của project
router.get("/design/:projectId/list", async (req, res) => {
    try {
        const { projectId } = req.params;
        const designDir = path.join(__dirname, `../uploads/designs/${projectId}`);
        const metadataFile = path.join(designDir, 'metadata.json');

        console.log('Listing design files for project:', projectId);
        console.log('Directory:', designDir);

        if (!fs.existsSync(designDir)) {
            return res.json({
                success: true,
                files: [],
                message: 'Chưa có file nào được upload'
            });
        }

        // Đọc metadata nếu có
        let metadata = {};
        if (fs.existsSync(metadataFile)) {
            try {
                const metadataContent = fs.readFileSync(metadataFile, 'utf8');
                metadata = JSON.parse(metadataContent);
            } catch (e) {
                console.warn('Could not read metadata file:', e.message);
            }
        }

        const files = fs.readdirSync(designDir);
        const fileList = files
            .filter(filename => filename !== 'metadata.json') // Bỏ qua file metadata
            .map(filename => {
            const filePath = path.join(designDir, filename);
            const stats = fs.statSync(filePath);
                
                // Lấy originalName từ metadata nếu có
                const fileMetadata = metadata[filename] || {};
                let originalName = fileMetadata.originalName;
                
                // Nếu không có metadata, fallback về filename (nhưng loại bỏ prefix "design-")
                if (!originalName) {
                    // Thử extract tên gốc từ tên unique nếu có pattern
                    // Ví dụ: design-1767256969095-990913426.pdf -> không thể biết tên gốc
                    // Trong trường hợp này, giữ nguyên filename nhưng log warning
                    originalName = filename;
                    console.warn(`⚠️ No metadata found for file ${filename}, using filename as originalName`);
                }

                console.log(`📄 File: ${filename} -> originalName: ${originalName}`);

            return {
                    name: filename,  // Tên unique trên server
                    originalName: originalName,  // Tên gốc để hiển thị
                url: `/uploads/designs/${projectId}/${filename}`,
                size: stats.size,
                type: path.extname(filename).toLowerCase(),
                    uploadedAt: fileMetadata.uploadedAt || stats.mtime,
                    mimetype: fileMetadata.mimetype || 'application/octet-stream'
            };
        });

        res.json({
            success: true,
            files: fileList,
            count: fileList.length
        });
    } catch (error) {
        console.error('Error listing design files:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route để xóa design file của project
router.delete("/design/:projectId/:filename", async (req, res) => {
    try {
        const { projectId } = req.params;
        const filename = decodeURIComponent(req.params.filename); // Decode filename
        const filePath = path.join(__dirname, `../uploads/designs/${projectId}/${filename}`);
        const designDir = path.join(__dirname, `../uploads/designs/${projectId}`);
        const metadataFile = path.join(designDir, 'metadata.json');

        console.log('Deleting design file:', filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File không tồn tại'
            });
        }

        // Xóa file
        fs.unlinkSync(filePath);

        // Xóa metadata nếu có
        if (fs.existsSync(metadataFile)) {
            try {
                const metadataContent = fs.readFileSync(metadataFile, 'utf8');
                const metadata = JSON.parse(metadataContent);
                delete metadata[filename];
                fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf8');
                console.log('✅ Removed metadata for file:', filename);
            } catch (e) {
                console.warn('Could not update metadata file:', e.message);
            }
        }

        res.json({
            success: true,
            message: 'Đã xóa file thành công',
            filename: filename
        });
    } catch (error) {
        console.error('Error deleting design file:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPLOAD DESIGN PDF FOR QUOTATION ITEM (Legacy)
// ============================================
router.post("/design-item/:itemId", uploadPdf.single('design'), async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
        }

        const designUrl = `/uploads/designs/${req.file.filename}`;

        // Update quotation item with design PDF URL
        // First check if column exists, if not use notes field
        try {
            await db.query(
                `UPDATE quotation_items SET design_pdf_url = ? WHERE id = ?`,
                [designUrl, itemId]
            );
        } catch (err) {
            // If column doesn't exist, store in description
            console.log('design_pdf_url column may not exist, storing in description');
            await db.query(
                `UPDATE quotation_items SET description = CONCAT(IFNULL(description, ''), ' [PDF:', ?, ']') WHERE id = ?`,
                [designUrl, itemId]
            );
        }

        res.json({
            success: true,
            message: 'Upload bản thiết kế thành công',
            data: {
                design_url: designUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Error uploading design:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET FILE (serve uploaded files)
// ============================================
router.get("/file/:type/:filename", (req, res) => {
    const { type, filename } = req.params;
    let uploadDir;

    if (type === 'products') {
        uploadDir = path.join(__dirname, '../uploads/products');
    } else if (type === 'designs') {
        uploadDir = path.join(__dirname, '../uploads/designs');
    } else {
        return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
});

module.exports = router;
