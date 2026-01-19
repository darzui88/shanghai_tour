const { sequelize } = require('./config/database');
const Admin = require('./models/Admin');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    // 同步Admin模型（创建表）
    await Admin.sync({ alter: true });
    console.log('✅ Admin table synced');

    // 检查是否已存在管理员
    const existingAdmin = await Admin.findOne({
      where: { username: '15618963396' }
    });

    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在');
      console.log('   用户名:', existingAdmin.username);
      console.log('   角色:', existingAdmin.role);
      console.log('   状态:', existingAdmin.isActive ? '激活' : '未激活');
      
      // 直接更新密码为123456（自动加密）
      existingAdmin.password = '123456'; // 会被beforeUpdate hook自动加密
      await existingAdmin.save();
      console.log('✅ 密码已重置为 123456');
      process.exit(0);
    } else {
      // 创建初始管理员账号
      const admin = await Admin.create({
        username: '15618963396',
        password: '123456', // 会被beforeCreate hook自动加密
        email: 'admin@shanghaitour.com',
        phone: '15618963396',
        role: 'super_admin',
        isActive: true,
        permissions: ['all'] // 所有权限
      });

      console.log('✅ 初始管理员账号创建成功!');
      console.log('   用户名:', admin.username);
      console.log('   密码: 123456 (已加密存储)');
      console.log('   角色:', admin.role);
      console.log('   邮箱:', admin.email);
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
