require('dotenv').config();
const Event = require('./server/models/Event');
const { Op } = require('sequelize');

(async () => {
  try {
    // Get all events created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const events = await Event.findAll({
      where: {
        createdAt: {
          [Op.gte]: oneHourAgo
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    console.log(`找到 ${events.length} 个活动:\n`);
    events.forEach((e, i) => {
      const venue = typeof e.venue === 'string' ? JSON.parse(e.venue || '{}') : (e.venue || {});
      console.log(`${i+1}. ${e.title}`);
      console.log(`   日期: ${e.startDate}`);
      console.log(`   场地: ${venue.name || 'N/A'}`);
      console.log(`   价格: ${e.price ? (typeof e.price === 'string' ? JSON.parse(e.price).note || e.price : e.price.note || 'N/A') : 'N/A'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
})();
