const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const Guide = require('../models/Guide');
const { Op } = require('sequelize');

class WeChatScraper {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads/guides');
    this.ensureUploadDir();
  }

  // 确保上传目录存在
  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('创建上传目录失败:', error);
    }
  }

  // 下载图片到本地
  async downloadImage(imageUrl, guideId, index) {
    try {
      console.log(`📥 正在下载图片 ${index + 1}: ${imageUrl.substring(0, 50)}...`);
      
      // 获取图片数据
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        headers: {
          'Referer': 'https://mp.weixin.qq.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // 从Content-Type或URL推断文件扩展名
      let ext = 'jpg';
      const contentType = response.headers['content-type'];
      if (contentType) {
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('gif')) ext = 'gif';
        else if (contentType.includes('webp')) ext = 'webp';
      } else {
        const urlMatch = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i);
        if (urlMatch) ext = urlMatch[1].toLowerCase();
      }

      // 生成文件名
      const timestamp = Date.now();
      const filename = `${guideId}-${timestamp}-${index}.${ext}`;
      const filepath = path.join(this.uploadDir, filename);

      // 保存文件
      await fs.writeFile(filepath, response.data);

      // 返回相对路径和URL
      const relativePath = `uploads/guides/${filename}`;
      return {
        originalUrl: imageUrl,
        localPath: relativePath,
        filename: filename,
        url: `/uploads/guides/${filename}`
      };
    } catch (error) {
      console.error(`❌ 下载图片失败: ${imageUrl}`, error.message);
      return null;
    }
  }

  // 批量下载图片
  async downloadImages(imageUrls, guideId) {
    const downloadedImages = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      if (!imageUrl || imageUrl.includes('data:image')) continue;
      
      const result = await this.downloadImage(imageUrl, guideId, i);
      if (result) {
        downloadedImages.push(result);
        // 添加延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return downloadedImages;
  }

  // 替换HTML中的图片链接
  replaceImageUrls(html, downloadedImages) {
    let newHtml = html;
    
    downloadedImages.forEach((img, index) => {
      // 替换所有可能的URL格式（原始URL、data-src等）
      const patterns = [
        img.originalUrl,
        img.originalUrl.replace(/&amp;/g, '&'),
        img.originalUrl.replace(/&/g, '&amp;')
      ];

      patterns.forEach(pattern => {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        newHtml = newHtml.replace(regex, img.url);
      });
    });

    return newHtml;
  }

  // 抓取公众号文章
  async scrapeArticle(articleUrl, options = {}) {
    const {
      downloadImages: shouldDownload = true,
      category = 'tips',
      tags = [],
      isPublished = true
    } = options;

    let browser;
    try {
      console.log('🚀 开始抓取公众号文章:', articleUrl);
      
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-web-security'
        ]
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // 设置真实的用户代理
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 设置请求头
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      // 拦截图片请求，确保加载真实图片
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        // 允许所有请求
        request.continue();
      });

      // 访问文章
      console.log('📖 正在访问文章页面...');
      try {
        await page.goto(articleUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 90000 
        });
      } catch (error) {
        console.log('⚠️ 加载超时，继续尝试...');
      }
      
      // 等待内容加载
      console.log('⏳ 等待页面内容加载...');
      await page.waitForTimeout(10000);

      // 滚动页面以触发懒加载
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(2000);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);

      // 提取文章信息
      const articleData = await page.evaluate(() => {
        // 提取标题（多种可能的选择器）
        let title = '';
        let titleCN = '';
        
        const titleSelectors = [
          '#activity-name',
          '.rich_media_title',
          'h1.rich_media_title',
          'h2.rich_media_title',
          'meta[property="og:title"]',
          'title'
        ];

        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            title = element.textContent?.trim() || element.content || element.innerText?.trim() || '';
            if (title) {
              titleCN = title; // 中文标题通常和英文标题相同
              break;
            }
          }
        }

        // 提取正文内容（微信文章的主要容器）
        let contentElement = null;
        const contentSelectors = [
          '#js_content',
          '.rich_media_content',
          'article',
          '.content',
          '#img-content'
        ];

        for (const selector of contentSelectors) {
          contentElement = document.querySelector(selector);
          if (contentElement) break;
        }

        let content = '';
        let coverImage = '';
        const images = [];

        if (contentElement) {
          // 提取封面图（通常在meta标签中）
          const metaImage = document.querySelector('meta[property="og:image"]');
          if (metaImage && metaImage.content) {
            coverImage = metaImage.content;
          }

          // 查找内容中的第一张图片作为封面
          const firstImg = contentElement.querySelector('img');
          if (firstImg && !coverImage) {
            const imgSrc = firstImg.getAttribute('data-src') || firstImg.src;
            if (imgSrc && !imgSrc.includes('data:image')) {
              coverImage = imgSrc;
            }
          }

          // 处理图片：将data-src转换为src，并收集所有图片URL
          const allImages = contentElement.querySelectorAll('img');
          allImages.forEach((img, index) => {
            // 获取图片URL（优先data-src，因为微信懒加载）
            const dataSrc = img.getAttribute('data-src');
            const src = img.getAttribute('src');
            const imgUrl = dataSrc || src;

            if (imgUrl && !imgUrl.includes('data:image') && imgUrl.length > 20) {
              // 设置为src，确保图片可显示
              img.setAttribute('src', imgUrl);
              img.removeAttribute('data-src');
              
              // 收集图片URL
              if (!images.includes(imgUrl)) {
                images.push(imgUrl);
              }
            }
          });

          // 获取HTML内容
          content = contentElement.innerHTML;
          
          // 清理一些不需要的属性
          content = content.replace(/data-src=/gi, 'src=');
          content = content.replace(/data-copyright/gi, '');
          content = content.replace(/data-ratio/gi, '');
          content = content.replace(/data-w/gi, '');
          content = content.replace(/style="[^"]*"/gi, ''); // 移除style属性以简化
          
          // 移除微信特有的无用标签
          content = content.replace(/<section[^>]*>/gi, '');
          content = content.replace(/<\/section>/gi, '');
        }

        // 提取摘要（正文前200字符的纯文本）
        let summary = '';
        if (contentElement) {
          const textContent = contentElement.innerText || contentElement.textContent || '';
          summary = textContent.substring(0, 200).replace(/\s+/g, ' ').trim();
        }

        return {
          title,
          titleCN,
          content,
          coverImage,
          images,
          summary
        };
      });

      console.log('\n📋 提取到的文章信息:');
      console.log('标题:', articleData.title);
      console.log('图片数量:', articleData.images.length);
      console.log('内容长度:', articleData.content.length, '字符');
      console.log('摘要:', articleData.summary.substring(0, 100) + '...');

      if (!articleData.title || !articleData.content) {
        throw new Error('未能提取到有效的标题或内容');
      }

      // 检查是否已存在相同的攻略
      let guide = await Guide.findOne({
        where: {
          title: articleData.title
        }
      });

      // 如果不存在，先创建一个临时ID用于下载图片
      let guideId = guide ? guide.id : `temp-${Date.now()}`;

      // 下载图片（如果需要）
      let downloadedImages = [];
      let finalContent = articleData.content;
      let finalCoverImage = articleData.coverImage;

      if (shouldDownload && articleData.images.length > 0) {
        console.log(`\n📥 开始下载 ${articleData.images.length} 张图片...`);
        
        // 如果是新文章，先创建记录获得真实ID
        if (!guide) {
          guide = await Guide.create({
            title: articleData.title,
            titleCN: articleData.titleCN || articleData.title,
            content: articleData.content, // 临时内容，稍后更新
            summary: articleData.summary,
            coverImage: articleData.coverImage, // 临时封面，稍后更新
            category: category,
            isPublished: isPublished,
            isPinned: false,
            tags: tags,
            sortOrder: 0,
            viewCount: 0
          });
          guideId = guide.id;
          console.log(`✅ 已创建攻略记录，ID: ${guideId}`);
        }

        // 下载所有图片
        downloadedImages = await this.downloadImages(articleData.images, guideId);

        if (downloadedImages.length > 0) {
          console.log(`✅ 成功下载 ${downloadedImages.length} 张图片`);

          // 替换HTML中的图片URL
          finalContent = this.replaceImageUrls(articleData.content, downloadedImages);

          // 如果有封面图且被下载了，更新封面图URL
          const coverDownloaded = downloadedImages.find(img => 
            img.originalUrl === articleData.coverImage
          );
          if (coverDownloaded) {
            finalCoverImage = coverDownloaded.url;
          } else if (downloadedImages.length > 0) {
            // 如果没有下载封面图，使用第一张下载的图片作为封面
            finalCoverImage = downloadedImages[0].url;
          }
        }
      }

      // 更新或创建攻略
      if (guide) {
        // 更新现有攻略
        await guide.update({
          content: finalContent,
          summary: articleData.summary,
          coverImage: finalCoverImage || guide.coverImage,
          titleCN: articleData.titleCN || guide.titleCN,
          category: category || guide.category,
          tags: tags.length > 0 ? tags : guide.tags
        });
        console.log('✅ 攻略更新成功！');
        console.log('攻略ID:', guide.id);
      } else {
        // 创建新攻略
        guide = await Guide.create({
          title: articleData.title,
          titleCN: articleData.titleCN || articleData.title,
          content: finalContent,
          summary: articleData.summary,
          coverImage: finalCoverImage || null,
          category: category,
          isPublished: isPublished,
          isPinned: false,
          tags: tags,
          sortOrder: 0,
          viewCount: 0
        });
        console.log('✅ 攻略创建成功！');
        console.log('攻略ID:', guide.id);
      }

      console.log('\n' + '='.repeat(50));
      console.log('✅ 抓取完成！');
      console.log(`📊 统计:`);
      console.log(`   - 标题: ${guide.title}`);
      console.log(`   - 图片: ${downloadedImages.length} 张已下载`);
      console.log(`   - 内容长度: ${finalContent.length} 字符`);
      console.log('='.repeat(50));

      return {
        success: true,
        guide: guide.toJSON(),
        imagesDownloaded: downloadedImages.length
      };

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
    }
  }

  // 批量抓取多个文章
  async scrapeMultipleArticles(articleUrls, options = {}) {
    const results = [];
    
    for (let i = 0; i < articleUrls.length; i++) {
      const url = articleUrls[i];
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📄 处理第 ${i + 1}/${articleUrls.length} 篇文章`);
      console.log('='.repeat(50));
      
      try {
        const result = await this.scrapeArticle(url, options);
        results.push({ url, success: true, ...result });
        
        // 添加延迟，避免请求过快
        if (i < articleUrls.length - 1) {
          console.log('\n⏳ 等待 3 秒后继续...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ 抓取失败: ${url}`, error.message);
        results.push({ url, success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new WeChatScraper();
