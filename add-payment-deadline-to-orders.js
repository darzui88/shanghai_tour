require('dotenv').config();
const { sequelize } = require('./server/config/database');

async function addPaymentDeadlineToOrders() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查paymentDeadline字段是否已存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'shanghai_tour' 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'paymentDeadline'
    `);

    if (results.length > 0) {
      console.log('✅ paymentDeadline字段已存在');
    } else {
      // 添加paymentDeadline字段
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN paymentDeadline DATETIME NULL COMMENT '支付截止时间（订单创建后10分钟）'
      `);
      console.log('✅ paymentDeadline字段已添加');
    }

    // 为现有未支付的订单设置支付截止时间（如果还没有设置）
    await sequelize.query(`
      UPDATE orders 
      SET paymentDeadline = DATE_ADD(createdAt, INTERVAL 10 MINUTE)
      WHERE paymentStatus = 'pending' 
      AND paymentDeadline IS NULL
    `);
    console.log('✅ 已为现有未支付订单设置支付截止时间');

    console.log('\n✅ 完成！');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

addPaymentDeadlineToOrders();
