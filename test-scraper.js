const scraper = require('./server/scrapers/smartShanghaiScraper');

async function testScraper() {
  console.log('🚀 开始测试 SmartShanghai 抓取器...\n');
  
  try {
    const result = await scraper.scrapeEvents();
    
    console.log('\n✅ 抓取完成！');
    console.log(`   新活动: ${result.newEvents} 个`);
    console.log(`   更新活动: ${result.updatedEvents} 个`);
    console.log(`   未来1个月内总活动数: ${result.total} 个`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 抓取失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testScraper();
