require('dotenv').config();
const { sequelize, User } = require('./server/models');

async function testUserModel() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 同步User模型（创建表）
    await User.sync({ alter: true });
    console.log('✅ User表已同步\n');

    console.log('✅ User模型测试完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

testUserModel();
