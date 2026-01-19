const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '管理员用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '加密后的密码'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '管理员邮箱'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '管理员手机号'
  },
  role: {
    type: DataTypes.ENUM('admin', 'super_admin', 'editor'),
    defaultValue: 'admin',
    comment: '管理员角色：admin-普通管理员, super_admin-超级管理员, editor-编辑'
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '权限列表（预留字段，用于未来权限细分）'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否激活'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },
  lastLoginIp: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '最后登录IP'
  }
}, {
  tableName: 'admins',
  timestamps: true,
  underscored: false,
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['isActive'] }
  ],
  hooks: {
    // 创建前加密密码
    beforeCreate: async (admin) => {
      if (admin.password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    },
    // 更新前加密密码（如果密码被修改）
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    }
  }
});

// 实例方法：验证密码
Admin.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 类方法：查找管理员并验证密码
Admin.authenticate = async function(username, password) {
  const admin = await Admin.findOne({
    where: {
      username: username,
      isActive: true
    }
  });

  if (!admin) {
    return null;
  }

  const isValid = await admin.validatePassword(password);
  if (!isValid) {
    return null;
  }

  // 更新最后登录信息（不包含密码）
  await admin.update({
    lastLogin: new Date(),
    lastLoginIp: null // 可以从req中获取
  });

  return admin;
};

module.exports = Admin;
