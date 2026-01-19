const { sequelize } = require('./server/config/database');
const Event = require('./server/models/Event');
const { Op } = require('sequelize');

(async () => {
  await sequelize.authenticate();
  
  // 查找所有活动，按标题分组
  const allEvents = await Event.findAll({
    order: [['title', 'ASC']]
  });
  
  // 统计相同标题的活动
  const titleMap = new Map();
  allEvents.forEach(event => {
    const normalizedTitle = event.title.trim().toLowerCase();
    if (!titleMap.has(normalizedTitle)) {
      titleMap.set(normalizedTitle, []);
    }
    titleMap.get(normalizedTitle).push(event);
  });
  
  // 找出重复的标题
  const duplicates = [];
  titleMap.forEach((events, title) => {
    if (events.length > 1) {
      duplicates.push({ title, events });
    }
  });
  
  console.log(`总共 ${allEvents.length} 个活动`);
  console.log(`有 ${duplicates.length} 个标题重复`);
  
  if (duplicates.length > 0) {
    console.log('\n重复的活动:');
    duplicates.forEach(({ title, events }) => {
      console.log(`\n标题: ${events[0].title}`);
      events.forEach(e => {
        console.log(`  ID: ${e.id} | 描述: ${e.description ? e.description.substring(0, 50) + '...' : '无描述'}`);
      });
    });
  }
  
  process.exit(0);
})().catch(console.error);
