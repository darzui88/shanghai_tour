const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateUser = require('../middleware/userAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'shanghai-tour-guide-user-secret-key-2024';

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // 验证必需字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // 创建新用户
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name || null,
      phone: phone || null,
      addresses: [],
      defaultAddressIndex: 0,
      isActive: true
    });

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '30d' } // 30天过期
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // 验证用户
    const user = await User.authenticate(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // 更新最后登录IP
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    if (clientIp) {
      await user.update({
        lastLoginIp: clientIp
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        addresses: user.addresses,
        defaultAddressIndex: user.defaultAddressIndex
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

// 获取当前用户信息（需要登录）
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        addresses: user.addresses || [],
        defaultAddressIndex: user.defaultAddressIndex || 0
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user info'
    });
  }
});

// 更新用户信息（需要登录）
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 更新允许的字段
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        addresses: user.addresses || [],
        defaultAddressIndex: user.defaultAddressIndex || 0
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user info'
    });
  }
});

// 修改密码（需要登录）
router.put('/me/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 验证当前密码
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // 更新密码（会自动加密）
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update password'
    });
  }
});

// 管理收货地址（需要登录）
router.put('/me/addresses', authenticateUser, async (req, res) => {
  try {
    const { addresses, defaultAddressIndex } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 验证地址格式
    if (addresses && Array.isArray(addresses)) {
      // 验证每个地址的格式
      for (const addr of addresses) {
        if (!addr.name || !addr.address) {
          return res.status(400).json({
            success: false,
            error: 'Each address must have name and address'
          });
        }
      }
      user.addresses = addresses;
    }

    if (defaultAddressIndex !== undefined) {
      if (defaultAddressIndex < 0 || 
          (user.addresses && defaultAddressIndex >= user.addresses.length)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid default address index'
        });
      }
      user.defaultAddressIndex = defaultAddressIndex;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        addresses: user.addresses || [],
        defaultAddressIndex: user.defaultAddressIndex || 0
      }
    });
  } catch (error) {
    console.error('Update addresses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update addresses'
    });
  }
});

// 验证token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // 验证用户是否仍然存在且激活
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Token verification failed'
    });
  }
});

module.exports = router;
