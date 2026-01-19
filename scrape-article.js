const scraper = require('./server/scrapers/smartShanghaiScraper');

const articleUrl = 'https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q';

async function scrapeArticle() {
  console.log('🚀 开始抓取公众号文章...\n');
  console.log(`📄 文章链接: ${articleUrl}\n`);
  
  try {
    const result = await scraper.scrapeWeChatArticle(articleUrl);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 抓取完成！');
    console.log('='.repeat(50));
    console.log(`📝 新增活动: ${result.newEvents} 个`);
    console.log(`🔄 更新活动: ${result.updatedEvents} 个`);
    console.log(`📊 总共提取: ${result.total} 个活动`);
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

scrapeArticle();
