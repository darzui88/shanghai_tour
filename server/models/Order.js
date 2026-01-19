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
    beforeCreate: async (order) => {
      if (!order.orderNumber) {
        const count = await Order.count();
        order.orderNumber = `STG${Date.now()}${count.toString().padStart(6, '0')}`;
      }
    }
  }
});

module.exports = Order;
