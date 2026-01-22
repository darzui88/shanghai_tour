require('dotenv').config();
const { testConnection, sequelize } = require('./config/database');
const Location = require('./models/Location');

// 根据前端页面解析方式的营业时间格式（字符串格式）
const updatedOpeningHours = {
  yuyuan: {
    monday: '09:00 - 21:00',
    tuesday: '09:00 - 21:00',
    wednesday: '09:00 - 21:00',
    thursday: '09:00 - 21:00',
    friday: '09:00 - 21:00',
    saturday: '09:00 - 21:00',
    sunday: '09:00 - 21:00'
  },
  tianzifang: {
    monday: '10:00 - 22:00',
    tuesday: '10:00 - 22:00',
    wednesday: '10:00 - 22:00',
    thursday: '10:00 - 22:00',
    friday: '10:00 - 22:00',
    saturday: '10:00 - 22:30',
    sunday: '10:00 - 22:00'
  },
  nanjing: {
    monday: '10:00 - 22:00',
    tuesday: '10:00 - 22:00',
    wednesday: '10:00 - 22:00',
    thursday: '10:00 - 22:00',
    friday: '10:00 - 22:30',
    saturday: '10:00 - 22:30',
    sunday: '10:00 - 22:00'
  },
  xintiandi: {
    monday: '10:00 - 22:00',
    tuesday: '10:00 - 22:00',
    wednesday: '10:00 - 22:00',
    thursday: '10:00 - 22:00',
    friday: '10:00 - 23:00',
    saturday: '10:00 - 23:00',
    sunday: '10:00 - 22:00'
  },
  museum: {
    monday: '', // 空字符串表示关闭
    tuesday: '09:00 - 17:00',
    wednesday: '09:00 - 17:00',
    thursday: '09:00 - 17:00',
    friday: '09:00 - 17:00',
    saturday: '09:00 - 17:00',
    sunday: '09:00 - 17:00'
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
    console.log('\n营业时间格式（符合前端解析方式）:');
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
