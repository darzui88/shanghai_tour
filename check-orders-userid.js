require('dotenv').config();
const { sequelize, Order, User } = require('./server/models');

async function checkOrdersUserId() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询最近的订单
    const recentOrders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log(`📦 最近的 ${recentOrders.length} 个订单：\n`);
    
    for (const order of recentOrders) {
      console.log(`订单号: ${order.orderNumber}`);
      console.log(`用户ID: ${order.userId || '(游客订单)'}`);
      console.log(`用户邮箱: ${order.user?.email || order.user?.Email || '-'}`);
      console.log(`订单状态: ${order.status}`);
      console.log(`创建时间: ${order.createdAt}`);
      console.log('-'.repeat(50));
    }

    // 查询有userId的订单数量
    const ordersWithUserId = await Order.count({
      where: {
        userId: { [require('sequelize').Op.ne]: null }
      }
    });

    console.log(`\n📊 统计:`);
    console.log(`   - 总订单数: ${await Order.count()}`);
    console.log(`   - 关联用户的订单: ${ordersWithUserId}`);
    console.log(`   - 游客订单: ${await Order.count() - ordersWithUserId}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    await sequelize.close();
    process.exit(1);
  }
}

checkOrdersUserId();
