const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'shanghai-tour-guide-admin-secret-key-2024';

// 验证管理员权限的中间件
const authenticateAdmin = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided or invalid format' });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // 从数据库验证管理员是否仍然存在且激活
      try {
        const admin = await Admin.findOne({
          where: {
            id: decoded.id,
            isActive: true
          },
          attributes: { exclude: ['password'] } // 不返回密码
        });

        if (!admin) {
          return res.status(401).json({ error: 'Admin account not found or inactive' });
        }

        // 检查是否为管理员角色（支持admin、super_admin、editor）
        if (!['admin', 'super_admin', 'editor'].includes(decoded.role)) {
          return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        // 将用户信息添加到请求对象
        req.user = {
          ...decoded,
          admin: admin // 包含完整的admin对象（不含密码）
        };
        next();
      } catch (dbError) {
        console.error('Database error in auth middleware:', dbError);
        return res.status(500).json({ error: 'Authentication verification failed' });
      }
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = authenticateAdmin;
