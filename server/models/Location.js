const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nameCN: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  addressCN: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Shanghai',
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  coordinates: {
    type: DataTypes.JSON,
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
  categories: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  products: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  openingHours: {
    type: DataTypes.JSON,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  transport: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tips: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'locations',
  timestamps: true,
  underscored: false
});

module.exports = Location;
