const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'shanghai-tour-guide-admin-secret-key-2024';

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // 从数据库验证管理员账号
    const admin = await Admin.authenticate(username, password);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // 更新最后登录IP（如果可以从请求中获取）
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    if (clientIp) {
      await admin.update({
        lastLoginIp: clientIp
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      },
      JWT_SECRET,
      { expiresIn: '24h' } // 24小时过期
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Login failed' 
    });
  }
});

// 验证token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      res.json({
        success: true,
        user: decoded
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
