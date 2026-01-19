// 反爬虫中间件
// 包含：User-Agent检测、Rate Limiting、请求头验证、指纹验证等

// 内存存储用于rate limiting（生产环境建议使用Redis）
const requestCounts = new Map();
const blockedIPs = new Set();

// 常见爬虫User-Agent列表
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
  'python-requests', 'scrapy', 'beautifulsoup', 'selenium',
  'headless', 'phantomjs', 'puppeteer', 'playwright',
  'googlebot', 'bingbot', 'yahoo', 'baiduspider',
  'facebookexternalhit', 'twitterbot', 'linkedinbot'
];

// 可疑请求头特征
const SUSPICIOUS_HEADERS = {
  missingAccept: true, // 缺少Accept头
  missingAcceptLanguage: true, // 缺少Accept-Language头
  missingAcceptEncoding: true, // 缺少Accept-Encoding头
  missingReferer: false // 可以没有Referer
};

// 清理过期的请求记录（每小时清理一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now - value.firstRequest > 3600000) { // 1小时
      requestCounts.delete(key);
    }
  }
}, 3600000);

/**
 * Rate Limiting 中间件
 * @param {Object} options - 配置选项
 * @param {number} options.windowMs - 时间窗口（毫秒），默认15分钟
 * @param {number} options.maxRequests - 时间窗口内最大请求数，默认100
 * @param {boolean} options.skipSuccessfulRequests - 是否跳过成功请求的计数
 */
const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    maxRequests = 100,
    skipSuccessfulRequests = false
  } = options;

  return (req, res, next) => {
    // 获取客户端IP
    const clientIp = req.ip || 
                     req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     'unknown';

    // 检查是否在黑名单中
    if (blockedIPs.has(clientIp)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP has been temporarily blocked due to suspicious activity'
      });
    }

    const now = Date.now();
    const key = `${clientIp}:${req.path}`;
    let requestData = requestCounts.get(key);

    // 初始化或重置过期记录
    if (!requestData || now - requestData.firstRequest > windowMs) {
      requestData = {
        count: 0,
        firstRequest: now
      };
      requestCounts.set(key, requestData);
    }

    // 增加计数
    requestData.count++;

    // 设置Rate Limit响应头
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - requestData.count),
      'X-RateLimit-Reset': new Date(requestData.firstRequest + windowMs).toISOString()
    });

    // 检查是否超过限制
    if (requestData.count > maxRequests) {
      // 如果超过限制次数过多，加入黑名单
      if (requestData.count > maxRequests * 2) {
        blockedIPs.add(clientIp);
        // 24小时后自动解除黑名单
        setTimeout(() => {
          blockedIPs.delete(clientIp);
        }, 24 * 60 * 60 * 1000);
      }

      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - requestData.firstRequest)) / 1000)
      });
    }

    // 继续处理请求
    next();

    // 如果是成功请求且配置跳过，减少计数
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          requestData.count = Math.max(0, requestData.count - 1);
        }
      });
    }
  };
};

/**
 * User-Agent检测中间件
 */
const userAgentChecker = (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  // 检查是否包含爬虫关键词
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));

  // 如果没有User-Agent，视为可疑
  if (!userAgent || userAgent === '') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Invalid request headers'
    });
  }

  // 检测到爬虫
  if (isBot) {
    // 允许一些合法的搜索引擎爬虫（可选）
    const allowedBots = ['googlebot', 'bingbot', 'baiduspider'];
    const isAllowedBot = allowedBots.some(bot => userAgent.includes(bot));

    if (!isAllowedBot) {
      console.warn(`Blocked bot request from ${req.ip}: ${userAgent}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Automated requests are not allowed'
      });
    }
  }

  next();
};

/**
 * 请求头验证中间件
 */
const headerValidator = (req, res, next) => {
  const headers = req.headers;

  // 检查必要的请求头
  if (SUSPICIOUS_HEADERS.missingAccept && !headers.accept) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Missing required headers'
    });
  }

  if (SUSPICIOUS_HEADERS.missingAcceptLanguage && !headers['accept-language']) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Missing required headers'
    });
  }

  // 检查是否有明显的自动化工具特征
  if (headers['sec-fetch-mode'] && headers['sec-fetch-mode'] !== 'cors' && headers['sec-fetch-mode'] !== 'navigate') {
    // 这是正常的浏览器行为，允许通过
  }

  next();
};

/**
 * 客户端指纹验证（可选，需要前端配合）
 * 检查请求中是否包含有效的客户端指纹token
 */
const fingerprintValidator = (req, res, next) => {
  // 从请求头获取指纹token
  const fingerprintToken = req.headers['x-client-fingerprint'];

  // 如果启用了指纹验证但请求中没有token，返回错误
  // 注意：这个验证是可选的，可以根据需要启用
  if (process.env.ENABLE_FINGERPRINT_CHECK === 'true' && !fingerprintToken) {
    // 对于GET请求，可以先返回一个token要求
    if (req.method === 'GET') {
      // 生成临时token
      const crypto = require('crypto');
      const token = crypto.randomBytes(16).toString('hex');
      
      // 可以将token存储在session或返回给客户端
      // 这里简化处理，允许首次请求通过
      return next();
    }

    return res.status(403).json({
      error: 'Access denied',
      message: 'Client fingerprint validation required'
    });
  }

  next();
};

/**
 * 综合反爬虫中间件（推荐使用）
 * 包含所有检测功能
 */
const antiScraping = (options = {}) => {
  const {
    enableRateLimit = true,
    enableUserAgentCheck = true,
    enableHeaderValidation = true,
    enableFingerprintCheck = false,
    rateLimitOptions = {}
  } = options;

  return [
    enableRateLimit && rateLimiter(rateLimitOptions),
    enableUserAgentCheck && userAgentChecker,
    enableHeaderValidation && headerValidator,
    enableFingerprintCheck && fingerprintValidator
  ].filter(Boolean);
};

// 导出单个中间件和组合中间件
module.exports = {
  rateLimiter,
  userAgentChecker,
  headerValidator,
  fingerprintValidator,
  antiScraping,
  // 导出工具函数
  clearRateLimit: (ip) => {
    for (const key of requestCounts.keys()) {
      if (key.startsWith(ip)) {
        requestCounts.delete(key);
      }
    }
  },
  unblockIP: (ip) => {
    blockedIPs.delete(ip);
  },
  getBlockedIPs: () => Array.from(blockedIPs)
};
