const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    trim: true
  },
  nameCN: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descriptionCN: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('souvenir', 'electronics', 'clothing', 'food', 'cosmetics', 'other'),
    defaultValue: 'souvenir'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '封面图（列表页显示）'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'CNY'
  },
  taobaoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pinduoduoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  expressDeliveryAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expressDeliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: false
});

module.exports = Product;
