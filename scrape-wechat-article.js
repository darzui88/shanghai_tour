require('dotenv').config();
const { testConnection, sequelize } = require('./server/config/database');
const wechatScraper = require('./server/scrapers/wechatScraper');

// 获取命令行参数
const articleUrl = process.argv[2];
const shouldDownloadImages = process.argv[3] !== '--no-images'; // 默认下载图片
const category = process.argv[4] || 'tips'; // 默认分类

async function main() {
  try {
    // 连接数据库
    await testConnection();
    console.log('✅ 数据库连接成功\n');

    if (!articleUrl) {
      console.log('用法: node scrape-wechat-article.js <文章URL> [--no-images] [category]');
      console.log('');
      console.log('参数:');
      console.log('  <文章URL>      - 必需，微信公众号文章链接');
      console.log('  [--no-images]  - 可选，不下载图片（仅保存图片URL）');
      console.log('  [category]     - 可选，攻略分类 (transport/shopping/food/sightseeing/culture/tips/other)');
      console.log('');
      console.log('示例:');
      console.log('  node scrape-wechat-article.js "https://mp.weixin.qq.com/s/xxx"');
      console.log('  node scrape-wechat-article.js "https://mp.weixin.qq.com/s/xxx" --no-images');
      console.log('  node scrape-wechat-article.js "https://mp.weixin.qq.com/s/xxx" tips');
      process.exit(1);
    }

    console.log('🚀 开始抓取公众号文章...');
    console.log(`📄 文章链接: ${articleUrl}`);
    console.log(`📥 下载图片: ${shouldDownloadImages ? '是' : '否'}`);
    console.log(`📂 分类: ${category}\n`);

    // 抓取文章
    const result = await wechatScraper.scrapeArticle(articleUrl, {
      downloadImages: shouldDownloadImages,
      category: category,
      tags: [],
      isPublished: true
    });

    console.log('\n✅ 全部完成！');
    console.log(`攻略ID: ${result.guide.id}`);
    console.log(`下载图片: ${result.imagesDownloaded} 张`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

main();
