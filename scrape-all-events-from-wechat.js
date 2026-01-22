/**
 * 从微信公众号文章提取所有活动并保存到数据库
 */

const puppeteer = require('puppeteer');
const Event = require('./server/models/Event');
const { sequelize, testConnection } = require('./server/config/database');

// 解析日期时间
function parseDateTime(dateTimeStr) {
  if (!dateTimeStr) return { startDate: null, endDate: null, startTime: null, endTime: null };
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  let startDate = null;
  let endDate = null;
  let startTime = null;
  let endTime = null;
  
  // 解析类似 "Friday & Saturday, 7:30pm" 的格式
  const dayTimeMatch = dateTimeStr.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:\s*&\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))?[,\s]+(\d{1,2}:\d{2}(?:am|pm)?)/i);
  if (dayTimeMatch) {
    const day1 = dayTimeMatch[1];
    const day2 = dayTimeMatch[2];
    const timeStr = dayTimeMatch[3];
    
    // 获取下一个匹配的星期几
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = day2 || day1;
    const dayIndex = days.indexOf(targetDay.toLowerCase());
    
    // 计算下一个目标日期
    const currentDay = today.getDay();
    let daysUntilTarget = (dayIndex - currentDay + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7; // 如果今天就是目标日期，取下周
    
    const targetDate = new Date(year, month, today.getDate() + daysUntilTarget);
    
    if (day1) {
      const day1Index = days.indexOf(day1.toLowerCase());
      let daysUntilDay1 = (day1Index - currentDay + 7) % 7;
      if (daysUntilDay1 === 0) daysUntilDay1 = 7;
      startDate = new Date(year, month, today.getDate() + daysUntilDay1);
    }
    
    if (day2) {
      endDate = targetDate;
    } else {
      endDate = startDate;
    }
    
    // 解析时间
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const ampm = timeMatch[3]?.toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      startTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }
  
  return { startDate, endDate, startTime, endTime };
}

// 解析价格
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  // 解析类似 "180-880rmb" 或 "198rmb" 的格式
  const rangeMatch = priceStr.match(/(\d+)[-–](\d+)\s*rmb/i);
  if (rangeMatch) {
    return {
      amount: parseInt(rangeMatch[1]),
      currency: 'CNY',
      note: `¥${rangeMatch[1]}-${rangeMatch[2]}`
    };
  }
  
  const singleMatch = priceStr.match(/(\d+)\s*rmb/i);
  if (singleMatch) {
    return {
      amount: parseInt(singleMatch[1]),
      currency: 'CNY',
      note: `¥${singleMatch[1]}`
    };
  }
  
  // 如果无法解析，返回原始字符串作为note
  return {
    note: priceStr
  };
}

// 推断活动类别
function inferCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('ballet') || text.includes('dance') || text.includes('concert') || text.includes('piano') || text.includes('music') || text.includes('tour')) {
    return 'music';
  }
  if (text.includes('exhibition') || text.includes('gallery') || text.includes('art')) {
    return 'art';
  }
  if (text.includes('festival') || text.includes('celebration')) {
    return 'festival';
  }
  if (text.includes('workshop') || text.includes('class') || text.includes('lesson')) {
    return 'workshop';
  }
  if (text.includes('sport') || text.includes('tennis') || text.includes('wrestling') || text.includes('fight')) {
    return 'sports';
  }
  if (text.includes('food') || text.includes('wine') || text.includes('tasting') || text.includes('dining')) {
    return 'food';
  }
  
  return 'other';
}

async function scrapeAllEvents(url) {
  let browser;
  
  try {
    console.log(`开始分析文章: ${url}\n`);
    
    // 测试数据库连接
    const connected = await testConnection();
    if (!connected) {
      throw new Error('无法连接到数据库');
    }
    
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
      for (let i = 0; i < 25; i++) {
        window.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 300));
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('开始提取所有活动信息...\n');
    
    // 提取所有活动信息
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
      
      console.log(`找到 ${dateIndices.length} 个Date标记`);
      
      // 处理所有找到的活动
      const processedEvents = new Set(); // 用于去重
      
      dateIndices.forEach((dateIdx, eventNum) => {
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
              !/^\[SH Weekender\]/.test(l) &&
              !l.toLowerCase().includes('smartshanghai 2026') &&
              !/^\d{4}年/.test(l)
            );
          
          if (nameCandidates.length > 0) {
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
          const venueCandidates = blockLines.slice(0, dateLineIdx)
            .slice(-3)
            .filter(l => 
              l.length > 3 && 
              l.length < 100 &&
              !l.includes('Date:') && 
              !l.includes('Address:') && 
              !l.includes('Price:') &&
              l !== event.name
            );
          
          if (venueCandidates.length > 0) {
            event.venueName = venueCandidates
              .sort((a, b) => {
                const aHasVenue = /\b(Theatre|Theater|Hall|Base|Gallery|Museum|Space|Club|Venue|Academy|School|Pizza Bar|Residence|Cultural|Palace|Concert Hall)\b/i.test(a) ? 1 : 0;
                const bHasVenue = /\b(Theatre|Theater|Hall|Base|Gallery|Museum|Space|Club|Venue|Academy|School|Pizza Bar|Residence|Cultural|Palace|Concert Hall)\b/i.test(b) ? 1 : 0;
                if (aHasVenue !== bHasVenue) return bHasVenue - aHasVenue;
                const aIdx = venueCandidates.indexOf(a);
                const bIdx = venueCandidates.indexOf(b);
                return bIdx - aIdx;
              })[0];
          }
        }
        
        // 提取活动详情
        if (priceLineIdx >= 0) {
          const descriptionEndIdx = blockLines.findIndex((l, idx) => 
            idx > priceLineIdx && 
            (/Date:\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Various)/i.test(l) ||
             (idx > priceLineIdx + 1 && 
              l.length > 15 && l.length < 100 &&
              (l.includes(' by ') || l.includes(' at ') || /^[A-Z][^.]{15,80}$/.test(l))))
          );
          
          const descriptionEnd = descriptionEndIdx > priceLineIdx ? descriptionEndIdx : blockLines.length;
          const descriptionLines = blockLines.slice(priceLineIdx + 1, descriptionEnd)
            .filter(l => 
              l.length > 30 &&
              !l.includes('Date:') && 
              !l.includes('Address:') && 
              !l.includes('Price:') &&
              !l.includes('All Details') &&
              !/^\[SH/.test(l) &&
              !l.toLowerCase().includes('smartshanghai') &&
              !(l.length < 100 && /^[A-Z][^.]{0,80}$/.test(l) && !l.includes(','))
            );
          
          if (descriptionLines.length > 0) {
            const firstLongLine = descriptionLines.find(l => l.length > 100);
            if (firstLongLine) {
              event.description = firstLongLine.trim().substring(0, 500);
            } else {
              event.description = descriptionLines.slice(0, 3).join(' ').trim().substring(0, 500);
            }
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
    
    console.log(`提取到 ${events.length} 个活动\n`);
    
    // 保存到数据库
    let savedCount = 0;
    let skippedCount = 0;
    
    for (const eventData of events) {
      try {
        // 检查是否已存在相同的活动（根据标题和地址）
        const existing = await Event.findOne({
          where: {
            title: eventData.name,
            venueAddress: eventData.venueAddress
          }
        });
        
        if (existing) {
          console.log(`⏭️  跳过已存在的活动: ${eventData.name}`);
          skippedCount++;
          continue;
        }
        
        // 解析日期时间
        const { startDate, endDate, startTime, endTime } = parseDateTime(eventData.openingHours);
        
        // 解析价格
        const priceData = parsePrice(eventData.price);
        
        // 推断类别
        const category = inferCategory(eventData.name, eventData.description);
        
        // 准备数据库记录
        const eventRecord = {
          title: eventData.name.substring(0, 255),
          description: eventData.description || eventData.name,
          category: category,
          venueName: eventData.venueName || null,
          venueAddress: eventData.venueAddress || null,
          city: '上海',
          startDate: startDate,
          endDate: endDate,
          startTime: startTime,
          endTime: endTime,
          price: priceData,
          source: {
            url: url,
            scrapedAt: new Date().toISOString(),
            source: 'wechat'
          },
          featured: false
        };
        
        // 如果openingHours是"Various Dates"或其他格式，保存为note
        if (eventData.openingHours && eventData.openingHours.toLowerCase().includes('various')) {
          eventRecord.notes = `Time: ${eventData.openingHours}`;
        }
        
        // 创建记录
        await Event.create(eventRecord);
        savedCount++;
        console.log(`✅ 已保存: ${eventData.name}`);
        
      } catch (error) {
        console.error(`❌ 保存失败 (${eventData.name}):`, error.message);
      }
    }
    
    console.log(`\n完成！共处理 ${events.length} 个活动，保存 ${savedCount} 个，跳过 ${skippedCount} 个`);
    
    return { total: events.length, saved: savedCount, skipped: skippedCount };
    
  } catch (error) {
    console.error('抓取失败:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
    await sequelize.close();
  }
}

// 运行脚本
const url = 'https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q';

scrapeAllEvents(url)
  .then((result) => {
    console.log('\n✅ 抓取完成！');
    console.log(`总计: ${result.total} 个活动`);
    console.log(`保存: ${result.saved} 个`);
    console.log(`跳过: ${result.skipped} 个`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
