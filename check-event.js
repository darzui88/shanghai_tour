const { sequelize } = require('./server/config/database');
const Event = require('./server/models/Event');

(async () => {
  await sequelize.authenticate();
  
  // 查找标题为 "A Dream of Red Mansions by The National Ballet of China" 的活动
  const event = await Event.findOne({ 
    where: { 
      title: 'A Dream of Red Mansions by The National Ballet of China' 
    } 
  });
  
  if (event) {
    console.log('Title:', event.title);
    console.log('Venue Name:', event.venue ? event.venue.name : 'N/A');
    console.log('Address:', event.venue ? event.venue.address : 'N/A');
    console.log('Time:', event.startTime || 'N/A');
    console.log('Price:', event.price ? event.price.note : 'N/A');
    console.log('Description:', event.description ? event.description.substring(0, 150) + '...' : 'N/A');
  } else {
    console.log('Event not found. Searching for similar...');
    const events = await Event.findAll({ 
      where: { 
        title: { [require('sequelize').Op.like]: '%Dream of Red Mansions%' } 
      },
      limit: 5
    });
    events.forEach(e => {
      console.log('\n---');
      console.log('Title:', e.title);
      console.log('Venue Name:', e.venue ? e.venue.name : 'N/A');
      console.log('Address:', e.venue ? e.venue.address : 'N/A');
    });
  }
  
  process.exit(0);
})().catch(console.error);
