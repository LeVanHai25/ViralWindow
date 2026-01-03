const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Register
exports.register = async (req, res) => {
    try {
        const { full_name, phone, email, address, password, user_type } = req.body;

        // Validate required fields
        if (!full_name || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc"
            });
        }

        // Check if email already exists
        const [emailExists] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (emailExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email đã được sử dụng"
            });
        }

        // Check if phone already exists
        const [phoneExists] = await db.query(
            "SELECT id FROM users WHERE phone = ?",
            [phone]
        );

        if (phoneExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại đã được sử dụng"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.query(
            `INSERT INTO users (full_name, phone, email, address, password, user_type, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [full_name, phone, email, address || null, hashedPassword, user_type || 'user']
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, email, user_type: user_type || 'user' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: {
                token,
                user: {
                    id: result.insertId,
                    full_name,
                    email,
                    phone,
                    user_type: user_type || 'user'
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password, remember_me } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ? AND is_active = 1",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        // Generate token
        const expiresIn = remember_me ? "30d" : JWT_EXPIRES_IN;
        const token = jwt.sign(
            { id: user.id, email: user.email, user_type: user.user_type },
            JWT_SECRET,
            { expiresIn }
        );

        // Update last login
        await db.query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [user.id]
        );

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    user_type: user.user_type
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT id, email FROM users WHERE email = ? AND is_active = 1",
            [email]
        );

        if (users.length === 0) {
            // Don't reveal if email exists for security
            return res.json({
                success: true,
                message: "Nếu email tồn tại, mã xác nhận đã được gửi"
            });
        }

        // Generate reset code (6 digits)
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save reset code to database
        await db.query(
            `INSERT INTO password_resets (user_id, email, reset_code, reset_token, expires_at) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             reset_code = VALUES(reset_code),
             reset_token = VALUES(reset_token),
             expires_at = VALUES(expires_at),
             created_at = NOW()`,
            [users[0].id, email, resetCode, resetToken, expiresAt]
        );

        // In production, send email here
        console.log(`Reset code for ${email}: ${resetCode}`);

        res.json({
            success: true,
            message: "Mã xác nhận đã được gửi đến email của bạn",
            data: {
                // In development, return code for testing
                code: process.env.NODE_ENV === 'development' ? resetCode : undefined
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Verify Reset Code
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mã xác nhận"
            });
        }

        // Find reset record
        const [resets] = await db.query(
            `SELECT * FROM password_resets 
             WHERE email = ? AND reset_code = ? AND expires_at > NOW() AND used = 0
             ORDER BY created_at DESC LIMIT 1`,
            [email, code]
        );

        if (resets.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Mã xác nhận không đúng hoặc đã hết hạn"
            });
        }

        res.json({
            success: true,
            message: "Mã xác nhận hợp lệ",
            data: {
                token: resets[0].reset_token
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, new_password } = req.body;

        if (!email || !token || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin"
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }

        // Verify reset token
        const [resets] = await db.query(
            `SELECT * FROM password_resets 
             WHERE email = ? AND reset_token = ? AND expires_at > NOW() AND used = 0
             ORDER BY created_at DESC LIMIT 1`,
            [email, token]
        );

        if (resets.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email]
        );

        // Mark reset as used
        await db.query(
            "UPDATE password_resets SET used = 1 WHERE id = ?",
            [resets[0].id]
        );

        res.json({
            success: true,
            message: "Đặt lại mật khẩu thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            "SELECT id, full_name, email, phone, address, user_type, avatar_url, created_at FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, address, avatar_url, current_password, new_password } = req.body;

        // If password change is requested
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập mật khẩu hiện tại"
                });
            }

            // Get current user
            const [users] = await db.query(
                "SELECT password FROM users WHERE id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng"
                });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(current_password, users[0].password);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Mật khẩu hiện tại không đúng"
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(new_password, 10);

            // Update password
            await db.query(
                "UPDATE users SET password = ? WHERE id = ?",
                [hashedPassword, userId]
            );
        }

        // Update profile info
        const updateFields = [];
        const updateValues = [];

        if (full_name !== undefined) {
            updateFields.push("full_name = ?");
            updateValues.push(full_name);
        }
        if (phone !== undefined) {
            updateFields.push("phone = ?");
            updateValues.push(phone);
        }
        if (address !== undefined) {
            updateFields.push("address = ?");
            updateValues.push(address);
        }
        if (avatar_url !== undefined && avatar_url !== null) {
            updateFields.push("avatar_url = ?");
            updateValues.push(avatar_url);
        }

        if (updateFields.length > 0) {
            updateValues.push(userId);
            const [result] = await db.query(
                `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
                updateValues
            );
            
            // Log để debug
            console.log(`Updated user ${userId} with fields: ${updateFields.join(", ")}`);
        }

        // Return updated user data
        const [updatedUsers] = await db.query(
            "SELECT id, full_name, email, phone, address, user_type, avatar_url, created_at FROM users WHERE id = ?",
            [userId]
        );

        res.json({
            success: true,
            message: "Cập nhật thông tin thành công",
            data: updatedUsers[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Logout
exports.logout = async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // You can implement token blacklisting here if needed
    res.json({
        success: true,
        message: "Đăng xuất thành công"
    });
};

