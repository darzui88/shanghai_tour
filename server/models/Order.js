const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '用户ID（如果用户已登录）'
  },
  user: {
    type: DataTypes.JSON,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  shipping: {
    type: DataTypes.JSON,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'purchased', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付截止时间（订单创建后10分钟）'
  },
  taobaoOrderIds: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  pinduoduoOrderIds: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: false,
  hooks: {
    beforeCreate: async (order, options) => {
      if (!order.orderNumber) {
        try {
          // Generate unique order number
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          order.orderNumber = `STG${timestamp}${random}`;
          console.log(`Generated order number: ${order.orderNumber}`);
        } catch (error) {
          console.error('Error generating order number:', error);
          // Fallback: use timestamp + random if count fails
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          order.orderNumber = `STG${timestamp}${random}`;
        }
      }
    }
  }
});

module.exports = Order;
