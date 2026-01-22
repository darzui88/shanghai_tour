require('dotenv').config();
const puppeteer = require('puppeteer');
const scraper = require('./server/scrapers/smartShanghaiScraper');

const articleUrl = 'https://mp.weixin.qq.com/s/2_95Te5qKLE5m3XZ_kwNbA';

async function previewScrapeEvent() {
  console.log('🚀 开始抓取公众号文章中的活动信息（预览模式，不保存到数据库）...\n');
  console.log(`📄 文章链接: ${articleUrl}\n`);
  
  let browser;
  try {
    console.log('🚀 启动浏览器...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 设置真实的用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 访问文章
    console.log('📖 正在访问文章页面...');
    try {
      await page.goto(articleUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('⚠️ 首次加载超时，尝试继续...');
    }
    
    // 等待内容加载
    console.log('⏳ 等待页面内容加载...');
    await page.waitForTimeout(8000);
    
    // 尝试等待关键元素
    try {
      await page.waitForSelector('#js_content, .rich_media_content, article', { timeout: 10000 });
    } catch (e) {
      console.log('⚠️ 未找到标准内容选择器，继续尝试...');
    }

    // 提取文章中的所有活动（只提取，不保存）
    console.log('📝 正在提取活动信息...');
    const events = await scraper.extractEventsFromWeChatArticle(page, articleUrl);
    
    console.log(`\n✅ 从文章中提取到 ${events.length} 个活动\n`);
    console.log('='.repeat(80));
    
    // 处理和显示每个活动
    events.forEach((eventData, index) => {
      const processedEvent = scraper.processEventData(eventData);
      
      console.log(`\n📌 活动 ${index + 1}:`);
      console.log('-'.repeat(80));
      console.log(`标题: ${processedEvent.title}`);
      if (processedEvent.titleCN) {
        console.log(`中文标题: ${processedEvent.titleCN}`);
      }
      console.log(`分类: ${processedEvent.category}`);
      
      if (processedEvent.venueName) {
        console.log(`地点名称: ${processedEvent.venueName}`);
      }
      if (processedEvent.venueAddress) {
        console.log(`地点地址: ${processedEvent.venueAddress}`);
      }
      
      if (processedEvent.startTime) {
        console.log(`时间: ${processedEvent.startTime}`);
      }
      if (processedEvent.startDate) {
        const startDate = new Date(processedEvent.startDate);
        console.log(`开始日期: ${startDate.toLocaleDateString('zh-CN')}`);
      }
      if (processedEvent.endDate) {
        const endDate = new Date(processedEvent.endDate);
        console.log(`结束日期: ${endDate.toLocaleDateString('zh-CN')}`);
      }
      
      if (processedEvent.price) {
        if (processedEvent.price.note) {
          console.log(`价格: ${processedEvent.price.note}`);
        } else if (processedEvent.price.amount) {
          console.log(`价格: ${processedEvent.price.currency} ${processedEvent.price.amount}`);
        }
      }
      
      if (processedEvent.description) {
        const descPreview = processedEvent.description.length > 200 
          ? processedEvent.description.substring(0, 200) + '...' 
          : processedEvent.description;
        console.log(`描述: ${descPreview}`);
      }
      
      if (processedEvent.images && processedEvent.images.length > 0) {
        console.log(`图片数量: ${processedEvent.images.length}`);
        if (processedEvent.listImage) {
          console.log(`列表图: ${processedEvent.listImage.substring(0, 80)}...`);
        }
      }
      
      if (processedEvent.ticketUrl) {
        console.log(`购票链接: ${processedEvent.ticketUrl}`);
      }
      
      if (processedEvent.tags && processedEvent.tags.length > 0) {
        console.log(`标签: ${processedEvent.tags.join(', ')}`);
      }
      
      console.log('-'.repeat(80));
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ 预览完成！共提取 ${events.length} 个活动`);
    console.log('='.repeat(80));
    console.log('\n💡 提示：这是预览模式，数据未保存到数据库');
    console.log('   如需保存，请运行: node test-scrape-event.js\n');
    
  } catch (error) {
    console.error('\n❌ 抓取失败:', error.message);
    if (error.stack) {
      console.error('\n详细错误信息:');
      console.error(error.stack);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

previewScrapeEvent();
