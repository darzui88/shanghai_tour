const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 英文标题
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // 中文标题（可选）
  titleCN: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // 英文描述
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // 中文描述（可选）
  descriptionCN: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('exhibition', 'concert', 'festival', 'workshop', 'sports', 'food', 'art', 'music', 'other'),
    defaultValue: 'other'
  },
  // 地点名称
  venueName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '地点名称'
  },
  // 地点地址
  venueAddress: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '地点地址'
  },
  // 城市
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '城市'
  },
  // 区
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '区'
  },
  // 时间信息
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开始日期（可选）'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束日期（可选）'
  },
  startTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '开始时间（如：8:00 PM）'
  },
  endTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '结束时间（如：10:00 PM）'
  },
  // 营业时间（Opening Hours）
  openingHours: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '营业时间（格式同Location的openingHours）'
  },
  // 价格信息
  price: {
    type: DataTypes.JSON,
    allowNull: true,
    // 格式: { amount: 100, currency: "CNY", note: "¥100起" }
    comment: '价格信息'
  },
  // 图片（最多5张）
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '活动图片数组，最多5张'
  },
  // 列表页图片（单张）
  listImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '列表页显示的缩略图'
  },
  // 购票链接
  ticketUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '购票链接URL'
  },
  // 备注
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注信息'
  },
  // 其他字段
  source: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '数据来源信息'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '标签数组'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推荐'
  },
  language: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '支持的语言'
  },
  contact: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '联系方式'
  }
}, {
  tableName: 'events',
  timestamps: true,
  underscored: false,
  indexes: [
    { fields: ['startDate', 'endDate'] },
    { fields: ['category'] },
    { fields: ['featured'] },
    { fields: ['venueName'] }
  ]
});

module.exports = Event;
