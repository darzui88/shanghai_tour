const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 反爬虫中间件（应用到所有API路由）
const { antiScraping } = require('./middleware/antiScraping');
// 为公开API添加反爬虫保护
// 配置：15分钟内最多100个请求，检测User-Agent和请求头
app.use('/api/products', ...antiScraping({ 
  enableRateLimit: true,
  enableUserAgentCheck: true,
  enableHeaderValidation: true,
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100
  }
}));
app.use('/api/locations', ...antiScraping({ 
  enableRateLimit: true,
  enableUserAgentCheck: true,
  enableHeaderValidation: true,
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  }
}));
app.use('/api/events', ...antiScraping({ 
  enableRateLimit: true,
  enableUserAgentCheck: true,
  enableHeaderValidation: true,
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  }
}));
app.use('/api/guides', ...antiScraping({ 
  enableRateLimit: true,
  enableUserAgentCheck: true,
  enableHeaderValidation: true,
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  }
}));

// 静态文件服务：提供上传的图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/events', require('./routes/events'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/guides', require('./routes/guides'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Shanghai Tour Guide API is running' });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React app
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // All non-API routes should serve the React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Database connection and sync
async function initializeDatabase() {
  const connected = await testConnection();
  if (connected) {
    // Sync database models (create tables if they don't exist)
    const synced = await syncDatabase(false);
    if (!synced) {
      console.error('❌ Failed to sync database models');
    }
  }
}

// Initialize database on startup
initializeDatabase();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // 允许外部访问（局域网）

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.1.4:${PORT}`);
});
