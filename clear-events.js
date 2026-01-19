const { sequelize } = require('./server/config/database');
const Event = require('./server/models/Event');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');
    
    // 清空 events 表
    const deleted = await Event.destroy({ 
      where: {},
      truncate: true,
      restartIdentity: true 
    });
    
    console.log('✅ events表已清空');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
