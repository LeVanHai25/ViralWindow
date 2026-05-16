/**
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * Standardizes error responses across the entire application
 */
module.exports = (err, req, res, next) => {
    console.error(`[Error] ${new Date().toISOString()}:`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞',
        path: req.path,
        method: req.method
    });

    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Lỗi server nội bộ';

    // Handle specific MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        message = 'Dữ liệu đã tồn tại (Duplicate Entry)';
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Dữ liệu liên kết không tồn tại (Foreign Key Constraint)';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        // Chỉ hiện stack trace ở môi trường phát triển
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
