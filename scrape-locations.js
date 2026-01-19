const locationScraper = require('./server/scrapers/locationScraper');

// 要抓取的文章URL
const articleUrl = 'https://mp.weixin.qq.com/s/NC9jENBxND4zOrQJ1TVk7A';

async function scrapeLocations() {
  console.log('🚀 开始抓取公众号文章中的地点信息...\n');
  console.log(`📄 文章链接: ${articleUrl}\n`);
  
  try {
    const result = await locationScraper.scrapeLocationsFromWeChatArticle(articleUrl);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 抓取完成！');
    console.log('='.repeat(50));
    console.log(`📝 新增地点: ${result.newLocations} 个`);
    console.log(`🔄 更新地点: ${result.updatedLocations} 个`);
    console.log(`📊 总共提取: ${result.total} 个地点`);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 抓取失败:', error.message);
    if (error.stack) {
      console.error('\n详细错误信息:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

scrapeLocations();
