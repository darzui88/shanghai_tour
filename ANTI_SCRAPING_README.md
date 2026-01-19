# 反爬虫机制说明

本项目已实现多层次的反爬虫保护机制，包括后端中间件和前端辅助工具。

## 功能特性

### 后端反爬虫中间件 (`server/middleware/antiScraping.js`)

1. **Rate Limiting（请求频率限制）**
   - 默认：15分钟内最多100个请求
   - 超过限制会返回429状态码
   - 严重超限的IP会被加入黑名单（24小时）

2. **User-Agent检测**
   - 检测常见的爬虫User-Agent
   - 自动阻止明显的自动化工具
   - 允许合法的搜索引擎爬虫（Google、Bing、百度）

3. **请求头验证**
   - 检查必要的请求头（Accept、Accept-Language等）
   - 缺少关键头的请求会被拒绝

4. **客户端指纹验证（可选）**
   - 支持客户端指纹token验证
   - 需要在环境变量中启用

### 前端反爬虫工具 (`client/src/utils/antiScraping.js`)

1. **客户端指纹生成**
   - 基于浏览器特征生成唯一标识
   - 包含：User-Agent、语言、屏幕分辨率、Canvas指纹等

2. **JavaScript挑战**
   - 验证请求来自真实浏览器环境
   - 检查必要的浏览器API是否存在

3. **请求头自动添加**
   - 自动为所有API请求添加反爬虫头
   - 包含指纹信息和时间戳

## 配置说明

### 后端配置

在 `server/index.js` 中，反爬虫中间件已应用到以下路由：
- `/api/products`
- `/api/locations`
- `/api/events`

**调整配置：**

```javascript
app.use('/api/products', ...antiScraping({ 
  enableRateLimit: true,        // 是否启用频率限制
  enableUserAgentCheck: true,   // 是否检测User-Agent
  enableHeaderValidation: true, // 是否验证请求头
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000,   // 时间窗口（毫秒）
    maxRequests: 100             // 最大请求数
  }
}));
```

### 环境变量（可选）

在 `.env` 文件中可以添加：

```env
# 启用指纹验证（默认关闭）
ENABLE_FINGERPRINT_CHECK=false
```

## 使用说明

### 正常使用

对于正常用户，反爬虫机制是透明的，无需额外操作。前端会自动添加必要的请求头。

### 调试和测试

如果需要在开发环境中临时禁用某些检查：

```javascript
// 临时禁用User-Agent检测
app.use('/api/products', ...antiScraping({ 
  enableUserAgentCheck: false
}));
```

### 管理黑名单

```javascript
const { unblockIP, getBlockedIPs, clearRateLimit } = require('./middleware/antiScraping');

// 查看被阻止的IP
console.log(getBlockedIPs());

// 解除IP阻止
unblockIP('192.168.1.100');

// 清除某个IP的频率限制记录
clearRateLimit('192.168.1.100');
```

## 响应头说明

API响应会包含以下Rate Limit相关头：

- `X-RateLimit-Limit`: 限制的最大请求数
- `X-RateLimit-Remaining`: 剩余可请求次数
- `X-RateLimit-Reset`: 限制重置时间

## 错误响应

- **403 Forbidden**: User-Agent被识别为爬虫或请求头验证失败
- **429 Too Many Requests**: 超过请求频率限制
- **400 Bad Request**: 缺少必要的请求头

## 注意事项

1. **Rate Limiting使用内存存储**
   - 当前实现使用内存存储，服务器重启后会重置
   - 生产环境建议使用Redis等持久化存储

2. **IP检测**
   - 如果应用部署在反向代理（如Nginx）后，需要确保正确配置`trust proxy`
   - 在Express中添加：`app.set('trust proxy', true)`

3. **性能影响**
   - 反爬虫检查会有轻微的性能开销
   - 可以通过调整检查项和频率来平衡安全性和性能

4. **合法爬虫**
   - 默认允许Google、Bing、百度等搜索引擎爬虫
   - 如需允许其他爬虫，修改`BOT_USER_AGENTS`数组

## 生产环境建议

1. **使用Redis存储Rate Limit数据**
   ```javascript
   // 需要安装 redis 和 express-rate-limit
   const RedisStore = require('rate-limit-redis');
   // 替换内存存储为Redis存储
   ```

2. **添加日志记录**
   - 记录被阻止的请求
   - 分析攻击模式

3. **使用专业反爬虫服务**
   - Cloudflare
   - AWS WAF
   - 其他DDoS防护服务

4. **监控和告警**
   - 监控被阻止的请求数量
   - 设置异常流量告警
