/**
 * 精确提取微信公众号文章中的活动信息
 */

const puppeteer = require('puppeteer');

async function analyzeWeChatArticle(url) {
  let browser;
  
  try {
    console.log(`开始分析文章: ${url}\n`);
    
    function getChromeExecutablePath() {
      const os = require('os');
      if (os.platform() === 'win32') {
        const paths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        ];
        for (const path of paths) {
          try {
            require('fs').accessSync(path);
            return path;
          } catch (e) {}
        }
      }
      return null;
    }
    
    const chromePath = getChromeExecutablePath();
    const browserOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    if (chromePath) {
      browserOptions.executablePath = chromePath;
    }
    
    browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('正在加载页面...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // 滚动页面
    await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {
        window.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 300));
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('开始提取活动信息...\n');
    
    // 提取活动信息
    const events = await page.evaluate(() => {
      const fullText = document.body.innerText || '';
      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const eventsList = [];
      
      // 查找所有Date:行
      const dateIndices = [];
      lines.forEach((line, idx) => {
        if (/Date:\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Various)/i.test(line)) {
          dateIndices.push(idx);
        }
      });
      
      // 处理所有找到的Date:标记，但只保留前3个不同的活动
      const processedEvents = new Set(); // 用于去重
      
      dateIndices.forEach((dateIdx, eventNum) => {
        if (eventsList.length >= 3) return; // 只取前3个
        const event = {
          name: '',
          venueName: '',
          venueAddress: '',
          openingHours: '',
          price: '',
          description: ''
        };
        
        // 获取活动块：从Date:前8行到下一个Date:（或后15行）
        const nextDateIdx = dateIndices[eventNum + 1];
        const blockStart = Math.max(0, dateIdx - 8);
        const blockEnd = nextDateIdx ? Math.min(nextDateIdx - 1, dateIdx + 15) : Math.min(dateIdx + 15, lines.length);
        const blockLines = lines.slice(blockStart, blockEnd);
        
        // 在块内找到Date/Address/Price行的位置
        const dateLineIdx = blockLines.findIndex(l => /Date:/i.test(l));
        const addrLineIdx = blockLines.findIndex(l => /Address:/i.test(l));
        const priceLineIdx = blockLines.findIndex(l => /Price:/i.test(l));
        
        // 提取Date（营业时间）
        if (dateLineIdx >= 0) {
          const dateLine = blockLines[dateLineIdx];
          const match = dateLine.match(/Date:\s*([^|]+?)(?:\s*\||$)/i);
          if (match) {
            event.openingHours = match[1].trim();
          }
        }
        
        // 提取Address
        if (addrLineIdx >= 0) {
          const addrLine = blockLines[addrLineIdx];
          const match = addrLine.match(/Address:\s*([^|]+?)(?:\s*\||$)/i);
          if (match) {
            event.venueAddress = match[1].trim();
          }
        }
        
        // 提取Price
        if (priceLineIdx >= 0) {
          const priceLine = blockLines[priceLineIdx];
          const match = priceLine.match(/Price:\s*([^|]+?)(?:\s*\||$)/i);
          if (match) {
            event.price = match[1].trim();
          }
        }
        
        // 提取活动详情（在Price:之后的长文本描述，直到下一个Date:或下一个活动名称）
        if (priceLineIdx >= 0) {
          // 找到Price:之后的内容，但要在下一个Date:之前停止
          const descriptionEndIdx = blockLines.findIndex((l, idx) => 
            idx > priceLineIdx && 
            (/Date:\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Various)/i.test(l) ||
             // 如果遇到下一个活动名称（通常是较短的标题行），也停止
             (idx > priceLineIdx + 1 && 
              l.length > 15 && l.length < 100 &&
              (l.includes(' by ') || l.includes(' at ') || /^[A-Z][^.]{15,80}$/.test(l))))
          );
          
          const descriptionEnd = descriptionEndIdx > priceLineIdx ? descriptionEndIdx : blockLines.length;
          const descriptionLines = blockLines.slice(priceLineIdx + 1, descriptionEnd)
            .filter(l => 
              l.length > 30 && // 详情通常较长
              !l.includes('Date:') && 
              !l.includes('Address:') && 
              !l.includes('Price:') &&
              !l.includes('All Details') &&
              !/^\[SH/.test(l) && // 排除标题
              !l.toLowerCase().includes('smartshanghai') &&
              // 排除可能是下一个活动名称的短行
              !(l.length < 100 && /^[A-Z][^.]{0,80}$/.test(l) && !l.includes(','))
            );
          
          if (descriptionLines.length > 0) {
            // 取第一段较长的描述作为详情
            const firstLongLine = descriptionLines.find(l => l.length > 100);
            if (firstLongLine) {
              event.description = firstLongLine.trim().substring(0, 500);
            } else {
              // 如果没有特别长的行，合并前几行
              event.description = descriptionLines.slice(0, 3).join(' ').trim().substring(0, 500);
            }
          }
        }
        
        // 提取活动名称：在Date:之前，通常是Date:前1-3行中最长的行
        if (dateLineIdx > 0) {
          const nameCandidates = blockLines.slice(0, dateLineIdx)
            .filter(l => 
              l.length > 15 && 
              l.length < 200 &&
              !l.includes('Date:') && 
              !l.includes('Address:') && 
              !l.includes('Price:') &&
              !l.includes('All Details') &&
              !/^\[SH Weekender\]/.test(l) && // 排除文章标题
              !l.toLowerCase().includes('smartshanghai 2026') &&
              !/^\d{4}年/.test(l)
            );
          
          if (nameCandidates.length > 0) {
            // 选择包含"by"或"at"的行，或者最长的行
            event.name = nameCandidates
              .sort((a, b) => {
                const aHasBy = (a.includes(' by ') || a.includes(' at ')) ? 1 : 0;
                const bHasBy = (b.includes(' by ') || b.includes(' at ')) ? 1 : 0;
                if (aHasBy !== bHasBy) return bHasBy - aHasBy;
                return b.length - a.length;
              })[0];
          }
        }
        
        // 提取地点名称：在Date:之前，通常是Date:前1行
        if (dateLineIdx > 0) {
          // Date:之前的行，特别是紧挨着Date:的那一行
          const venueCandidates = blockLines.slice(0, dateLineIdx)
            .slice(-3) // 只检查Date:前3行
            .filter(l => 
              l.length > 3 && 
              l.length < 100 &&
              !l.includes('Date:') && 
              !l.includes('Address:') && 
              !l.includes('Price:') &&
              l !== event.name // 排除活动名称
            );
          
          if (venueCandidates.length > 0) {
            // 优先选择包含地点关键词的行，否则选择最后一行（通常是紧挨着Date:的）
            event.venueName = venueCandidates
              .sort((a, b) => {
                const aHasVenue = /\b(Theatre|Theater|Hall|Base|Gallery|Museum|Space|Club|Venue|Academy|School|Pizza Bar|Residence|Cultural|Palace|Concert Hall)\b/i.test(a) ? 1 : 0;
                const bHasVenue = /\b(Theatre|Theater|Hall|Base|Gallery|Museum|Space|Club|Venue|Academy|School|Pizza Bar|Residence|Cultural|Palace|Concert Hall)\b/i.test(b) ? 1 : 0;
                if (aHasVenue !== bHasVenue) return bHasVenue - aHasVenue;
                // 如果都包含或都不包含，选择索引较大的（更接近Date:的）
                const aIdx = venueCandidates.indexOf(a);
                const bIdx = venueCandidates.indexOf(b);
                return bIdx - aIdx;
              })[0];
          }
        }
        
        // 只有当找到关键信息时才添加，并确保不重复
        if (event.name && event.venueAddress) {
          const eventKey = `${event.name}|${event.venueAddress}`;
          if (!processedEvents.has(eventKey)) {
            processedEvents.add(eventKey);
            eventsList.push(event);
          }
        }
      });
      
      return eventsList;
    });
    
    // 输出结果
    console.log('=== 提取到的活动信息 ===\n');
    events.forEach((event, index) => {
      console.log(`活动 ${index + 1}:`);
      console.log(`  活动名称: ${event.name || '(未找到)'}`);
      console.log(`  举办地点: ${event.venueName || '(未找到)'}`);
      console.log(`  地点详细地址: ${event.venueAddress || '(未找到)'}`);
      console.log(`  营业时间: ${event.openingHours || '(未找到)'}`);
      console.log(`  价格: ${event.price || '(未找到)'}`);
      console.log(`  活动详情: ${event.description || '(未找到)'}`);
      console.log('');
    });
    
    if (events.length < 3) {
      console.log(`⚠️  只找到 ${events.length} 个活动，少于预期的3个`);
    }
    
    return events;
    
  } catch (error) {
    console.error('分析失败:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const url = 'https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q';

analyzeWeChatArticle(url)
  .then((events) => {
    console.log('\n✅ 分析完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
