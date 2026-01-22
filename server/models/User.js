const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: '用户邮箱（登录账号）'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '加密后的密码'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '用户姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号码'
  },
  // 收货地址信息（JSON格式，支持多个地址）
  addresses: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '收货地址列表，格式：[{name, phone, address, isDefault}]'
  },
  // 默认收货地址索引
  defaultAddressIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '默认收货地址索引'
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
  tableName: 'users',
  timestamps: true,
  underscored: false,
  indexes: [
    { fields: ['email'] },
    { fields: ['isActive'] }
  ],
  hooks: {
    // 创建前加密密码
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // 更新前加密密码（如果密码被修改）
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// 实例方法：验证密码
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 实例方法：获取默认收货地址
User.prototype.getDefaultAddress = function() {
  if (!this.addresses || this.addresses.length === 0) {
    return null;
  }
  const index = this.defaultAddressIndex >= 0 && this.defaultAddressIndex < this.addresses.length
    ? this.defaultAddressIndex
    : 0;
  return this.addresses[index];
};

// 类方法：通过邮箱查找用户并验证密码
User.authenticate = async function(email, password) {
  const user = await User.findOne({
    where: {
      email: email.toLowerCase().trim(),
      isActive: true
    }
  });

  if (!user) {
    return null;
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    return null;
  }

  // 更新最后登录信息
  await user.update({
    lastLogin: new Date()
  });

  return user;
};

module.exports = User;
