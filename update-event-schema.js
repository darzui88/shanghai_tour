require('dotenv').config();
const { syncDatabase } = require('./server/models');

(async () => {
  try {
    console.log('🔄 正在更新数据库表结构...');
    await syncDatabase(false); // alter: true 会修改表结构，false 只会创建新字段
    console.log('✅ 数据库表结构已更新');
    console.log('');
    console.log('新增字段:');
    console.log('  - listImage: 列表页图片');
    console.log('  - ticketUrl: 购票链接');
    console.log('  - notes: 备注信息');
    console.log('');
    console.log('现有字段说明:');
    console.log('  - title: 英文标题');
    console.log('  - description: 英文描述');
    console.log('  - startDate/endDate: 日期');
    console.log('  - venue: {name: "地点名称", address: "具体地址"}');
    console.log('  - price: {amount: 100, currency: "CNY", note: "¥100起"}');
    console.log('  - images: 图片数组（最多5张）');
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
})();
