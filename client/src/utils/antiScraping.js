// 前端反爬虫辅助工具
// 生成客户端指纹、执行JavaScript挑战等

/**
 * 生成客户端指纹
 * 基于浏览器特征生成唯一标识
 */
export const generateFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 绘制一些文本和图形
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('Anti-scraping', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Anti-scraping', 4, 17);
  
  // 获取canvas指纹
  const canvasFingerprint = canvas.toDataURL();
  
  // 收集浏览器特征
  const features = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(',') || '',
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    timezoneOffset: new Date().getTimezoneOffset(),
    canvasFingerprint: canvasFingerprint.substring(0, 100) // 只取前100个字符作为标识
  };
  
  // 生成简单的hash
  const hash = btoa(JSON.stringify(features)).substring(0, 32);
  
  return {
    fingerprint: hash,
    timestamp: Date.now(),
    features
  };
};

/**
 * 执行JavaScript挑战
 * 确保请求来自真实浏览器环境
 */
export const executeJavaScriptChallenge = () => {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    return false;
  }
  
  // 检查必要的浏览器API
  const requiredAPIs = [
    'document',
    'navigator',
    'window',
    'localStorage',
    'sessionStorage'
  ];
  
  for (const api of requiredAPIs) {
    try {
      if (!(api in window)) {
        console.warn(`Missing required API: ${api}`);
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  
  // 执行一些计算来验证JavaScript执行能力
  try {
    const test = Math.random() * 1000;
    const result = Math.sin(test) + Math.cos(test);
    if (isNaN(result)) {
      return false;
    }
  } catch (e) {
    return false;
  }
  
  return true;
};

/**
 * 生成请求token
 * 包含时间戳和指纹信息
 */
export const generateRequestToken = () => {
  if (!executeJavaScriptChallenge()) {
    throw new Error('JavaScript challenge failed');
  }
  
  const fingerprint = generateFingerprint();
  const token = btoa(JSON.stringify({
    fp: fingerprint.fingerprint,
    ts: fingerprint.timestamp,
    nonce: Math.random().toString(36).substring(7)
  }));
  
  return {
    token,
    fingerprint: fingerprint.fingerprint,
    headers: {
      'X-Client-Fingerprint': fingerprint.fingerprint,
      'X-Request-Token': token,
      'X-Client-Timestamp': fingerprint.timestamp.toString()
    }
  };
};

/**
 * 为Axios请求添加反爬虫头
 * @param {Object} config - Axios请求配置
 */
export const addAntiScrapingHeaders = (config) => {
  try {
    const { headers } = generateRequestToken();
    
    // 合并到现有headers
    config.headers = {
      ...config.headers,
      ...headers,
      'X-Client-Platform': navigator.platform,
      'X-Client-User-Agent': navigator.userAgent.substring(0, 100) // 限制长度
    };
    
    return config;
  } catch (error) {
    console.warn('Failed to generate anti-scraping headers:', error);
    // 即使失败也继续请求，避免影响正常功能
    return config;
  }
};

/**
 * 延迟请求（模拟人类行为）
 * 在请求之间添加随机延迟
 */
export const addHumanDelay = async (minDelay = 100, maxDelay = 500) => {
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * 检查环境是否正常
 * 在应用启动时调用
 */
export const validateEnvironment = () => {
  const checks = {
    hasWindow: typeof window !== 'undefined',
    hasDocument: typeof document !== 'undefined',
    hasNavigator: typeof navigator !== 'undefined',
    hasLocalStorage: typeof localStorage !== 'undefined',
    canExecuteJS: executeJavaScriptChallenge()
  };
  
  const allPassed = Object.values(checks).every(check => check === true);
  
  if (!allPassed) {
    console.warn('Environment validation failed:', checks);
  }
  
  return {
    passed: allPassed,
    checks
  };
};

// 应用启动时执行环境验证
if (typeof window !== 'undefined') {
  validateEnvironment();
}
