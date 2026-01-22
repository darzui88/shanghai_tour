const express = require('express');
const router = express.Router();
const authenticateAdmin = require('../middleware/auth');
const { scrapeWeChatArticle } = require('../services/wechatScraper');

// 抓取微信公众号文章 - 需要管理员权限
router.post('/scrape-wechat', authenticateAdmin, async (req, res) => {
  try {
    const { url, dataType, fieldMappings } = req.body;

    // 验证输入
    if (!url || !dataType || !fieldMappings) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：url, dataType, fieldMappings'
      });
    }

    if (!url.includes('mp.weixin.qq.com')) {
      return res.status(400).json({
        success: false,
        message: '无效的微信公众号文章URL'
      });
    }

    const validDataTypes = ['location', 'product', 'event', 'guide'];
    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        success: false,
        message: '无效的数据类型。支持的类型：location, product, event, guide'
      });
    }

    // 执行抓取
    console.log(`[Scraper] 开始抓取文章: ${url}, 数据类型: ${dataType}`);
    const result = await scrapeWeChatArticle(url, dataType, fieldMappings);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('[Scraper] 抓取错误:', error);
    console.error('[Scraper] 错误堆栈:', error.stack);
    
    // 构建详细的错误响应
    const response = {
      success: false,
      message: error.message || '抓取失败',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    // 如果有原始错误，添加详细信息
    if (error.originalError) {
      const originalError = error.originalError;
      
      // Sequelize验证错误
      if (originalError.errors && Array.isArray(originalError.errors)) {
        response.validationErrors = originalError.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        response.message = `数据验证失败: ${originalError.errors.map(e => `${e.path}: ${e.message}`).join('; ')}`;
      }
      
      // 数据库错误
      if (originalError.parent) {
        const dbError = originalError.parent;
        response.databaseError = {
          code: dbError.code,
          sqlMessage: dbError.sqlMessage,
          sqlState: dbError.sqlState
        };
      }
    }
    
    // 如果有调试信息，添加到响应中
    if (error.debugInfo) {
      response.debugInfo = error.debugInfo;
    }
    
    // 在开发环境中，添加更多调试信息
    if (process.env.NODE_ENV === 'development') {
      response.errorDetails = {
        name: error.name,
        stack: error.stack,
        originalError: error.originalError ? {
          name: error.originalError.name,
          message: error.originalError.message,
          errors: error.originalError.errors
        } : undefined
      };
    }
    
    res.status(500).json(response);
  }
});

module.exports = router;
