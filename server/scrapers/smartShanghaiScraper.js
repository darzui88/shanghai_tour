const puppeteer = require('puppeteer');
const Event = require('../models/Event');
const { Op } = require('sequelize');

class SmartShanghaiScraper {
  constructor() {
    this.baseUrl = 'https://www.smartshanghai.com';
    this.eventsUrl = 'https://www.smartshanghai.com/events';
  }

  // 抓取特定公众号文章
  async scrapeWeChatArticle(articleUrl) {
    let browser;
    try {
      console.log('🚀 开始抓取公众号文章:', articleUrl);
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
        // 即使超时也继续，可能页面已经部分加载
      }
      
      // 等待内容加载（增加等待时间）
      console.log('⏳ 等待页面内容加载...');
      await page.waitForTimeout(8000);
      
      // 尝试等待关键元素
      try {
        await page.waitForSelector('#js_content, .rich_media_content, article', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️ 未找到标准内容选择器，继续尝试...');
      }

      // 提取文章中的所有活动
      const events = await this.extractEventsFromWeChatArticle(page, articleUrl);
      
      console.log(`✅ 从文章中提取到 ${events.length} 个活动`);

      // 计算未来1个月的日期范围
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const oneMonthLaterISO = oneMonthLater.toISOString();

      // 处理和保存活动
      let newEvents = 0;
      let updatedEvents = 0;

      for (const eventData of events) {
        try {
          const processedEvent = this.processEventData(eventData);
          
          // 只保存未来1个月内的活动
          if (new Date(processedEvent.startDate) > oneMonthLater) {
            console.log(`⏭️  跳过超出1个月范围的活动: ${processedEvent.title}`);
            continue;
          }

          // 检查是否已存在（通过标题匹配，因为日期可能相同）
          // 使用模糊匹配，因为同一活动可能有细微差异
          const normalizedTitle = processedEvent.title.trim().toLowerCase().replace(/\s+/g, ' ');
          const existingEvent = await Event.findOne({
            where: {
              [Op.or]: [
                { title: processedEvent.title },
                // 也检查标题是否包含当前标题的主要部分
                { title: { [Op.like]: `%${processedEvent.title.substring(0, Math.min(30, processedEvent.title.length))}%` } }
              ]
            }
          });

          if (existingEvent) {
            // 如果新活动的信息更完整（有描述而旧活动没有），则更新
            const existingDescription = existingEvent.description || '';
            const newDescription = processedEvent.description || '';
            if (newDescription && !existingDescription) {
              await existingEvent.update(processedEvent);
              updatedEvents++;
              console.log(`🔄 更新活动（补充信息）: ${processedEvent.title}`);
            } else if (newDescription && existingDescription) {
              // 都有描述，但新活动的其他字段可能更完整，也更新
              await existingEvent.update(processedEvent);
              updatedEvents++;
              console.log(`🔄 更新活动: ${processedEvent.title}`);
            } else {
              // 新活动没有描述或描述更短，不更新
              console.log(`⏭️  跳过已有活动（信息不完整）: ${processedEvent.title}`);
            }
          } else {
            await Event.create(processedEvent);
            newEvents++;
            console.log(`✅ 新增活动: ${processedEvent.title}`);
          }
        } catch (error) {
          console.error(`❌ 处理活动失败 "${eventData.title || 'Unknown'}":`, error.message);
        }
      }

      console.log(`\n✅ 抓取完成!`);
      console.log(`   📝 新增活动: ${newEvents} 个`);
      console.log(`   🔄 更新活动: ${updatedEvents} 个`);

      return {
        newEvents,
        updatedEvents,
        total: events.length
      };
    } catch (error) {
      console.error('❌ 抓取错误:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async extractEventsFromWeChatArticle(page, articleUrl) {
    try {
      const events = await page.evaluate((url) => {
        const extractedEvents = [];
        
        // 获取文章主体内容
        const articleContent = document.querySelector('#js_content, .rich_media_content, article, .article-content') 
          || document.body;
        
        if (!articleContent) {
          return [];
        }

        // 获取HTML和文本内容
        const html = articleContent.innerHTML || '';
        const text = articleContent.innerText || articleContent.textContent || '';
        
        // 按段落分割内容
        const paragraphs = articleContent.querySelectorAll('p, section, div[style*="margin"]');
        
        // 活动信息结构：通常是标题 + 日期 + 地点 + 价格 + 描述
        // 尝试通过HTML结构识别活动块
        let currentEvent = null;
        let eventBlocks = [];
        
        // 改进的提取逻辑：按照 标题 -> 地点 -> Date -> Address -> Price -> 描述 的结构
        paragraphs.forEach((p) => {
          const pText = p.textContent.trim();
          if (!pText || pText.length < 3) return;
          
          // 跳过明显的非活动内容
          if (pText.includes('点击') && pText.includes('阅读') ||
              pText.includes('来源') || pText.includes('图片来源') ||
              pText.includes('©') || pText.includes('Copyright') ||
              pText.match(/^[0-9]+$/) ||
              pText === 'All Details' ||
              pText.match(/^[|｜]/)) {
            return;
          }
          
          // 检测是否是信息行（Date, Address, Price等）
          const isDateLine = /^Date:|^日期|^时间|^Time:/i.test(pText);
          const isAddressLine = /^Address:|^地址/i.test(pText);
          const isPriceLine = /^Price:|^价格|^票价|^Ticket:/i.test(pText);
          const isInfoLine = isDateLine || isAddressLine || isPriceLine;
          
          if (isInfoLine && currentEvent) {
            // 处理信息行
            if (isDateLine) {
              // Date: 后面的时间文本原样保存
              currentEvent.dateText = pText.replace(/Date:|日期|时间|Time:/gi, '').trim();
            } else if (isAddressLine) {
              // Address: 后面的地址文本原样保存，去掉 "| All Details" 部分
              currentEvent.address = pText.replace(/Address:|地址/gi, '').replace(/\s*\|\s*All Details.*/gi, '').trim();
            } else if (isPriceLine) {
              // Price: 后面的价格文本原样保存
              currentEvent.price = pText.replace(/Price:|价格|票价|Ticket:/gi, '').trim();
            }
            return;
          }
          
          // 检测活动标题（通常是加粗或独立段落，长度适中，不包含冒号）
          const isBold = p.querySelector('strong, b, span[style*="bold"], span[style*="font-weight"]');
          const isLikelyTitle = pText.length >= 10 && 
                               pText.length <= 200 && 
                               !isInfoLine &&
                               !pText.match(/^\d+[\.\、]/) &&
                               !pText.match(/^[¥$￥]\s*\d+/) &&
                               !pText.includes('http://') &&
                               !pText.includes('https://') &&
                               !pText.match(/^All Details/i) &&
                               !pText.match(/^[|｜]/) &&
                               !pText.includes(':') && // 标题通常不包含冒号（除了特殊格式）
                               !pText.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+(US|UK|INS|CHN)/); // 跳过可能是地点名称的行
          
          if (isBold || isLikelyTitle) {
            // 保存上一个活动
            if (currentEvent && currentEvent.title && currentEvent.title.length > 5) {
              eventBlocks.push(currentEvent);
            }
            
            // 检查标题后是否直接跟着地点名称
            // 规则：smartshanghai公众号中，活动标题和地点名称之间有换行
            let title = pText;
            let venue = '';
            
            // 情况1: 标题和地点名称在同一段落中（可能连在一起或换行分隔）
            // 首先尝试用换行符分离
            const titleParts = pText.split(/\r?\n|\r/).map(s => s.trim()).filter(s => s.length > 0);
            if (titleParts.length >= 2) {
              // 第一行是标题
              title = titleParts[0];
              // 第二行可能是地点名称
              const potentialVenue = titleParts[1];
              if (potentialVenue.length >= 2 && 
                  potentialVenue.length < 80 && 
                  !potentialVenue.includes(',') && 
                  !potentialVenue.includes('|') && 
                  !potentialVenue.includes(':') &&
                  !potentialVenue.match(/^(Date|Address|Price)/i) &&
                  !potentialVenue.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                venue = potentialVenue;
              }
            } else {
              // 没有换行，检查HTML结构（标题和地点可能在同一个段落的不同元素中）
              // 检查段落内的所有直接子元素或同级的section/span元素
              const sections = Array.from(p.children).length > 0 
                ? Array.from(p.children) 
                : (p.parentElement ? Array.from(p.parentElement.children) : []);
              
              // 尝试从同一段落或父元素中找到标题后的下一个元素
              if (sections.length >= 2) {
                // 找到当前段落对应的索引
                let currentIndex = -1;
                for (let i = 0; i < sections.length; i++) {
                  if (sections[i] === p || sections[i].contains(p) || p.contains(sections[i])) {
                    currentIndex = i;
                    break;
                  }
                }
                
                // 如果找到当前段落，检查下一个元素
                if (currentIndex >= 0 && currentIndex + 1 < sections.length) {
                  const nextElement = sections[currentIndex + 1];
                  const nextText = nextElement.textContent.trim();
                  
                  // 检查下一个元素是否符合地点名称特征
                  if (nextText && nextText.length >= 2 && nextText.length < 80 &&
                      !nextText.includes(',') && !nextText.includes('|') && !nextText.includes(':') &&
                      !nextText.match(/^(Date|Address|Price)/i) &&
                      !nextText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/) &&
                      nextText.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*(Theater|Hall|Space|Club|Bar|School|Academy|Base|House|Palace|Residence)?$/)) {
                    venue = nextText;
                  }
                }
              }
              
              // 如果还是没有找到，检查段落内的子元素（children）
              // 规则：第一个子元素是标题，后续子元素中灰色文字的就是地点名称
              if (!venue) {
                const children = Array.from(p.children || []);
                
                // 第一个子元素是标题
                if (children.length > 0) {
                  const firstChild = children[0];
                  title = firstChild.textContent.trim() || title;
                  
                  // 查找后续子元素中的灰色文字（地点名称）
                  for (let i = 1; i < children.length; i++) {
                    const child = children[i];
                    const childText = child.textContent.trim();
                    
                    // 跳过空的子元素（如<br>）
                    if (!childText || childText.length < 2) continue;
                    
                    // 检查是否是地点名称
                    // 规则1：查找带有 leaf="" 属性的span（如 <span leaf="">Wanping Theater</span>）
                    // 先检查child本身是否有leaf属性
                    if (child.getAttribute && child.getAttribute('leaf') === '') {
                      if (childText.length >= 2 && childText.length < 80 &&
                          !childText.includes(',') && !childText.includes('|') && !childText.includes(':') &&
                          !childText.match(/^(Date|Address|Price)/i) &&
                          !childText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                        venue = childText;
                        break;
                      }
                    }
                    
                    // 规则1b：查找child内部的leaf span
                    const leafSpan = child.querySelector('span[leaf=""]');
                    if (leafSpan) {
                      const leafText = leafSpan.textContent.trim();
                      if (leafText && leafText.length >= 2 && leafText.length < 80 &&
                          !leafText.includes(',') && !leafText.includes('|') && !leafText.includes(':') &&
                          !leafText.match(/^(Date|Address|Price)/i) &&
                          !leafText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                        venue = leafText;
                        break;
                      }
                    }
                    
                    // 规则2：检查是否符合地点名称特征
                    if (childText.length >= 2 && childText.length < 80 &&
                        !childText.includes(',') && !childText.includes('|') && !childText.includes(':') &&
                        !childText.match(/^(Date|Address|Price)/i) &&
                        !childText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                      // 看起来像地点名称，就认为是地点名称
                      const looksLikeVenue = childText.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*(Theater|Hall|Space|Club|Bar|School|Academy|Base|House|Palace|Residence|Centre|Center|Theatre)?$/);
                      if (looksLikeVenue) {
                        venue = childText;
                        break;
                      }
                    }
                  }
                }
              }
              
              // 如果还是没有分离，检查是否是"TitleVenue"这种格式
              if (!venue && title.length > 80) {
                // 检查末尾是否有地点关键词
                const venueKeywords = ['Theater', 'Hall', 'Space', 'Club', 'Bar', 'School', 'Academy', 'Base', 'House', 'Palace', 'Residence', 'Centre', 'Center', 'Theatre'];
                for (const keyword of venueKeywords) {
                  const keywordIndex = title.lastIndexOf(keyword);
                  if (keywordIndex > title.length - 30 && keywordIndex > title.length / 2) {
                    // 从关键词往前查找大写字母开头的词
                    const beforeKeyword = title.substring(0, keywordIndex);
                    const venueStartMatch = beforeKeyword.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)$/);
                    if (venueStartMatch && venueStartMatch[1].length < 30) {
                      venue = venueStartMatch[1] + ' ' + keyword;
                      title = title.substring(0, title.length - venue.length).trim();
                      break;
                    }
                  }
                }
              }
              
              // 新规则：在标题和图片之间的文字就是地点名称
              if (!venue) {
                // 方法1：检查标题段落后面的兄弟元素
                let nextElement = p.nextElementSibling;
                let checkedCount = 0;
                const maxCheck = 5; // 最多检查5个后续元素
                
                while (nextElement && checkedCount < maxCheck) {
                  checkedCount++;
                  
                  // 检查是否是图片
                  const isImage = nextElement.tagName === 'IMG' || 
                                 nextElement.querySelector('img') ||
                                 nextElement.querySelector('image') ||
                                 nextElement.innerHTML.match(/<img|<image/i);
                  
                  if (isImage) {
                    // 找到了图片，但标题和图片之间没有文本元素，继续
                    break;
                  }
                  
                  // 检查是否有文本内容且符合地点名称特征
                  const text = nextElement.textContent.trim();
                  if (text && text.length >= 2 && text.length < 80 &&
                      !text.includes(',') && !text.includes('|') && !text.includes(':') &&
                      !text.match(/^(Date|Address|Price)/i) &&
                      !text.match(/\d+\s+(路|Lu|Road|Street|Avenue)/) &&
                      !text.match(/http|https|www\./i)) {
                    // 检查后面是否有图片
                    let hasImageAfter = false;
                    let tempElement = nextElement.nextElementSibling;
                    let tempCount = 0;
                    while (tempElement && tempCount < 3) {
                      tempCount++;
                      if (tempElement.tagName === 'IMG' || 
                          tempElement.querySelector('img') ||
                          tempElement.querySelector('image') ||
                          tempElement.innerHTML.match(/<img|<image/i)) {
                        hasImageAfter = true;
                        break;
                      }
                      tempElement = tempElement.nextElementSibling;
                    }
                    
                    // 如果后面有图片，且这个文本符合地点名称特征，就认为是地点名称
                    if (hasImageAfter) {
                      venue = text;
                      break;
                    }
                  }
                  
                  nextElement = nextElement.nextElementSibling;
                }
                
                // 方法2：检查同一段落内的子元素，如果最后一个子元素是图片，前面的文本可能是地点名称
                if (!venue) {
                  const children = Array.from(p.children || []);
                  if (children.length >= 2) {
                    // 检查最后一个子元素是否是图片
                    const lastChild = children[children.length - 1];
                    const isLastImage = lastChild.tagName === 'IMG' || 
                                       lastChild.querySelector('img') ||
                                       lastChild.innerHTML.match(/<img|<image/i);
                    
                    if (isLastImage) {
                      // 从后往前查找文本元素（跳过最后一个图片）
                      for (let i = children.length - 2; i >= 1; i--) {
                        const child = children[i];
                        const childText = child.textContent.trim();
                        if (childText && childText.length >= 2 && childText.length < 80 &&
                            !childText.includes(',') && !childText.includes('|') && !childText.includes(':') &&
                            !childText.match(/^(Date|Address|Price)/i) &&
                            !childText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                          venue = childText;
                          break;
                        }
                      }
                    }
                  }
                }
              }
            } 
            // 情况2: 标题和地点名称连在一起（如 "TitleVenue" 或 "TitleWanping Theater"）
            // 检查标题末尾是否有常见的地点关键词（Theater, Hall, Space等）
            const venueKeywords = ['Theater', 'Hall', 'Space', 'Club', 'Bar', 'Restaurant', 'School', 'Academy', 'Base', 'House', 'Palace', 'Residence', 'Centre', 'Center', 'Theatre'];
            for (const keyword of venueKeywords) {
              const keywordIndex = title.lastIndexOf(keyword);
              if (keywordIndex > title.length - 30 && keywordIndex > title.length / 2) {
                // 找到了地点关键词，提取从该位置往前到最后一个大写字母开始的部分
                // 例如：从 "ChinaWanping Theater" 提取 "Wanping Theater"
                const beforeKeyword = title.substring(0, keywordIndex);
                // 查找地点名称的开始（大写字母+小写字母）
                const venueStartMatch = beforeKeyword.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)$/);
                if (venueStartMatch) {
                  venue = venueStartMatch[1] + ' ' + keyword;
                  title = title.substring(0, title.length - venue.length).trim();
                  break;
                } else {
                  // 如果没有找到明确的分界，尝试从关键词往前20个字符作为地点名称
                  const startIdx = Math.max(0, keywordIndex - 20);
                  venue = title.substring(startIdx).trim();
                  title = title.substring(0, startIdx).trim();
                  break;
                }
              }
            }
            
            // 如果还没有找到，尝试查找标题末尾的大写字母开头的词（可能是地点）
            if (!venue && title.length > 80) {
              // 查找末尾的模式：小写字母+大写字母（如 "ChinaWanping"）或直接是大写字母开头的词
              const venueMatch = title.match(/([a-z]+([A-Z][a-z]+(?: [A-Z][a-z]+)*(?: Theater|Hall|Space|Club|Bar|School|Academy)?))$/);
              if (venueMatch && venueMatch[2]) {
                venue = venueMatch[2]; // 提取大写字母开始的部分（地点名称）
                title = title.substring(0, title.length - venue.length).trim();
              }
            }
            
            // 情况3: 地点名称在下一个段落中
            if (!venue) {
              const nextSibling = p.nextElementSibling;
              if (nextSibling) {
                const nextText = nextSibling.textContent.trim();
                // 如果下一个元素是简短文本，可能是地点名称
                if (nextText.length > 2 && nextText.length < 80 && 
                    !nextText.includes(',') && !nextText.includes('|') && !nextText.includes(':') &&
                    !nextText.match(/^(Date|Address|Price)/i) &&
                    !nextText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                  venue = nextText;
                }
              }
            }
            
            // 开始新活动
            currentEvent = {
              title: title,
              dateText: '',
              venueName: venue,
              address: '',
              price: '',
              description: '',
              images: [],
              ticketUrl: '',
              notes: ''
            };
            
            // 立即检查下一个段落是否是地点名称
            // 规则：标题下一行如果是简短文本且符合地点名称特征，就是地点名称
            if (!venue) {
              const nextSibling = p.nextElementSibling;
              if (nextSibling) {
                const nextText = nextSibling.textContent.trim();
                // 如果下一个段落符合地点名称特征，则识别为地点名称
                if (nextText.length >= 2 && nextText.length < 80 &&
                    !nextText.includes(',') && !nextText.includes('|') && !nextText.includes(':') &&
                    !nextText.match(/^(Date|Address|Price)/i) &&
                    !nextText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                  // 看起来像地点名称（首字母大写的词），就认为是地点名称
                  if (nextText.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*(Theater|Hall|Space|Club|Bar|School|Academy|Base|House|Palace|Residence|Centre|Center|Theatre)?$/)) {
                    venue = nextText;
                  }
                }
              }
            }
            
            // 新规则：在标题和图片之间的文字就是地点名称
            // 如果还没有找到地点名称，检查标题和图片之间的文本
            if (!venue) {
              // 检查标题段落后的元素，查找第一个图片，并提取图片前的文本作为地点名称
              let checkElement = p.nextElementSibling;
              let checkedCount = 0;
              const maxCheck = 10; // 最多检查10个后续元素
              
              while (checkElement && checkedCount < maxCheck) {
                checkedCount++;
                
                // 检查是否是图片
                const isImage = checkElement.tagName === 'IMG' || 
                               checkElement.querySelector('img') ||
                               checkElement.querySelector('image') ||
                               checkElement.innerHTML.match(/<img|<image/i);
                
                // 如果有文本内容，检查是否符合地点名称特征
                const text = checkElement.textContent.trim();
                const hasText = text && text.length >= 2 && text.length < 80 &&
                               !text.includes(',') && !text.includes('|') && !text.includes(':') &&
                               !text.match(/^(Date|Address|Price)/i) &&
                               !text.match(/\d+\s+(路|Lu|Road|Street|Avenue)/) &&
                               !text.match(/http|https|www\./i);
                
                // 如果找到了图片，且之前遇到过文本元素，那之前的文本就是地点名称
                if (isImage && hasText) {
                  // 这个元素既是图片又有文本，不太可能，跳过
                  checkElement = checkElement.nextElementSibling;
                  continue;
                }
                
                if (isImage) {
                  // 找到了图片，如果之前有文本元素，那文本就是地点名称
                  // 实际上，我们应该在遇到图片时，回看上一个文本元素
                  break;
                }
                
                if (hasText) {
                  // 检查这个文本元素后面是否有图片
                  let tempElement = checkElement.nextElementSibling;
                  let tempCount = 0;
                  while (tempElement && tempCount < 3) {
                    tempCount++;
                    const tempIsImage = tempElement.tagName === 'IMG' || 
                                       tempElement.querySelector('img') ||
                                       tempElement.querySelector('image') ||
                                       tempElement.innerHTML.match(/<img|<image/i);
                    if (tempIsImage) {
                      // 这个文本后面有图片，符合"标题和图片之间的文字就是地点名称"的规则
                      venue = text;
                      break;
                    }
                    tempElement = tempElement.nextElementSibling;
                  }
                  if (venue) break;
                }
                
                checkElement = checkElement.nextElementSibling;
              }
              
              // 如果还没有找到，检查标题段落内的子元素
              // 如果段落内有图片，图片前的文本可能是地点名称
              if (!venue) {
                const children = Array.from(p.children || []);
                for (let i = 0; i < children.length; i++) {
                  const child = children[i];
                  const childText = child.textContent.trim();
                  
                  // 检查这个子元素后面是否有图片（在后续子元素中）
                  let hasImageAfter = false;
                  for (let j = i + 1; j < children.length; j++) {
                    const nextChild = children[j];
                    const isImage = nextChild.tagName === 'IMG' || 
                                   nextChild.querySelector('img') ||
                                   nextChild.innerHTML.match(/<img|<image/i);
                    if (isImage) {
                      hasImageAfter = true;
                      break;
                    }
                  }
                  
                  // 如果这个子元素后面有图片，且文本符合地点名称特征
                  if (hasImageAfter && childText && childText.length >= 2 && childText.length < 80 &&
                      !childText.includes(',') && !childText.includes('|') && !childText.includes(':') &&
                      !childText.match(/^(Date|Address|Price)/i) &&
                      !childText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/)) {
                    venue = childText;
                    break;
                  }
                }
              }
            }
            
            // 如果找到了地点名称，更新currentEvent
            if (venue) {
              currentEvent.venueName = venue;
            }
          } else if (currentEvent) {
            // 收集当前活动的信息
            // 检查是否是地点名称（在标题后，Date前，通常是简短文本）
            // 规则：标题后的第一个非信息行段落，如果符合地点名称特征，就是地点名称
            if (!currentEvent.dateText && !currentEvent.venueName) {
              // 符合地点名称的特征
              const looksLikeVenue = pText.length > 2 && 
                                    pText.length < 80 &&
                                    !pText.includes(',') && 
                                    !pText.includes('|') && 
                                    !pText.includes(':') &&
                                    !pText.match(/^(Date|Address|Price)/i) &&
                                    !pText.match(/\d+\s+(路|Lu|Road|Street|Avenue)/) &&
                                    !pText.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+(US|UK|INS|CHN)/);
              
              // 如果符合地点名称特征，则识别为地点名称
              if (looksLikeVenue) {
                currentEvent.venueName = pText;
              }
            } else if (pText.match(/http|https|www\./i)) {
              // 可能是购票链接
              const linkMatch = pText.match(/(https?:\/\/[^\s]+)/);
              if (linkMatch) {
                currentEvent.ticketUrl = linkMatch[1];
              }
            } else if (!isInfoLine && pText.length > 50) {
              // 规则：Price下面的那段话就是活动描述
              // 只有在已经有Price之后的长文本才是描述
              if (currentEvent.price) {
                // Price之后的长文本是描述
                currentEvent.description += (currentEvent.description ? ' ' : '') + pText;
              }
            }
          }
        });
        
        // 添加最后一个活动
        if (currentEvent && currentEvent.title && currentEvent.title.length > 5) {
          eventBlocks.push(currentEvent);
        }
        
        // 去重：如果有相同标题的活动，保留信息更完整的那个（合并信息）
        // 策略：优先保留有描述的活动（因为描述在Price之后，说明信息收集完整）
        const uniqueEvents = [];
        const titleMap = new Map();
        
        eventBlocks.forEach(event => {
          // 标准化标题用于匹配（去除前后空格，转小写）
          const normalizedTitle = event.title.trim().toLowerCase().replace(/\s+/g, ' ');
          const existing = titleMap.get(normalizedTitle);
          
          if (existing) {
            // 如果新活动有描述，而旧活动没有，优先使用新活动
            if (event.description && !existing.description) {
              // 用新活动替换旧活动
              const index = uniqueEvents.indexOf(existing);
              if (index > -1) {
                uniqueEvents[index] = event;
                titleMap.set(normalizedTitle, event);
              }
            } 
            // 如果都有描述，比较其他字段的完整性
            else if (event.description && existing.description) {
              // 两个都有描述，合并所有字段，保留更完整的信息
              Object.keys(event).forEach(key => {
                if (event[key]) {
                  // 如果新活动的字段更完整（长度更长或旧活动没有），则更新
                  if (!existing[key] || (typeof event[key] === 'string' && event[key].length > existing[key].length)) {
                    existing[key] = event[key];
                  }
                }
              });
            }
            // 如果新活动没有描述，但其他字段更完整，也合并
            else if (!event.description && !existing.description) {
              // 合并信息：保留更完整的字段
              Object.keys(event).forEach(key => {
                if (event[key] && (!existing[key] || 
                    (typeof event[key] === 'string' && typeof existing[key] === 'string' && 
                     event[key].length > existing[key].length))) {
                  existing[key] = event[key];
                }
              });
            }
          } else {
            // 新活动，添加到Map和数组
            titleMap.set(normalizedTitle, event);
            uniqueEvents.push(event);
          }
        });
        
        // 使用去重后的活动列表
        eventBlocks = uniqueEvents;
        
        // 提取图片
        const images = Array.from(articleContent.querySelectorAll('img')).map(img => img.src).filter(src => src && !src.includes('data:image'));
        
        // 为每个活动分配图片
        eventBlocks.forEach((event, index) => {
          if (images.length > 0) {
            // 尝试将图片分配给活动（简单分配）
            const imagesPerEvent = Math.ceil(images.length / Math.max(eventBlocks.length, 1));
            const startIdx = Math.min(index * imagesPerEvent, images.length - 1);
            const endIdx = Math.min(startIdx + 5, images.length); // 最多5张
            event.images = images.slice(startIdx, endIdx);
            if (event.images.length > 0) {
              event.listImage = event.images[0]; // 第一张作为列表图
            }
          }
        });
        
        // 如果没找到结构化的活动，尝试提取整个页面作为单个活动
        if (eventBlocks.length === 0) {
          const pageTitle = document.querySelector('h1, h2, .rich_media_title')?.innerText?.trim() || 
                           document.querySelector('title')?.innerText?.trim() || 
                           'Event';
          const firstDate = text.match(/(\d{1,2}[月\/\-]\d{1,2}[日]?|\d{4}[年\-]\d{1,2}[月\-]\d{1,2})/);
          
          if (pageTitle && pageTitle !== '微信' && pageTitle !== 'WeChat') {
            eventBlocks.push({
              title: pageTitle,
              dateText: firstDate ? firstDate[0] : '',
              venueName: '',
              address: '',
              price: '',
              description: text.substring(0, 1000),
              images: images.slice(0, 5),
              listImage: images[0] || null,
              ticketUrl: url,
              notes: ''
            });
          }
        }
        
        return eventBlocks;
      }, articleUrl);

      return events || [];
    } catch (error) {
      console.error(`❌ 提取活动失败:`, error.message);
      return [];
    }
  }

  processEventData(eventData) {
    // 设置默认日期（用于数据库必需字段）
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // 默认明天
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // 尝试从日期文本解析（用于 startDate/endDate）
    // 但时间文本会原样保存到 startTime/endTime
    if (eventData.dateText) {
      const dateParsed = this.parseDate(eventData.dateText);
      if (dateParsed) {
        startDate = dateParsed.start;
        endDate = dateParsed.end || new Date(startDate);
      }
    }

    // 确定分类
    let category = 'other';
    const text = (eventData.title + ' ' + eventData.description).toLowerCase();
    if (text.includes('exhibition') || text.includes('exhibit') || text.includes('展览') || text.includes('展')) category = 'exhibition';
    else if (text.includes('concert') || text.includes('music') || text.includes('音乐会') || text.includes('音乐')) category = 'concert';
    else if (text.includes('festival') || text.includes('节')) category = 'festival';
    else if (text.includes('workshop') || text.includes('workshop') || text.includes('工作坊')) category = 'workshop';
    else if (text.includes('sport') || text.includes('fitness') || text.includes('运动') || text.includes('体育')) category = 'sports';
    else if (text.includes('food') || text.includes('dining') || text.includes('美食') || text.includes('吃')) category = 'food';
    else if (text.includes('art') || text.includes('dance') || text.includes('ballet') || text.includes('theater') || text.includes('艺术') || text.includes('舞蹈')) category = 'art';
    else if (text.includes('live') || text.includes('dj') || text.includes('club')) category = 'music';

    // 处理图片（最多5张）
    let images = [];
    if (eventData.images && Array.isArray(eventData.images)) {
      images = eventData.images.slice(0, 5); // 最多5张
    } else if (eventData.image) {
      images = [eventData.image];
    }
    
    // 列表页图片（使用第一张图片或专门指定的）
    const listImage = eventData.listImage || images[0] || null;

    // 价格信息：原样保存为文本到 price.note
    let priceInfo = null;
    if (eventData.price) {
      priceInfo = {
        amount: 0, // 暂不解析数字
        currency: 'CNY',
        note: eventData.price // 原样保存价格文本
      };
    }

    // 地点名称和地址
    let venueName = eventData.venueName || '';
    let venueAddress = eventData.address || '';
    
    // 如果地址和名称相同，且看起来像地址，则地点名称为空
    if (venueName === venueAddress && (venueAddress.includes('路') || venueAddress.includes('Lu') || venueAddress.includes('Road'))) {
      venueName = '';
    }
    
    // 如果地点名称为空，但有地址，留空（不显示TBA），让前端可以显示地址
    // 只有在既没有地点名称也没有地址的情况下，才显示TBA
    if (!venueName && !venueAddress) {
      venueName = 'TBA';
    } else if (!venueName) {
      // 有地址但没有地点名称，留空
      venueName = '';
    }

    // 备注：如果有日期文本但无法解析，可以保存到 notes
    let notes = eventData.notes || '';
    if (eventData.dateText && !notes) {
      // 可以把日期文本也保存到备注，但现在先保存到 startTime
    }

    return {
      // 英文标题
      title: eventData.title || 'Untitled Event',
      // 英文描述
      description: eventData.description || 'No description available',
      category,
      // 地点信息（名称和地址分开）
      venueName: venueName,
      venueAddress: venueAddress,
      // 时间（日期用于数据库，时间文本原样保存）
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime: eventData.dateText || eventData.startTime || null, // 保存时间文本原样
      endTime: eventData.endTime || null,
      // 价格（原样保存为文本）
      price: priceInfo,
      // 图片（最多5张）
      images: images.slice(0, 5),
      // 列表页图片
      listImage: listImage,
      // 购票链接
      ticketUrl: eventData.ticketUrl || eventData.url || null,
      // 备注
      notes: notes || null,
      // 其他字段
      source: {
        platform: 'smartshanghai_wechat',
        url: eventData.url,
        scrapedAt: new Date().toISOString()
      },
      tags: this.extractTags(eventData.title + ' ' + eventData.description),
      language: ['Chinese', 'English']
    };
  }

  parseDate(dateText) {
    if (!dateText) return null;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // 格式: "1月15日" 或 "01/15" 或 "1-15"
    let match = dateText.match(/(\d{1,2})[月\/\-](\d{1,2})[日]?/);
    if (match) {
      const eventMonth = parseInt(match[1]) - 1;
      const eventDay = parseInt(match[2]);
      
      // 如果月份小于当前月份，说明是明年
      let eventYear = year;
      if (eventMonth < month || (eventMonth === month && eventDay < today.getDate())) {
        eventYear = year + 1;
      }
      
      const start = new Date(eventYear, eventMonth, eventDay);
      
      // 检查日期范围
      const rangeMatch = dateText.match(/(\d{1,2})[月\/\-](\d{1,2})[日]?\s*[-–—至到]\s*(\d{1,2})[月\/\-](\d{1,2})[日]?/);
      if (rangeMatch) {
        const endMonth = parseInt(rangeMatch[3]) - 1;
        const endDay = parseInt(rangeMatch[4]);
        const end = new Date(eventYear, endMonth, endDay);
        return { start, end };
      }
      
      return { start, end: new Date(start) };
    }

    // 格式: "2024-01-15" 或 "2024/01/15"
    match = dateText.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      const start = new Date(year, month, day);
      return { start, end: new Date(start) };
    }

    // 格式: "Jan 15" 或 "January 15"
    match = dateText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/i);
    if (match) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const eventMonth = monthNames.indexOf(match[1].toLowerCase().substring(0, 3));
      const eventDay = parseInt(match[2]);
      let eventYear = year;
      if (eventMonth < month || (eventMonth === month && eventDay < today.getDate())) {
        eventYear = year + 1;
      }
      const start = new Date(eventYear, eventMonth, eventDay);
      return { start, end: new Date(start) };
    }

    return null;
  }

  extractTags(text) {
    const commonTags = ['live music', 'art', 'food', 'dance', 'theater', 'comedy', 'family', 'nightlife', 'exhibition', 'concert', 'workshop', 'sports', '音乐', '艺术', '展览', '音乐会', '工作坊'];
    const tags = [];
    const lowerText = text.toLowerCase();
    
    commonTags.forEach(tag => {
      if (lowerText.includes(tag.toLowerCase())) {
        tags.push(tag);
      }
    });

    return tags;
  }

  // 保留原有的抓取方法（向后兼容）
  async scrapeEvents() {
    return this.scrapeWeChatArticle('https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q');
  }
}

const scraper = new SmartShanghaiScraper();

module.exports = scraper;
