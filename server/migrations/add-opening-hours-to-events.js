/**
 * 数据库迁移脚本：为events表添加openingHours字段，并将startDate和endDate改为可空
 * 
 * 运行方式：
 * node server/migrations/add-opening-hours-to-events.js
 */

const { sequelize } = require('../config/database');

async function migrate() {
  try {
    console.log('开始数据库迁移...');

    // 1. 修改startDate和endDate为可空
    console.log('修改startDate和endDate为可空...');
    await sequelize.query(`
      ALTER TABLE events 
      MODIFY COLUMN startDate DATETIME NULL COMMENT '开始日期（可选）',
      MODIFY COLUMN endDate DATETIME NULL COMMENT '结束日期（可选）'
    `);

    // 2. 添加openingHours字段
    console.log('添加openingHours字段...');
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN openingHours JSON NULL COMMENT '营业时间（格式同Location的openingHours）'
      AFTER endTime
    `);

    console.log('✅ 数据库迁移完成！');
    console.log('   - startDate和endDate已改为可空');
    console.log('   - 已添加openingHours字段');
    
    process.exit(0);
  } catch (error) {
    // 如果字段已存在，忽略错误
    if (error.message && (
      error.message.includes('Duplicate column name') ||
      error.message.includes('already exists')
    )) {
      console.log('⚠️  字段可能已存在，跳过...');
      console.log('✅ 迁移完成（部分字段可能已存在）');
      process.exit(0);
    } else {
      console.error('❌ 迁移失败:', error.message);
      process.exit(1);
    }
  }
}

// 运行迁移
migrate();
