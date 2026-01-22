const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'shanghai-tour-guide-user-secret-key-2024';

// 验证用户权限的中间件
const authenticateUser = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided or invalid format' 
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid or expired token' 
        });
      }

      // 从数据库验证用户是否仍然存在且激活
      try {
        const user = await User.findOne({
          where: {
            id: decoded.id,
            isActive: true
          },
          attributes: { exclude: ['password'] } // 不返回密码
        });

        if (!user) {
          return res.status(401).json({ 
            success: false,
            error: 'User not found or inactive' 
          });
        }

        // 将用户信息添加到请求对象
        req.user = {
          id: user.id,
          email: user.email
        };
        next();
      } catch (dbError) {
        console.error('Database error in user auth middleware:', dbError);
        return res.status(500).json({ 
          success: false,
          error: 'Authentication verification failed' 
        });
      }
    });
  } catch (error) {
    console.error('User auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Authentication failed' 
    });
  }
};

module.exports = authenticateUser;
