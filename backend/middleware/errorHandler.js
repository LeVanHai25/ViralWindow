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

    // Standardize MySQL errors
    if (err.code && err.code.startsWith('ER_')) {
        console.error('💾 Database Error:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState
        });

        if (err.code === 'ER_BAD_FIELD_ERROR') {
            statusCode = 500;
            message = `Lỗi dữ liệu hệ thống: Thiếu cột dữ liệu (${err.sqlMessage}). Vui lòng báo cho kỹ thuật.`;
        } else if (err.code === 'ER_NO_SUCH_TABLE') {
            statusCode = 500;
            message = `Lỗi hệ thống: Không tìm thấy bảng dữ liệu (${err.sqlMessage}).`;
        }
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            code: err.code,
            stack: err.stack
        } : undefined
    });
};
