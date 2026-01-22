const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Location = require('../models/Location');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Guide = require('../models/Guide');

/**
 * 获取系统 Chrome 浏览器路径
 */
function getChromePath() {
  const possiblePaths = [
    // Windows 常见路径
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
    // macOS 路径
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Linux 路径
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  for (const chromePath of possiblePaths) {
    if (chromePath && fs.existsSync(chromePath)) {
      console.log(`[Scraper] 找到 Chrome: ${chromePath}`);
      return chromePath;
    }
  }

  return null;
}

/**
 * 抓取微信公众号文章并根据配置提取字段
 */
async function scrapeWeChatArticle(articleUrl, dataType, fieldMappings) {
  let browser = null;

  try {
    console.log(`[Scraper] 启动浏览器...`);
    
    // 尝试使用系统安装的 Chrome
    const chromePath = getChromePath();
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    };

    // 如果找到系统 Chrome，使用它
    if (chromePath) {
      launchOptions.executablePath = chromePath;
      console.log(`[Scraper] 使用系统 Chrome: ${chromePath}`);
    } else {
      console.log(`[Scraper] 未找到系统 Chrome，将使用 Puppeteer 自带的 Chromium`);
    }
    
    // 启动浏览器
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 设置真实的用户代理，隐藏自动化特征
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 隐藏 webdriver 特征
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // 访问文章
    console.log(`[Scraper] 正在访问文章页面...`);
    try {
      await page.goto(articleUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('[Scraper] 首次加载可能超时，继续尝试...');
    }
    
    // 等待内容加载
    console.log(`[Scraper] 等待页面内容加载...`);
    await page.waitForTimeout(10000);

    // 滚动页面触发懒加载
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(3000);

    // 根据配置的选择器提取字段
    console.log(`[Scraper] 开始提取字段数据...`);
    console.log(`[Scraper] 字段映射配置:`, JSON.stringify(fieldMappings, null, 2));
    
    const extractedData = await page.evaluate((mappings, type) => {
      const data = {};
      const extractionLog = {}; // 用于记录提取过程

      // 辅助函数：从HTML代码片段中提取可能的CSS选择器
      function extractSelectorFromHtml(htmlSnippet) {
        if (!htmlSnippet || htmlSnippet.trim() === '') return null;
        
        // 如果已经是CSS选择器格式（不包含 < >），直接返回
        if (!htmlSnippet.includes('<')) {
          return htmlSnippet.trim();
        }
        
        // 尝试从HTML片段中提取标签名和属性
        const tagMatch = htmlSnippet.match(/<(\w+)[^>]*>/);
        if (!tagMatch) return null;
        
        const tagName = tagMatch[1];
        const attrs = {};
        
        // 提取属性
        const attrMatches = htmlSnippet.matchAll(/(\w+(?:-\w+)*)=["']([^"']*)["']/g);
        for (const match of attrMatches) {
          attrs[match[1]] = match[2];
        }
        
        // 检查HTML片段中是否包含 span[leaf]
        const hasLeafSpan = htmlSnippet.includes('<span') && (htmlSnippet.includes('leaf=""') || htmlSnippet.includes('leaf=\\"\\"') || htmlSnippet.includes('leaf'));
        
        // 构建选择器：优先使用class或id，否则使用标签名
        let selector = tagName;
        
        // 如果有 leaf 属性在span中，且外层是section或p，使用更精确的选择器
        if (hasLeafSpan && (tagName === 'section' || tagName === 'p')) {
          // 标记需要使用特殊处理逻辑（在实际提取时处理）
          // 返回一个标记，让提取逻辑知道要查找包含 span[leaf] 的元素
          selector = `${tagName}[data-has-leaf-span]`;
        } else if (attrs.class) {
          // 使用第一个class（去除空白）
          const firstClass = attrs.class.split(/\s+/).filter(c => c)[0];
          if (firstClass) {
            selector = `${tagName}.${firstClass.replace(/\./g, '\\.')}`;
          }
        } else if (attrs.id) {
          selector = `#${attrs.id.replace(/#/g, '')}`;
        }
        
        return selector;
      }

      for (const [fieldKey, selector] of Object.entries(mappings)) {
        if (!selector || !selector.trim()) {
          extractionLog[fieldKey] = { selector, found: false, reason: '选择器为空' };
          continue;
        }

        try {
          // 如果输入的是HTML片段，尝试提取选择器
          let actualSelector = selector.trim();
          let isHtmlSnippet = selector.includes('<');
          let needsSpecialHandling = false; // 标记是否需要特殊处理（包含span[leaf]的情况）
          
          if (isHtmlSnippet) {
            const extracted = extractSelectorFromHtml(selector);
            if (!extracted) {
              extractionLog[fieldKey] = { 
                selector, 
                found: false, 
                reason: '无法从HTML片段中提取有效的CSS选择器。请直接输入CSS选择器，例如：section, p, .class-name, #id-name 等' 
              };
              continue;
            }
            actualSelector = extracted;
            
            // 检查是否需要特殊处理（包含span[leaf]的情况）
            needsSpecialHandling = actualSelector.includes('[data-has-leaf-span]');
            
            console.log(`[浏览器] 字段 ${fieldKey}: 从HTML片段提取到选择器 "${actualSelector}", 需要特殊处理: ${needsSpecialHandling}`);
          }
          
          // 根据字段类型提取数据
          if (fieldKey.includes('Image') || fieldKey === 'coverImage') {
            // 图片字段：提取第一个匹配的图片URL
            const element = document.querySelector(actualSelector);
            if (element) {
              const src = element.getAttribute('src') || 
                          element.getAttribute('data-src') || 
                          element.getAttribute('data-original') || '';
              data[fieldKey] = src;
              extractionLog[fieldKey] = { 
                selector: actualSelector,
                originalInput: isHtmlSnippet ? selector.substring(0, 50) + '...' : selector,
                found: true, 
                value: src.substring(0, 100) 
              };
            } else {
              extractionLog[fieldKey] = { 
                selector: actualSelector,
                originalInput: isHtmlSnippet ? selector.substring(0, 50) + '...' : selector,
                found: false, 
                reason: `未找到匹配的元素（选择器: ${actualSelector}）` 
              };
            }
          } else if (fieldKey === 'images') {
            // 图片数组：提取所有匹配的图片URL
            const elements = document.querySelectorAll(actualSelector);
            const images = [];
            elements.forEach(img => {
              const src = img.getAttribute('src') || 
                         img.getAttribute('data-src') || 
                         img.getAttribute('data-original');
              if (src && !src.startsWith('data:')) {
                images.push(src);
              }
            });
            data[fieldKey] = images;
            extractionLog[fieldKey] = { 
              selector: actualSelector,
              originalInput: isHtmlSnippet ? selector.substring(0, 50) + '...' : selector,
              found: elements.length > 0, 
              count: images.length 
            };
          } else if (fieldKey.includes('content') || (fieldKey.includes('description') && type !== 'product')) {
            // HTML内容字段：保留HTML格式
            let element = null;
            
            // 如果需要特殊处理（包含span[leaf]的情况）
            if (needsSpecialHandling) {
              const tagName = actualSelector.replace('[data-has-leaf-span]', '');
              // 查找所有该标签的元素，找到包含 span[leaf] 的那个
              const allElements = document.querySelectorAll(tagName);
              for (const el of allElements) {
                const leafSpan = el.querySelector('span[leaf]');
                if (leafSpan) {
                  // 对于description字段，检查是否有内容
                  const text = leafSpan.innerText || leafSpan.textContent || '';
                  const html = leafSpan.innerHTML || el.innerHTML || '';
                  if (text.trim() || html.trim()) {
                    element = el;
                    break;
                  }
                }
              }
              // 如果没找到，尝试直接查找 span[leaf] 的父元素
              if (!element) {
                const leafSpan = document.querySelector('span[leaf]');
                if (leafSpan) {
                  element = leafSpan.closest(tagName);
                }
              }
            } else {
              element = document.querySelector(actualSelector);
            }
            
            if (element) {
              // 处理图片：确保data-src转换为src
              const images = element.querySelectorAll('img');
              images.forEach(img => {
                const dataSrc = img.getAttribute('data-src');
                if (dataSrc && !img.src) {
                  img.src = dataSrc;
                }
                img.removeAttribute('data-src');
              });
              
              let html = element.innerHTML;
              // 清理一些不需要的属性
              html = html.replace(/data-src=/g, 'src=');
              html = html.replace(/data-copyright/gi, '');
              html = html.trim();
              data[fieldKey] = html || '';
              extractionLog[fieldKey] = { 
                selector: actualSelector,
                originalInput: isHtmlSnippet ? selector.substring(0, 50) + '...' : selector,
                found: true, 
                length: html.length,
                preview: html.substring(0, 100)
              };
            } else {
              extractionLog[fieldKey] = { 
                selector: actualSelector,
                originalInput: isHtmlSnippet ? selector.substring(0, 50) + '...' : selector,
                found: false, 
                reason: `未找到匹配的元素（选择器: ${actualSelector}）` 
              };
            }
          } else {
            // 文本字段：只提取纯文本（不提取HTML），或JSON字段
            let element = null;
            
            // 如果选择器标记了需要查找包含 span[leaf] 的元素
            if (needsSpecialHandling && actualSelector.includes('[data-has-leaf-span]')) {
              const tagName = actualSelector.replace('[data-has-leaf-span]', '');
              
              // 从原始HTML片段中提取关键词，用于更精确的匹配
              let searchKeywords = [];
              if (isHtmlSnippet && selector.includes('<')) {
                // 提取HTML片段中的文本内容作为关键词
                const textMatch = selector.match(/>([^<]+)</g);
                if (textMatch) {
                  searchKeywords = textMatch
                    .map(m => m.replace(/[<>]/g, '').trim())
                    .filter(t => t && t.length > 2); // 只保留长度大于2的关键词
                }
              }
              
              // 查找所有该标签的元素，找到包含 span[leaf] 的那个
              const allElements = document.querySelectorAll(tagName);
              let bestMatch = null;
              let bestMatchScore = 0;
              
              for (const el of allElements) {
                const leafSpan = el.querySelector('span[leaf]');
                if (leafSpan) {
                  const text = leafSpan.innerText || leafSpan.textContent || '';
                  const fullText = el.innerText || el.textContent || '';
                  
                  if (text.trim() || fullText.trim()) {
                    // 如果有搜索关键词，计算匹配度
                    if (searchKeywords.length > 0) {
                      let score = 0;
                      const lowerFullText = fullText.toLowerCase();
                      for (const keyword of searchKeywords) {
                        if (lowerFullText.includes(keyword.toLowerCase())) {
                          score += keyword.length; // 更长的关键词匹配得分更高
                        }
                      }
                      if (score > bestMatchScore) {
                        bestMatchScore = score;
                        bestMatch = el;
                      }
                    } else {
                      // 没有关键词，使用第一个匹配的元素
                      if (!element) {
                        element = el;
                      }
                    }
                  }
                }
              }
              
              // 如果找到了最佳匹配，使用它；否则使用第一个匹配
              if (bestMatch) {
                element = bestMatch;
              } else if (!element && allElements.length > 0) {
                // 尝试直接查找 span[leaf] 的父元素
                const leafSpan = document.querySelector('span[leaf]');
                if (leafSpan) {
                  element = leafSpan.closest(tagName);
                }
              }
            } else {
              // 常规选择器查找
              element = document.querySelector(actualSelector);
              
              // 如果没找到，且有多个匹配元素，尝试查找包含文本的那个
              if (!element && actualSelector && !actualSelector.includes(':')) {
                const elements = document.querySelectorAll(actualSelector);
                if (elements.length > 1) {
                  // 如果有HTML片段，尝试匹配关键词
                  if (isHtmlSnippet && selector.includes('<')) {
                    const textMatch = selector.match(/>([^<]+)</g);
                    if (textMatch) {
                      const searchKeywords = textMatch
                        .map(m => m.replace(/[<>]/g, '').trim())
                        .filter(t => t && t.length > 2);
                      
                      let bestMatch = null;
                      let bestMatchScore = 0;
                      for (const el of elements) {
                        const text = (el.innerText || el.textContent || '').toLowerCase();
                        let score = 0;
                        for (const keyword of searchKeywords) {
                          if (text.includes(keyword.toLowerCase())) {
                            score += keyword.length;
                          }
                        }
                        if (score > bestMatchScore) {
                          bestMatchScore = score;
                          bestMatch = el;
                        }
                      }
                      if (bestMatch) {
                        element = bestMatch;
                      }
                    }
                  }
                  
                  // 如果还是没找到，使用第一个包含非空文本的元素
                  if (!element) {
                    for (const el of elements) {
                      const text = el.innerText || el.textContent || '';
                      if (text.trim()) {
                        element = el;
                        break;
                      }
                    }
                  }
                } else if (elements.length === 1) {
                  element = elements[0];
                }
              }
            }
            
            if (element) {
              // 确定字段类型：title/name等字段应该只提取纯文本
              const isTextOnlyField = fieldKey === 'title' || fieldKey === 'titleCN' || 
                                      fieldKey === 'name' || fieldKey === 'nameCN' ||
                                      fieldKey.includes('venueName') || fieldKey.includes('venueAddress') ||
                                      fieldKey === 'city' || fieldKey === 'district' ||
                                      fieldKey === 'startTime' || fieldKey === 'endTime';
              
              let textValue = '';
              
              if (isTextOnlyField) {
                // 对于纯文本字段，只提取文本内容，不使用innerHTML
                // 优先使用innerText（自动处理文本节点）
                textValue = element.innerText || element.textContent || '';
                
                // 清理文本：移除多余的空白字符
                if (textValue) {
                  textValue = textValue.trim().replace(/\s+/g, ' ');
                }
                
                // 如果innerText为空，尝试从嵌套元素中提取文本（特别是span[leaf]）
                if (!textValue) {
                  // 先尝试查找 span[leaf]
                  const leafSpan = element.querySelector('span[leaf]');
                  if (leafSpan) {
                    textValue = (leafSpan.innerText || leafSpan.textContent || '').trim().replace(/\s+/g, ' ');
                  }
                  
                  // 如果还是空，尝试从所有子元素中提取文本
                  if (!textValue) {
                    const childTexts = Array.from(element.children || [])
                      .map(child => child.innerText || child.textContent || '')
                      .filter(text => text.trim())
                      .join(' ');
                    if (childTexts.trim()) {
                      textValue = childTexts.trim().replace(/\s+/g, ' ');
                    }
                  }
                }
                
                // 如果仍然为空，尝试查找所有文本节点
                if (!textValue) {
                  const walker = document.createTreeWalker(
                    element,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                  );
                  const textNodes = [];
                  let node;
                  while (node = walker.nextNode()) {
                    if (node.textContent.trim()) {
                      textNodes.push(node.textContent.trim());
                    }
                  }
                  if (textNodes.length > 0) {
                    textValue = textNodes.join(' ').replace(/\s+/g, ' ');
                  }
                }
                
                // 确保移除任何HTML标签（双重保险）
                textValue = textValue.replace(/<[^>]*>/g, '').trim();
              } else {
                // 对于其他文本字段（包括JSON字段如price），先尝试提取文本
                // 对于price字段，需要提取包含价格信息的文本
                if (fieldKey === 'price' && type === 'event') {
                  // 提取价格相关的文本
                  textValue = element.innerText || element.textContent || '';
                  // 清理文本：移除多余的空白字符，但保留价格格式
                  if (textValue) {
                    textValue = textValue.trim().replace(/\s+/g, ' ');
                    // 尝试提取价格数字和货币符号
                    // 例如：从 "Price: 180-880rmb" 提取价格信息
                  }
                } else {
                  // 对于其他文本字段，先尝试提取文本，如果为空再尝试HTML
                  textValue = element.innerText || element.textContent || '';
                  
                  // 清理文本：移除多余的空白字符
                  if (textValue) {
                    textValue = textValue.trim().replace(/\s+/g, ' ');
                  }
                  
                  // 如果还是空，尝试提取HTML（某些字段可能需要HTML）
                  if (!textValue && element.innerHTML) {
                    textValue = element.innerHTML.trim();
                  }
                }
              }
              
              data[fieldKey] = textValue || '';
              extractionLog[fieldKey] = { 
                selector: actualSelector,
                originalInput: selector.includes('<') ? selector.substring(0, 50) + '...' : selector,
                found: true, 
                value: textValue ? textValue.substring(0, 100) : '(空)',
                fullLength: textValue ? textValue.length : 0,
                note: textValue ? '提取成功' : '元素存在但文本内容为空',
                isTextOnly: isTextOnlyField,
                elementTag: element.tagName,
                elementText: element.innerText ? element.innerText.substring(0, 50) : ''
              };
            } else {
              extractionLog[fieldKey] = { 
                selector: actualSelector,
                originalInput: selector.includes('<') ? selector.substring(0, 50) + '...' : selector,
                found: false, 
                reason: `未找到匹配的元素（选择器: ${actualSelector}）` 
              };
            }
          }
        } catch (error) {
          extractionLog[fieldKey] = { 
            selector: actualSelector || selector,
            originalInput: selector.includes('<') ? selector.substring(0, 50) + '...' : selector,
            found: false, 
            error: error.message 
          };
          data[fieldKey] = '';
        }
      }

      return { data, extractionLog };
    }, fieldMappings, dataType);

    // 记录提取结果
    console.log(`[Scraper] 字段提取完成`);
    console.log(`[Scraper] 提取日志:`, JSON.stringify(extractedData.extractionLog, null, 2));
    console.log(`[Scraper] 提取到的数据键:`, Object.keys(extractedData.data));
    console.log(`[Scraper] 提取到的数据值预览:`, Object.entries(extractedData.data).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.substring(0, 50) + (value.length > 50 ? '...' : '');
      } else {
        acc[key] = value;
      }
      return acc;
    }, {}));
    
    // 检查哪些字段没有提取到
    const missingFields = [];
    const emptyRequiredFields = [];
    
    for (const [fieldKey, log] of Object.entries(extractedData.extractionLog)) {
      if (!log.found && fieldMappings[fieldKey]) {
        missingFields.push({
          field: fieldKey,
          selector: log.selector,
          reason: log.reason || log.error || '未知原因'
        });
      }
      
      // 检查必需字段是否为空
      const isRequired = (dataType === 'event' && (fieldKey === 'title' || fieldKey === 'description')) ||
                         (dataType === 'location' && (fieldKey === 'name' || fieldKey === 'address' || fieldKey === 'district' || fieldKey === 'description')) ||
                         (dataType === 'product' && (fieldKey === 'name' || fieldKey === 'description' || fieldKey === 'price')) ||
                         (dataType === 'guide' && (fieldKey === 'title' || fieldKey === 'content'));
      
      if (isRequired) {
        const value = extractedData.data[fieldKey];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          emptyRequiredFields.push({
            field: fieldKey,
            selector: log.selector,
            extractedValue: value || '(空)',
            reason: log.found ? '元素存在但内容为空' : (log.reason || '未找到元素')
          });
        }
      }
    }
    
    if (missingFields.length > 0) {
      console.warn(`[Scraper] 以下字段未能提取到数据:`, missingFields);
    }
    
    if (emptyRequiredFields.length > 0) {
      console.error(`[Scraper] 以下必需字段为空:`, emptyRequiredFields);
      throw new Error(
        `必需字段为空：${emptyRequiredFields.map(f => f.field).join(', ')}。` +
        `请检查选择器是否正确。详细提取日志：${JSON.stringify(extractedData.extractionLog, null, 2)}`
      );
    }

    // 使用提取到的数据
    const finalExtractedData = extractedData.data;

    // 已在上方记录

    // 关闭浏览器
    await browser.close();
    browser = null;

    // 处理和验证数据
    const processedData = processExtractedData(finalExtractedData, dataType, fieldMappings);
    
    // 日期字段现在是非必填的，不再需要检查
    
    // 保存到数据库
    console.log(`[Scraper] 保存数据到数据库...`);
    const savedData = await saveToDatabase(processedData, dataType);

    return {
      dataId: savedData.id,
      data: savedData,
      message: '抓取成功并已保存到数据库'
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * 处理和验证提取的数据
 */
function processExtractedData(extractedData, dataType, fieldMappings) {
  const processed = { ...extractedData };

  // 定义各字段的最大长度限制（根据数据库模型）
  const fieldLengthLimits = {
    // Event 字段
    'event': {
      title: 255,
      titleCN: 255,
      venueName: 255,
      venueAddress: 500,
      city: 100,
      district: 100,
      startTime: 50,
      endTime: 50,
      ticketUrl: 500,
      listImage: 500
    },
    // Location 字段
    'location': {
      name: 255,
      nameCN: 255,
      address: 500,
      district: 100,
      city: 100,
      postalCode: 20,
      phone: 50,
      website: 500
    },
    // Product 字段
    'product': {
      name: 255,
      nameCN: 255,
      brand: 255,
      category: 100,
      unit: 50
    },
    // Guide 字段
    'guide': {
      title: 255,
      titleCN: 255
    }
  };

  // 应用字段长度限制
  const limits = fieldLengthLimits[dataType] || {};
  for (const [fieldKey, maxLength] of Object.entries(limits)) {
    if (processed[fieldKey] && typeof processed[fieldKey] === 'string') {
      // 对于文本字段，确保是纯文本（移除HTML标签）
      let text = processed[fieldKey];
      
      // 如果字段类型是text而不是html，移除HTML标签
      const fieldTemplate = fieldMappings && Object.keys(fieldMappings).includes(fieldKey);
      // 判断字段类型：如果包含在text类型字段中，移除HTML
      if (fieldKey === 'title' || fieldKey === 'titleCN' || fieldKey === 'name' || fieldKey === 'nameCN') {
        // 这些字段应该是纯文本，移除HTML标签
        text = text.replace(/<[^>]*>/g, '').trim();
      }
      
      // 截断到最大长度
      if (text.length > maxLength) {
        console.warn(`[Scraper] 字段 ${fieldKey} 长度 ${text.length} 超过限制 ${maxLength}，已截断`);
        processed[fieldKey] = text.substring(0, maxLength);
      } else {
        processed[fieldKey] = text;
      }
    }
  }

  // 根据数据类型进行特定的数据处理
  switch (dataType) {
    case 'location':
      // 处理营业时间
      if (processed.openingHours && typeof processed.openingHours === 'string') {
        try {
          processed.openingHours = JSON.parse(processed.openingHours);
        } catch (e) {
          // 如果不是JSON，尝试解析为对象格式
          processed.openingHours = parseOpeningHours(processed.openingHours);
        }
      }
      // 确保必需字段
      processed.city = processed.city || 'Shanghai';
      break;

    case 'product':
      // 处理价格
      if (processed.price) {
        const priceStr = String(processed.price).replace(/[^0-9.]/g, '');
        processed.price = parseFloat(priceStr) || 0;
      }
      if (processed.originalPrice) {
        const priceStr = String(processed.originalPrice).replace(/[^0-9.]/g, '');
        processed.originalPrice = parseFloat(priceStr) || null;
      }
      break;

    case 'event':
      // 处理日期 - 如果解析失败，删除字段（因为是非必填的）
      if (processed.startDate) {
        const parsedStartDate = parseDate(processed.startDate);
        if (parsedStartDate && parsedStartDate instanceof Date && !isNaN(parsedStartDate.getTime())) {
          processed.startDate = parsedStartDate;
        } else {
          // 解析失败，删除该字段（非必填）
          delete processed.startDate;
          console.warn(`[Scraper] 开始日期解析失败，已删除该字段（非必填）`);
        }
      }
      if (processed.endDate) {
        const parsedEndDate = parseDate(processed.endDate);
        if (parsedEndDate && parsedEndDate instanceof Date && !isNaN(parsedEndDate.getTime())) {
          processed.endDate = parsedEndDate;
        } else {
          // 解析失败，删除该字段（非必填）
          delete processed.endDate;
          console.warn(`[Scraper] 结束日期解析失败，已删除该字段（非必填）`);
        }
      }
      // 处理营业时间（如果提供）
      if (processed.openingHours && typeof processed.openingHours === 'string') {
        try {
          processed.openingHours = JSON.parse(processed.openingHours);
        } catch (e) {
          // 如果不是JSON，尝试解析为对象格式
          processed.openingHours = parseOpeningHours(processed.openingHours);
        }
      }
      break;

    case 'guide':
      // 生成摘要（如果没有提供）
      if (!processed.summary && processed.content) {
        const textContent = processed.content.replace(/<[^>]*>/g, '').trim();
        processed.summary = textContent.substring(0, 200);
      }
      break;
  }

  // 清理空字符串字段和无效值（但保留必需字段）
  for (const key in processed) {
    // 必需字段不要删除（即使为空也要保留，让数据库验证报错）
    const isRequired = (dataType === 'event' && (key === 'title' || key === 'description')) ||
                       (dataType === 'location' && (key === 'name' || key === 'address' || key === 'district' || key === 'description')) ||
                       (dataType === 'product' && (key === 'name' || key === 'description' || key === 'price')) ||
                       (dataType === 'guide' && (key === 'title' || key === 'content'));
    
    if (isRequired) {
      // 必需字段如果为空，保持为空字符串，让数据库验证捕获错误
      continue;
    }
    
    const value = processed[key];
    
    // 删除空值或null值
    if (value === '' || value === null || value === undefined) {
      delete processed[key];
      continue;
    }
    
    // 检查Date对象是否为无效日期
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        console.warn(`[Scraper] 字段 ${key} 是无效日期，已删除`);
        delete processed[key];
        continue;
      }
    }
    
    // 检查是否为无效日期字符串
    if (typeof value === 'string' && (value.toLowerCase() === 'invalid date' || value.toLowerCase().includes('invalid'))) {
      console.warn(`[Scraper] 字段 ${key} 包含无效日期字符串，已删除`);
      delete processed[key];
      continue;
    }
    
    // 对于数组，如果是空数组，删除
    if (Array.isArray(value) && value.length === 0) {
      delete processed[key];
      continue;
    }
    
    // 对于对象，如果是空对象，删除（但保留必需的对象字段，如price、openingHours等）
    if (typeof value === 'object' && value !== null && !(value instanceof Date) && !Array.isArray(value)) {
      if (Object.keys(value).length === 0) {
        delete processed[key];
        continue;
      }
    }
  }

  return processed;
}

/**
 * 解析日期字符串 - 支持多种日期格式
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // 清理字符串
  dateStr = String(dateStr).trim();
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // 格式1: "2024-01-15" 或 "2024/01/15" 或 "2024.01.15"
  let match = dateStr.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (match) {
    const y = parseInt(match[1]);
    const m = parseInt(match[2]) - 1;
    const d = parseInt(match[3]);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // 格式2: "1月15日" 或 "01/15" 或 "1-15"（中文格式）
  match = dateStr.match(/(\d{1,2})[月\/\-](\d{1,2})[日]?/);
  if (match) {
    const eventMonth = parseInt(match[1]) - 1;
    const eventDay = parseInt(match[2]);
    
    // 如果月份小于当前月份，说明是明年
    let eventYear = year;
    if (eventMonth < month || (eventMonth === month && eventDay < today.getDate())) {
      eventYear = year + 1;
    }
    
    const date = new Date(eventYear, eventMonth, eventDay);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // 格式3: "2024年1月15日"（完整中文格式）
  match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日?/);
  if (match) {
    const y = parseInt(match[1]);
    const m = parseInt(match[2]) - 1;
    const d = parseInt(match[3]);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // 格式4: "Jan 15" 或 "January 15, 2024"（英文格式）
  match = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:,\s*(\d{4}))?/i);
  if (match) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIndex = monthNames.indexOf(match[1].toLowerCase().substring(0, 3));
    if (monthIndex !== -1) {
      const d = parseInt(match[2]);
      const y = match[3] ? parseInt(match[3]) : year;
      const date = new Date(y, monthIndex, d);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // 格式5: 尝试标准 Date 解析
  const date = new Date(dateStr);
  // 验证日期是否有效（不是 Invalid Date）
  if (!isNaN(date.getTime()) && date.toString() !== 'Invalid Date') {
    return date;
  }
  
  // 如果所有解析都失败，返回 null
  console.warn(`[Scraper] 无法解析日期格式: ${dateStr}`);
  return null;
}

/**
 * 解析营业时间字符串
 * 支持JSON格式或文本格式
 */
function parseOpeningHours(hoursStr) {
  if (!hoursStr) return null;
  
  // 如果是JSON字符串，尝试解析
  if (typeof hoursStr === 'string' && (hoursStr.trim().startsWith('{') || hoursStr.trim().startsWith('['))) {
    try {
      const parsed = JSON.parse(hoursStr);
      if (typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      // JSON解析失败，继续尝试文本解析
    }
  }
  
  // 文本格式解析
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const result = {};
  
  // 规范化时间格式
  const normalizeTime = (time) => {
    return time.replace(/(\d{1,2}:\d{2})\s*-?\s*(\d{1,2}:\d{2})/, '$1 - $2');
  };
  
  // 解析文本格式
  // 支持格式：
  // 1. "Monday-Friday, 08:00-22:00; Saturday-Sunday, 09:00-22:00"
  // 2. "Monday-Sunday, 08:00-20:00"
  // 3. 中文格式："周一至周五：08:00-22:00；周六至周日：09:00-22:00"
  
  // 先尝试英文格式
  const parts = hoursStr.split(/[;；]/).map(p => p.trim());
  
  for (const part of parts) {
    // 英文格式: "Monday-Friday, 08:00-22:00"
    let rangeMatch = part.match(/([A-Za-z]+)(?:-([A-Za-z]+))?[：:,]\s*([\d:-\s]+)/);
    if (rangeMatch) {
      const startDay = rangeMatch[1].toLowerCase();
      const endDay = rangeMatch[2] ? rangeMatch[2].toLowerCase() : startDay;
      const timeRange = normalizeTime(rangeMatch[3].trim());
      
      const startIndex = days.findIndex(d => d.startsWith(startDay));
      const endIndex = endDay ? days.findIndex(d => d.startsWith(endDay)) : startIndex;
      
      if (startIndex !== -1 && endIndex !== -1) {
        for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
          result[days[i]] = timeRange;
        }
        continue;
      }
    }
    
    // 中文格式: "周一至周五：08:00-22:00"
    const chineseDays = {
      '周一': 'monday', '周二': 'tuesday', '周三': 'wednesday', '周四': 'thursday',
      '周五': 'friday', '周六': 'saturday', '周日': 'sunday', '星期天': 'sunday',
      '一': 'monday', '二': 'tuesday', '三': 'wednesday', '四': 'thursday',
      '五': 'friday', '六': 'saturday', '日': 'sunday', '天': 'sunday'
    };
    
    rangeMatch = part.match(/(周[一二三四五六日天]|星期[一二三四五六日天])[至到](周[一二三四五六日天]|星期[一二三四五六日天])[：:]\s*([\d:-\s]+)/);
    if (rangeMatch) {
      const startDayCN = rangeMatch[1];
      const endDayCN = rangeMatch[2];
      const timeRange = normalizeTime(rangeMatch[3].trim());
      
      let startDay = null;
      let endDay = null;
      
      for (const [cn, en] of Object.entries(chineseDays)) {
        if (startDayCN.includes(cn)) startDay = en;
        if (endDayCN.includes(cn)) endDay = en;
      }
      
      if (startDay && endDay) {
        const startIndex = days.indexOf(startDay);
        const endIndex = days.indexOf(endDay);
        if (startIndex !== -1 && endIndex !== -1) {
          for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
            result[days[i]] = timeRange;
          }
          continue;
        }
      }
    }
    
    // 单个时间范围，应用到所有天
    const timeMatch = part.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
    if (timeMatch && Object.keys(result).length === 0) {
      const timeRange = normalizeTime(timeMatch[1]);
      days.forEach(day => {
        result[day] = timeRange;
      });
    }
  }
  
  // 如果解析成功，返回结果
  if (Object.keys(result).length > 0) {
    return result;
  }
  
  // 如果解析失败，返回note格式作为fallback
  return { note: hoursStr };
}

/**
 * 保存数据到数据库
 */
async function saveToDatabase(data, dataType) {
  let savedData;

  try {
    console.log(`[Scraper] 准备保存 ${dataType} 数据:`, JSON.stringify(data, null, 2));

    switch (dataType) {
      case 'location':
        // 验证必需字段
        if (!data.name) {
          throw new Error('地点名称(name)是必需字段，不能为空');
        }
        if (!data.address) {
          throw new Error('地点地址(address)是必需字段，不能为空');
        }
        if (!data.district) {
          throw new Error('区域(district)是必需字段，不能为空');
        }
        if (!data.description) {
          throw new Error('地点描述(description)是必需字段，不能为空');
        }

        savedData = await Location.create(data);
        break;

      case 'product':
        // 验证必需字段
        if (!data.name) {
          throw new Error('产品名称(name)是必需字段，不能为空');
        }
        if (!data.description) {
          throw new Error('产品描述(description)是必需字段，不能为空');
        }
        if (!data.price && data.price !== 0) {
          throw new Error('产品价格(price)是必需字段，不能为空');
        }

        savedData = await Product.create(data);
        break;

      case 'event':
        // 验证必需字段
        if (!data.title) {
          throw new Error('活动标题(title)是必需字段，不能为空');
        }
        if (!data.description) {
          throw new Error('活动描述(description)是必需字段，不能为空');
        }

        // 日期字段现在是可选的，只处理已提供的日期
        // 确保日期是有效的 Date 对象，无效则完全删除字段
        const cleanDateField = (fieldName) => {
          if (data[fieldName] !== undefined && data[fieldName] !== null) {
            let dateValue = data[fieldName];
            
            // 如果是字符串
            if (typeof dateValue === 'string') {
              // 检查是否是无效日期字符串
              if (dateValue.toLowerCase() === 'invalid date' || 
                  dateValue.toLowerCase().includes('invalid') ||
                  dateValue.trim() === '') {
                delete data[fieldName];
                console.warn(`[Scraper] ${fieldName} 是无效日期字符串，已删除`);
                return;
              }
              
              // 尝试解析
              const parsed = parseDate(dateValue);
              if (parsed && parsed instanceof Date && !isNaN(parsed.getTime())) {
                data[fieldName] = parsed;
              } else {
                delete data[fieldName];
                console.warn(`[Scraper] ${fieldName} 解析失败，已删除`);
              }
            } 
            // 如果是Date对象
            else if (dateValue instanceof Date) {
              // 验证是否有效
              if (isNaN(dateValue.getTime()) || dateValue.toString() === 'Invalid Date') {
                delete data[fieldName];
                console.warn(`[Scraper] ${fieldName} 是无效的Date对象，已删除`);
              }
            }
            // 其他类型，删除
            else {
              delete data[fieldName];
              console.warn(`[Scraper] ${fieldName} 类型不正确，已删除`);
            }
          } else {
            // 如果是 null 或 undefined，删除字段
            delete data[fieldName];
          }
        };
        
        // 清理日期字段
        cleanDateField('startDate');
        cleanDateField('endDate');
        
        // 清理其他空值和无效值字段（非必填的）
        Object.keys(data).forEach(key => {
          const value = data[key];
          
          // 跳过必需字段
          if (key === 'title' || key === 'description') {
            return;
          }
          
          // 删除空值
          if (value === '' || value === null || value === undefined) {
            delete data[key];
            return;
          }
          
          // 删除无效日期对象
          if (value instanceof Date) {
            if (isNaN(value.getTime()) || value.toString() === 'Invalid Date') {
              delete data[key];
              console.warn(`[Scraper] 字段 ${key} 是无效日期，已删除`);
            }
            return;
          }
          
          // 删除无效日期字符串
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (lowerValue === 'invalid date' || 
                lowerValue.includes('invalid') ||
                lowerValue.trim() === '') {
              delete data[key];
              console.warn(`[Scraper] 字段 ${key} 包含无效值，已删除`);
            }
            return;
          }
        });
        
        // 最终验证：确保没有无效日期字段
        // 创建一个新的对象，只包含有效的字段
        const cleanData = {};
        
        // 复制所有字段，但跳过无效的日期字段
        Object.keys(data).forEach(key => {
          const value = data[key];
          
          // 对于日期字段，进行严格验证
          if (key === 'startDate' || key === 'endDate') {
            // 只保留有效的Date对象
            if (value instanceof Date) {
              if (!isNaN(value.getTime()) && value.toString() !== 'Invalid Date') {
                cleanData[key] = value;
              } else {
                console.warn(`[Scraper] 最终清理：跳过无效的 ${key} Date对象`);
              }
            } else {
              // 不是Date对象，不包含在cleanData中（允许为null/undefined）
              console.warn(`[Scraper] 最终清理：跳过非Date类型的 ${key}: ${typeof value}`);
            }
          } else {
            // 非日期字段，直接复制
            cleanData[key] = value;
          }
        });
        
        console.log(`[Scraper] 准备保存的Event数据:`, JSON.stringify(cleanData, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }, 2));
        
        // 验证：确保cleanData中没有无效日期
        if (cleanData.startDate && (!(cleanData.startDate instanceof Date) || isNaN(cleanData.startDate.getTime()))) {
          delete cleanData.startDate;
          console.warn(`[Scraper] 最终验证：删除无效的 startDate`);
        }
        if (cleanData.endDate && (!(cleanData.endDate instanceof Date) || isNaN(cleanData.endDate.getTime()))) {
          delete cleanData.endDate;
          console.warn(`[Scraper] 最终验证：删除无效的 endDate`);
        }
        
        // 使用清理后的数据创建记录
        savedData = await Event.create(cleanData);
        break;

      case 'guide':
        // 验证必需字段
        if (!data.title) {
          throw new Error('攻略标题(title)是必需字段，不能为空');
        }
        if (!data.content) {
          throw new Error('攻略正文(content)是必需字段，不能为空');
        }

        savedData = await Guide.create(data);
        break;

      default:
        throw new Error(`不支持的数据类型: ${dataType}`);
    }

    console.log(`[Scraper] ${dataType} 数据保存成功，ID: ${savedData.id}`);
    return savedData;

  } catch (error) {
    // 详细记录错误信息
    console.error(`[Scraper] 保存 ${dataType} 数据失败:`, error);
    console.error(`[Scraper] 错误详情:`, {
      name: error.name,
      message: error.message,
      errors: error.errors, // Sequelize验证错误
      parent: error.parent, // 数据库错误
      original: error.original // 原始错误
    });

    // 构建详细的错误消息
    let errorMessage = error.message || '保存失败';

    // 如果是Sequelize验证错误，提取详细信息
    if (error.errors && Array.isArray(error.errors)) {
      const validationErrors = error.errors.map(err => {
        return `${err.path}: ${err.message}`;
      }).join('; ');
      errorMessage = `数据验证失败: ${validationErrors}`;
    }

    // 如果是数据库错误，提取详细信息
    if (error.parent) {
      const dbError = error.parent;
      if (dbError.code) {
        errorMessage += ` (数据库错误代码: ${dbError.code})`;
      }
      if (dbError.sqlMessage) {
        errorMessage += ` - ${dbError.sqlMessage}`;
      }
    }

    // 如果是原始错误，添加更多信息
    if (error.original && error.original.message) {
      errorMessage += ` - ${error.original.message}`;
    }

    // 创建一个新的错误对象，包含详细信息
    const detailedError = new Error(errorMessage);
    detailedError.originalError = error;
    detailedError.dataType = dataType;
    detailedError.data = data;
    
    throw detailedError;
  }
}

module.exports = {
  scrapeWeChatArticle
};
