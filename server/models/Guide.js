const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Guide = sequelize.define('Guide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 标题
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '攻略标题'
  },
  // 中文标题（可选）
  titleCN: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '中文标题'
  },
  // 正文内容（HTML格式，支持图文混排和超链接）
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: '攻略正文（HTML格式）'
  },
  // 是否置顶
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶'
  },
  // 头图
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '头图URL'
  },
  // 标签（JSON数组）
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '标签数组'
  },
  // 分类
  category: {
    type: DataTypes.ENUM('transport', 'shopping', 'food', 'sightseeing', 'culture', 'tips', 'other'),
    defaultValue: 'tips',
    comment: '攻略分类'
  },
  // 浏览量
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览量'
  },
  // 是否发布
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否发布'
  },
  // 排序权重（用于排序，数字越大越靠前）
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序权重'
  },
  // 摘要/简介
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '攻略摘要'
  }
}, {
  tableName: 'guides',
  timestamps: true,
  underscored: false,
  indexes: [
    { fields: ['isPinned', 'sortOrder'] },
    { fields: ['category'] },
    { fields: ['isPublished'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Guide;
