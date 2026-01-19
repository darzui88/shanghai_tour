const puppeteer = require('puppeteer');
const Location = require('../models/Location');
const { Op } = require('sequelize');

class LocationScraper {
  constructor() {
    this.baseUrl = 'https://mp.weixin.qq.com';
  }

  // 抓取特定公众号文章中的地点信息
  async scrapeLocationsFromWeChatArticle(articleUrl) {
    let browser;
    try {
      console.log('🚀 开始抓取公众号文章中的地点信息:', articleUrl);
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
      await page.waitForTimeout(10000); // 增加等待时间，让页面完全加载
      
      // 尝试等待关键元素
      try {
        await page.waitForSelector('#js_content, .rich_media_content, article', { timeout: 15000 });
      } catch (e) {
        console.log('⚠️ 未找到标准内容选择器，继续尝试...');
      }

      // 提取文章中的所有地点
      const locations = await this.extractLocationsFromPage(page, articleUrl);
      
      console.log(`✅ 从文章中提取到 ${locations.length} 个地点`);

      // 处理和保存地点
      let newLocations = 0;
      let updatedLocations = 0;

      for (const locationData of locations) {
        try {
          const processedLocation = this.processLocationData(locationData);
          
          // 检查是否已存在（通过名称和地址匹配）
          const normalizedName = processedLocation.name.trim().toLowerCase();
          const normalizedAddress = processedLocation.address.trim().toLowerCase();
          
          const existingLocation = await Location.findOne({
            where: {
              [Op.or]: [
                {
                  name: { [Op.like]: `%${processedLocation.name}%` },
                  address: { [Op.like]: `%${processedLocation.address}%` }
                }
              ]
            }
          });

          if (existingLocation) {
            // 如果新地点的信息更完整，则更新
            const existingDescription = existingLocation.description || '';
            const newDescription = processedLocation.description || '';
            if (newDescription && !existingDescription) {
              await existingLocation.update(processedLocation);
              updatedLocations++;
              console.log(`🔄 更新地点（补充信息）: ${processedLocation.name}`);
            } else {
              console.log(`⏭️  地点已存在，跳过: ${processedLocation.name}`);
            }
          } else {
            await Location.create(processedLocation);
            newLocations++;
            console.log(`✅ 创建新地点: ${processedLocation.name}`);
          }
        } catch (error) {
          console.error(`❌ 处理地点失败:`, error.message);
        }
      }

      await browser.close();

      return {
        total: locations.length,
        newLocations,
        updatedLocations
      };
    } catch (error) {
      console.error('❌ 抓取失败:', error);
      if (browser) {
        await browser.close();
      }
      throw error;
    }
  }

  // 从页面中提取地点信息
  async extractLocationsFromPage(page, articleUrl) {
    try {
      const locations = await page.evaluate((url) => {
        const locationBlocks = [];

        // 查找所有可能的段落元素
        const contentSelectors = [
          '#js_content',
          '.rich_media_content',
          'article',
          '.article-content'
        ];

        let contentContainer = null;
        for (const selector of contentSelectors) {
          contentContainer = document.querySelector(selector);
          if (contentContainer) break;
        }

        if (!contentContainer) {
          return [];
        }

        // 获取所有段落和div元素
        const paragraphs = Array.from(contentContainer.querySelectorAll('p, div, section'));

        paragraphs.forEach((p) => {
          const pText = p.textContent.trim();
          if (!pText || pText.length < 3) return;

          // 查找包含 Address: 的行
          // 格式：Address: Building 8, No. 1107 Yuyuan Road Opening Hours: Monday-Friday, 08:00-22:00; Saturday-Sunday, 09:00-22:00
          const addressPattern = /Address:\s*([^\n\r]+?)(?:\s*Opening\s*Hours?:\s*|$)/i;
          const hasAddress = addressPattern.test(pText);

          // 只有当这一行包含地址信息时才处理
          if (hasAddress) {
            let locationData = {
              name: '', // 地点名称在图片上，这里留空
              address: '',
              district: '',
              openingHours: '',
              phone: '',
              images: [],
              description: ''
            };

            // 提取地址
            // 匹配格式：Address: Building 8, No. 1107 Yuyuan Road Opening Hours: ...
            // 或者：Address: Building 8, No. 1107 Yuyuan Road（没有Opening Hours）
            const addressMatch = pText.match(/Address:\s*([^\n\r]+?)(?:\s+Opening\s*Hours?:\s*|$)/i);
            if (addressMatch && addressMatch[1]) {
              let address = addressMatch[1].trim();
              // 清理地址（移除可能的额外字符）
              address = address.replace(/\s*\|\s*.*$/gi, '');
              address = address.replace(/\s*Opening\s*Hours?.*$/gi, ''); // 确保移除Opening Hours部分
              
              // 关键修复：移除地址后面混入的下一个地点名称和描述
              // 地址通常在 "District"、"Area"、"Town"、"New Area" 等词后结束
              // 如果这些词后面紧跟着没有空格的大写字母开头的词（如 DistrictAllen、AreaNew），
              // 说明下一个地点的名称被错误拼接进来了
              
              // 1. 查找 "District/Area/Town/New Area" + 无空格 + 大写字母开头词的模式
              const districtPattern = /(District|Area|Town|New Area)([A-Z][a-z]+(?:'[A-Z][a-z]+)?\s+[A-Z][a-z]+)/;
              const districtMatch = address.match(districtPattern);
              if (districtMatch && districtMatch.index !== undefined) {
                // 截断到District/Area/Town/New Area
                address = address.substring(0, districtMatch.index + districtMatch[1].length).trim();
              }
              
              // 2. 检查常见的下一个地点名称关键词（这些词不应该出现在地址中）
              const nextLocationKeywords = [
                'Church', 'Cathedral', 'Chapel', 'Memorial', 'Trinity', 'Holy', 'Our Lady',
                'St\\.', 'Saint', 'Russian Orthodox', 'Union Church', 'District Church',
                'Xujiahui Catholic', 'All Saints', 'Moore Memorial', 'Thames Town Cathedral',
                'Saint Nicholas', 'Sieh Yih Chapel', 'Hudong Church', 'Allen Memorial',
                'Jixianqiao Catholic', 'New Bund District Church'
              ];
              
              for (const keyword of nextLocationKeywords) {
                const keywordPattern = new RegExp(`(.+?)(?:District|Area|Town|New Area)\\s*${keyword}`, 'i');
                const keywordMatch = address.match(keywordPattern);
                if (keywordMatch && keywordMatch[1]) {
                  // 找到关键词，截断到District/Area/Town/New Area之前
                  const beforeKeyword = keywordMatch[1];
                  const districtEndMatch = beforeKeyword.match(/(.+?\s*(?:District|Area|Town|New Area))$/i);
                  if (districtEndMatch) {
                    address = districtEndMatch[1].trim();
                    break;
                  }
                }
              }
              
              // 3. 移除末尾的括号内容如果包含非地址信息
              address = address.replace(/\([^)]*(?:open|viewing|reservation|required|exterior)[^)]*\)/gi, '').trim();
              
              address = address.trim();
              
              if (address && address.length > 5) {
                locationData.address = address;
                
                // 尝试从地址中提取区名
                const districts = ['黄浦', 'Huangpu', '徐汇', 'Xuhui', '长宁', 'Changning', 
                                  '静安', 'Jing\'an', '普陀', 'Putuo', '虹口', 'Hongkou', 
                                  '杨浦', 'Yangpu', '浦东', 'Pudong', '闵行', 'Minhang',
                                  '宝山', 'Baoshan', '嘉定', 'Jiading', '金山', 'Jinshan',
                                  '松江', 'Songjiang', '青浦', 'Qingpu', '奉贤', 'Fengxian',
                                  '崇明', 'Chongming'];
                for (const district of districts) {
                  if (address.includes(district)) {
                    locationData.district = district;
                    break;
                  }
                }
              }
            }

            // 提取营业时间（在同一行中）
            // 匹配格式：Opening Hours: Monday-Friday, 08:00-22:00; Saturday-Sunday, 09:00-22:00
            const hoursPattern = /Opening\s*Hours?:\s*([^\n\r]+?)(?:\s*Phone:|$)/i;
            const hoursMatch = pText.match(hoursPattern);
            if (hoursMatch && hoursMatch[1]) {
              let hours = hoursMatch[1].trim();
              // 确保没有包含Address部分
              if (hours.includes('Address:')) {
                hours = hours.split('Address:')[0].trim();
              }
              if (hours && hours.length > 5) {
                locationData.openingHours = hours;
              }
            }

            // 提取电话（如果有）
            const phoneMatch = pText.match(/Phone:\s*([^\n\r]+?)(?:\s*$)/i);
            if (phoneMatch && phoneMatch[1]) {
              locationData.phone = phoneMatch[1].trim();
            }

            // 查找相关的图片（在前面的元素中）
            // 查找当前段落之前的图片
            let prevElement = p.previousElementSibling;
            let imageCount = 0;
            while (prevElement && imageCount < 3) {
              const img = prevElement.querySelector('img') || (prevElement.tagName === 'IMG' ? prevElement : null);
              if (img && img.src) {
                const imgSrc = img.src;
                if (imgSrc && !imgSrc.includes('data:image') && imgSrc.length > 20) {
                  locationData.images.push(imgSrc);
                  imageCount++;
                }
              }
              prevElement = prevElement.previousElementSibling;
            }

            // 查找相关的描述（在前面的段落中）
            // 尝试从上一个段落获取描述
            let prevElem = p.previousElementSibling;
            let foundDesc = false;
            while (prevElem && !foundDesc) {
              const prevText = prevElem.textContent.trim();
              if (prevText && prevText.length > 20 && 
                  !prevText.match(/Address:|Opening\s*Hours?:|Phone:/i) &&
                  prevText.length < 500) {
                locationData.description = prevText.substring(0, 500);
                foundDesc = true;
              }
              prevElem = prevElem.previousElementSibling;
              // 最多往前查找3个元素
              if (!prevElem || imageCount >= 3) break;
            }

            // 如果地址不为空，则保存这个地点
            if (locationData.address && locationData.address.length > 5) {
              // 生成一个临时名称（基于地址的第一部分）
              const addressParts = locationData.address.split(',');
              locationData.name = addressParts.length > 0 ? addressParts[0].trim() : locationData.address.substring(0, 50).trim();
              
              locationBlocks.push({
                ...locationData,
                url: url
              });
            }
          }
        });

        // 去重：使用地址去重
        const validLocations = [];
        const seenAddresses = new Set();
        
        for (const loc of locationBlocks) {
          const normalizedAddress = loc.address ? loc.address.trim().toLowerCase() : '';
          
          if (normalizedAddress && !seenAddresses.has(normalizedAddress)) {
            seenAddresses.add(normalizedAddress);
            validLocations.push(loc);
          }
        }

        return validLocations;
      }, articleUrl);

      return locations;
    } catch (error) {
      console.error('提取地点信息失败:', error);
      return [];
    }
  }

  // 处理地点数据，转换为数据库格式
  processLocationData(locationData) {
    // 地址必须有
    const address = locationData.address || 'TBA';
    
    // 如果没有区，尝试从地址中提取，或使用默认值
    let district = locationData.district || 'Shanghai';
    if (!district || district === '') {
      // 尝试从地址中提取区名
      const districts = ['黄浦', 'Huangpu', '徐汇', 'Xuhui', '长宁', 'Changning', 
                        '静安', 'Jing\'an', '普陀', 'Putuo', '虹口', 'Hongkou', 
                        '杨浦', 'Yangpu', '浦东', 'Pudong', '闵行', 'Minhang',
                        '宝山', 'Baoshan', '嘉定', 'Jiading', '金山', 'Jinshan',
                        '松江', 'Songjiang', '青浦', 'Qingpu', '奉贤', 'Fengxian',
                        '崇明', 'Chongming'];
      for (const d of districts) {
        if (address.includes(d)) {
          district = d;
          break;
        }
      }
      if (!district || district === '') {
        district = 'Shanghai'; // 默认值
      }
    }

    // 处理营业时间（如果有）
    // 将文本格式转换为按天分别的格式，例如：
    // "Monday-Friday, 08:00-22:00; Saturday-Sunday, 09:00-22:00" 
    // 转换为: { monday: "08:00 - 22:00", tuesday: "08:00 - 22:00", ... }
    let openingHoursObj = null;
    if (locationData.openingHours && locationData.openingHours.trim()) {
      openingHoursObj = this.parseOpeningHours(locationData.openingHours.trim());
    }

    // 生成地点名称（基于地址的第一部分，如果没有提供名称）
    // 名称在图片上，这里使用地址的第一部分作为临时名称
    let name = locationData.name;
    if (!name || name.trim() === '' || name === 'Location') {
      // 从地址中提取一个合理的名称
      // 例如：Building 8, No. 1107 Yuyuan Road -> Building 8
      const addressParts = address.split(',');
      if (addressParts.length > 0) {
        name = addressParts[0].trim();
        // 如果第一部分包含Building, Room等，保留；否则使用地址的前30个字符
        if (!name.match(/Building|Room|No\.|Floor/i) && address.length > 30) {
          name = address.substring(0, 30).trim();
        }
      } else {
        name = address.substring(0, 50).trim() || 'Location';
      }
    }

    // 确保有描述
    const description = locationData.description || 
                       `A location at ${address}.` ||
                       'No description available.';

    return {
      name: name.substring(0, 255), // 确保不超过255字符
      nameCN: locationData.nameCN || null,
      address: address,
      addressCN: locationData.addressCN || null,
      city: 'Shanghai', // 所有地点都在上海
      district: district,
      description: description,
      descriptionCN: locationData.descriptionCN || null,
      categories: ['shopping', 'tourism'], // 默认分类
      images: locationData.images ? locationData.images.slice(0, 5) : [],
      coverImage: locationData.images && locationData.images[0] ? locationData.images[0] : null,
      rating: 0,
      transport: null,
      tips: [],
      products: [],
      openingHours: openingHoursObj,
      phone: locationData.phone || null,
      website: locationData.website || null,
      coordinates: null
    };
  }

  // 解析营业时间文本为按天分别的格式
  parseOpeningHours(hoursText) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const result = {};

    // 将时间格式统一，例如 "08:00-22:00" 转换为 "08:00 - 22:00"
    const normalizeTime = (time) => {
      return time.replace(/(\d{1,2}:\d{2})\s*-?\s*(\d{1,2}:\d{2})/, '$1 - $2');
    };

    // 解析文本格式
    // 支持格式：
    // 1. "Monday-Friday, 08:00-22:00; Saturday-Sunday, 09:00-22:00"
    // 2. "Monday-Sunday, 08:00-20:00"
    // 3. "Monday-Thursday, 08:30-18:00; Friday-Sunday, 09:00-19:00"
    
    const parts = hoursText.split(';').map(p => p.trim());
    
    for (const part of parts) {
      // 匹配格式: "Monday-Friday, 08:00-22:00" 或 "Monday, 08:00-22:00"
      const rangeMatch = part.match(/([A-Za-z]+)(?:-([A-Za-z]+))?,\s*([\d:-\s]+)/);
      if (rangeMatch) {
        const startDay = rangeMatch[1].toLowerCase();
        const endDay = rangeMatch[2] ? rangeMatch[2].toLowerCase() : startDay;
        const timeRange = normalizeTime(rangeMatch[3].trim());

        // 找到开始和结束的索引
        const startIndex = days.findIndex(d => d.startsWith(startDay));
        const endIndex = endDay ? days.findIndex(d => d.startsWith(endDay)) : startIndex;

        if (startIndex !== -1 && endIndex !== -1) {
          // 填充从startIndex到endIndex的所有天
          for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
            result[days[i]] = timeRange;
          }
        }
      } else {
        // 如果无法解析，尝试匹配单个时间范围（假设所有天相同）
        const timeMatch = part.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
        if (timeMatch) {
          const timeRange = normalizeTime(timeMatch[1]);
          // 如果没有指定日期，假设所有天相同
          if (Object.keys(result).length === 0) {
            days.forEach(day => {
              result[day] = timeRange;
            });
          }
        }
      }
    }

    // 如果解析失败，返回note格式作为fallback
    if (Object.keys(result).length === 0) {
      return { note: hoursText };
    }

    return result;
  }
}

module.exports = new LocationScraper();
