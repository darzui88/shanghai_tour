require('dotenv').config();
const { testConnection, sequelize } = require('./config/database');
const Location = require('./models/Location');

// 更新的营业时间格式（JSON格式）
const updatedOpeningHours = {
  yuyuan: {
    monday: { open: '09:00', close: '21:00', isOpen: true },
    tuesday: { open: '09:00', close: '21:00', isOpen: true },
    wednesday: { open: '09:00', close: '21:00', isOpen: true },
    thursday: { open: '09:00', close: '21:00', isOpen: true },
    friday: { open: '09:00', close: '21:00', isOpen: true },
    saturday: { open: '09:00', close: '21:00', isOpen: true },
    sunday: { open: '09:00', close: '21:00', isOpen: true },
    note: 'Some shops may have different hours'
  },
  tianzifang: {
    monday: { open: '10:00', close: '22:00', isOpen: true },
    tuesday: { open: '10:00', close: '22:00', isOpen: true },
    wednesday: { open: '10:00', close: '22:00', isOpen: true },
    thursday: { open: '10:00', close: '22:00', isOpen: true },
    friday: { open: '10:00', close: '22:00', isOpen: true },
    saturday: { open: '10:00', close: '22:30', isOpen: true },
    sunday: { open: '10:00', close: '22:00', isOpen: true },
    note: 'Individual shops may vary'
  },
  nanjing: {
    monday: { open: '10:00', close: '22:00', isOpen: true },
    tuesday: { open: '10:00', close: '22:00', isOpen: true },
    wednesday: { open: '10:00', close: '22:00', isOpen: true },
    thursday: { open: '10:00', close: '22:00', isOpen: true },
    friday: { open: '10:00', close: '22:30', isOpen: true },
    saturday: { open: '10:00', close: '22:30', isOpen: true },
    sunday: { open: '10:00', close: '22:00', isOpen: true },
    note: 'Individual stores may vary, some open earlier'
  },
  xintiandi: {
    monday: { open: '10:00', close: '22:00', isOpen: true },
    tuesday: { open: '10:00', close: '22:00', isOpen: true },
    wednesday: { open: '10:00', close: '22:00', isOpen: true },
    thursday: { open: '10:00', close: '22:00', isOpen: true },
    friday: { open: '10:00', close: '23:00', isOpen: true },
    saturday: { open: '10:00', close: '23:00', isOpen: true },
    sunday: { open: '10:00', close: '22:00', isOpen: true },
    note: 'Restaurants and bars may stay open later'
  },
  museum: {
    monday: { open: null, close: null, isOpen: false, note: 'Closed - Museum closed on Mondays' },
    tuesday: { open: '09:00', close: '17:00', isOpen: true },
    wednesday: { open: '09:00', close: '17:00', isOpen: true },
    thursday: { open: '09:00', close: '17:00', isOpen: true },
    friday: { open: '09:00', close: '17:00', isOpen: true },
    saturday: { open: '09:00', close: '17:00', isOpen: true },
    sunday: { open: '09:00', close: '17:00', isOpen: true },
    note: 'Last admission 30 minutes before closing'
  }
};

async function updateOpeningHours() {
  try {
    console.log('正在连接数据库...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ 数据库连接失败');
      process.exit(1);
    }
    console.log('✅ 数据库连接成功');

    // 更新每个地点的营业时间
    const locations = [
      { name: 'Yuyuan Garden & Bazaar', hours: updatedOpeningHours.yuyuan },
      { name: 'Tianzifang Creative Park', hours: updatedOpeningHours.tianzifang },
      { name: 'Nanjing Road Pedestrian Street', hours: updatedOpeningHours.nanjing },
      { name: 'Xintiandi', hours: updatedOpeningHours.xintiandi },
      { name: 'Shanghai Museum Gift Shop', hours: updatedOpeningHours.museum }
    ];

    let updatedCount = 0;
    for (const { name, hours } of locations) {
      const location = await Location.findOne({ where: { name } });
      if (location) {
        await location.update({ openingHours: hours });
        console.log(`✅ 已更新: ${location.nameCN} 的营业时间`);
        updatedCount++;
      } else {
        console.log(`⚠️  未找到: ${name}`);
      }
    }

    console.log(`\n✅ 成功更新 ${updatedCount} 条地点的营业时间`);
    console.log('\n营业时间格式示例:');
    console.log(JSON.stringify(updatedOpeningHours.yuyuan, null, 2));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新时出错:', error);
    await sequelize.close();
    process.exit(1);
  }
}

updateOpeningHours();
