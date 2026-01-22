require('dotenv').config();
const { sequelize } = require('./server/config/database');

async function addUserIdToOrders() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查userId字段是否已存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'shanghai_tour' 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'userId'
    `);

    if (results.length > 0) {
      console.log('✅ userId字段已存在');
    } else {
      // 添加userId字段
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN userId INTEGER NULL COMMENT '用户ID（如果用户已登录）'
      `);
      console.log('✅ userId字段已添加');
    }

    console.log('\n✅ 完成！');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

addUserIdToOrders();
