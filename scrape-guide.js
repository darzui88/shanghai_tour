require('dotenv').config();
const puppeteer = require('puppeteer');
const Guide = require('./server/models/Guide');
const { sequelize } = require('./server/config/database');

const articleUrl = 'https://mp.weixin.qq.com/s/zy9KXWaFW4RuZUzUZkRLIA';

async function scrapeGuide() {
  let browser;
  
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    console.log('🚀 开始抓取公众号文章...\n');
    console.log(`📄 文章链接: ${articleUrl}\n`);

    // 启动浏览器
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 设置真实的用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 添加额外的请求头
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // 访问文章
    console.log('📖 正在访问文章页面...');
    try {
      await page.goto(articleUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 90000 
      });
    } catch (error) {
      console.log('⚠️ 首次加载可能超时，尝试继续...');
    }
    
    // 等待更长时间让内容加载
    console.log('⏳ 等待页面内容加载...');
    await page.waitForTimeout(10000);
    
    // 尝试滚动页面以触发懒加载
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2000);

    // 检查是否有验证页面
    const pageContent = await page.content();
    if (pageContent.includes('环境异常') || pageContent.includes('完成验证')) {
      console.log('⚠️ 检测到验证页面，可能需要手动验证');
      console.log('请手动在浏览器中完成验证，然后按回车继续...');
      // 等待更长时间，给用户时间完成验证
      await page.waitForTimeout(30000);
    }

    // 提取文章信息
    console.log('📝 正在提取文章内容...');
    
    const articleData = await page.evaluate(() => {
      // 提取标题
      const titleElement = document.querySelector('#activity-name, .rich_media_title, h1[class*="title"], h2[class*="title"]') ||
                          document.querySelector('h1') || document.querySelector('h2');
      const title = titleElement ? titleElement.innerText.trim() : '';

      // 提取中文标题（可能是同一个标题）
      const titleCN = title;

      // 提取头图
      let coverImage = '';
      const coverSelectors = [
        '#js_cover_img',
        '.rich_media_cover img',
        'meta[property="og:image"]',
        '.album_img img',
        'img[data-src*="mmbiz"]',
        'img[data-src*="wx_fmt"]'
      ];
      
      for (const selector of coverSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          coverImage = element.getAttribute('content') || 
                      element.getAttribute('src') || 
                      element.getAttribute('data-src') || 
                      element.src;
          if (coverImage) break;
        }
      }

      // 提取正文内容（保留HTML格式）
      const contentSelectors = [
        '#js_content',
        '.rich_media_content',
        'article',
        '[id*="content"]',
        '.article-content'
      ];
      
      let contentElement = null;
      for (const selector of contentSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement) break;
      }

      let content = '';
      if (contentElement) {
        // 处理图片：确保data-src转换为src
        const images = contentElement.querySelectorAll('img');
        images.forEach(img => {
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc && !img.src) {
            img.src = dataSrc;
          }
          // 移除data-src属性，只保留src
          img.removeAttribute('data-src');
        });

        // 获取HTML内容
        content = contentElement.innerHTML;
        
        // 清理一些不需要的属性
        content = content.replace(/data-src=/g, 'src=');
        content = content.replace(/data-copyright/g, '');
        content = content.replace(/data-ratio/g, '');
        content = content.replace(/data-w/g, '');
      }

      // 提取摘要（取正文前200字符）
      const textContent = contentElement ? contentElement.innerText : '';
      const summary = textContent.substring(0, 200).replace(/\s+/g, ' ').trim();

      return {
        title,
        titleCN,
        content,
        coverImage,
        summary
      };
    });

    console.log('\n📋 提取到的文章信息:');
    console.log('标题:', articleData.title);
    console.log('摘要:', articleData.summary.substring(0, 100) + '...');
    console.log('头图:', articleData.coverImage || '(未找到)');
    console.log('内容长度:', articleData.content.length, '字符\n');

    if (!articleData.title || !articleData.content) {
      throw new Error('未能提取到有效的标题或内容，可能页面加载不完整');
    }

    // 检查是否已存在相同的攻略
    const existingGuide = await Guide.findOne({
      where: {
        title: articleData.title
      }
    });

    if (existingGuide) {
      console.log('⚠️  已存在相同标题的攻略，是否更新？');
      console.log('现有ID:', existingGuide.id);
      
      // 更新现有攻略
      await existingGuide.update({
        content: articleData.content,
        summary: articleData.summary,
        coverImage: articleData.coverImage || existingGuide.coverImage,
        titleCN: articleData.titleCN
      });
      
      console.log('✅ 攻略更新成功！');
      console.log('攻略ID:', existingGuide.id);
    } else {
      // 创建新攻略
      const newGuide = await Guide.create({
        title: articleData.title,
        titleCN: articleData.titleCN || articleData.title,
        content: articleData.content,
        summary: articleData.summary,
        coverImage: articleData.coverImage || null,
        category: 'tips', // 默认为tips分类
        isPublished: true,
        isPinned: false,
        tags: [],
        sortOrder: 0,
        viewCount: 0
      });
      
      console.log('✅ 攻略创建成功！');
      console.log('攻略ID:', newGuide.id);
      console.log('标题:', newGuide.title);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 抓取完成！');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ 抓取失败:', error.message);
    if (error.stack) {
      console.error('\n详细错误信息:');
      console.error(error.stack);
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
    await sequelize.close();
  }
}

// 运行抓取
scrapeGuide()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
