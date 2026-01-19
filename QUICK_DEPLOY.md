# 🚀 快速部署指南 - 5分钟上线

## 🎯 最快方法：Railway（推荐，最简单）

Railway 可以自动部署全栈应用，无需复杂配置。

### 步骤 1：注册 Railway
1. 访问：https://railway.app/
2. 点击 "Start a New Project"
3. 选择 "Login with GitHub"（使用你的 GitHub 账号登录）

### 步骤 2：从 GitHub 导入项目
1. 选择 "Deploy from GitHub repo"
2. 授权 Railway 访问你的 GitHub
3. 选择 `shanghai_tour` 仓库
4. Railway 会自动检测项目类型

### 步骤 3：配置环境变量
在 Railway 项目设置中添加：
```
PORT=5000
NODE_ENV=production
DB_HOST=你的数据库地址
DB_PORT=3306
DB_NAME=shanghai_tour
DB_USER=数据库用户名
DB_PASSWORD=数据库密码
JWT_SECRET=你的密钥（随机字符串）
```

### 步骤 4：添加 MySQL 数据库
1. 在 Railway 项目中点击 "New"
2. 选择 "Database" → "MySQL"
3. Railway 会自动创建数据库
4. 在环境变量中使用数据库连接信息

### 步骤 5：部署
Railway 会自动部署！等待几分钟后，你会得到一个 URL，例如：
```
https://shanghai-tour-production.up.railway.app
```

**完成！** 🎉 你的应用已经上线了！

---

## 🚀 方法二：Vercel（前端）+ Railway/Render（后端）

### 前端部署到 Vercel（1分钟）

1. **访问 Vercel**：https://vercel.com/
2. **登录**：使用 GitHub 账号
3. **导入项目**：
   - 点击 "Add New" → "Project"
   - 选择 `shanghai_tour` 仓库
   - **重要**：Root Directory 选择 `client`
   - Framework Preset：选择 "Vite"
4. **环境变量**：
   ```
   VITE_API_URL=https://你的后端地址
   ```
5. **部署**：点击 "Deploy"

### 后端部署到 Railway

按照上面的 Railway 步骤部署后端即可。

---

## 🚀 方法三：Render（全栈部署）

1. **访问 Render**：https://render.com/
2. **注册/登录**：使用 GitHub 账号
3. **创建 Web Service**：
   - 点击 "New" → "Web Service"
   - 连接你的 GitHub 仓库
   - 设置：
     - Name: `shanghai-tour`
     - Region: 选择离用户最近的区域
     - Branch: `main`
     - Root Directory: `.` (根目录)
     - Build Command: `npm install && cd client && npm install && npm run build && cd ..`
     - Start Command: `npm start`
4. **环境变量**：添加所有需要的环境变量
5. **添加数据库**：
   - "New" → "PostgreSQL" 或使用外部 MySQL
6. **部署**：点击 "Create Web Service"

---

## 📋 部署前准备清单

### 1. 确保代码已提交到 GitHub
```bash
git status  # 检查是否有未提交的更改
git push    # 确保代码已推送到 GitHub
```

### 2. 更新前端 API 地址

在 `client/src/services/api.js` 中，检查 API 地址：
```javascript
// 开发环境
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 部署时需要设置环境变量 VITE_API_URL 为生产环境的后端地址
```

### 3. 构建前端（如果部署到 Vercel，会自动构建）
```bash
cd client
npm run build
cd ..
```

### 4. 准备环境变量
创建 `.env.production` 文件（仅作参考，不要提交到 Git）：
```env
PORT=5000
NODE_ENV=production
DB_HOST=数据库地址
DB_PORT=3306
DB_NAME=shanghai_tour
DB_USER=用户名
DB_PASSWORD=密码
JWT_SECRET=你的密钥
```

---

## 🎯 推荐部署架构

### 方案 A：全栈 Railway（最简单）⭐
```
[Railway]
├── Node.js 后端 (Express)
└── MySQL 数据库 (Railway 托管)
└── 前端静态文件 (Nginx)
```
**优点**：一键部署，无需配置
**成本**：$5/月起（免费试用额度）

### 方案 B：Vercel + Railway（推荐）⭐⭐⭐⭐⭐
```
[Vercel] - 前端 (React) - 全球 CDN
    ↓
[Railway] - 后端 (Express) + MySQL
```
**优点**：性能最佳，前端全球加速
**成本**：Vercel 免费 + Railway $5/月

### 方案 C：Render（全栈）⭐⭐⭐
```
[Render]
├── Web Service (Node.js)
└── PostgreSQL (可选)
```
**优点**：简单易用
**成本**：免费版可用（有限制）

---

## 🚀 一键部署脚本（Railway）

创建 `railway.json` 配置文件：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd client && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📝 生产环境配置

### 更新 server/index.js

确保服务器可以同时提供 API 和前端静态文件：

```javascript
// 在 server/index.js 最后添加
if (process.env.NODE_ENV === 'production') {
  // 提供前端静态文件
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // 所有非 API 请求返回前端页面
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

### 更新 package.json

确保有生产环境启动脚本：
```json
{
  "scripts": {
    "start": "node server/index.js"
  }
}
```

---

## 🆘 常见问题

### 问题 1：数据库连接失败
**解决**：检查环境变量中的数据库连接信息是否正确

### 问题 2：前端无法连接后端 API
**解决**：确保前端环境变量 `VITE_API_URL` 设置为后端地址

### 问题 3：CORS 错误
**解决**：在 `server/index.js` 中配置 CORS：
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://你的前端域名.vercel.app',
  credentials: true
}));
```

### 问题 4：端口问题
**解决**：Railway/Render 会自动设置 PORT 环境变量，使用：
```javascript
const PORT = process.env.PORT || 5000;
```

---

## 💰 成本对比

| 平台 | 前端 | 后端 | 数据库 | 总计/月 |
|------|------|------|--------|---------|
| **Railway 全栈** | 包含 | $5 | $5 | **$10** |
| **Vercel + Railway** | 免费 | $5 | $5 | **$10** |
| **Render 全栈** | 包含 | 免费* | 免费* | **$0-7** |

*免费版有资源限制，适合测试和小型应用

---

## ✅ 部署检查清单

部署前确认：
- [ ] 代码已提交到 GitHub
- [ ] `.env` 文件不在 Git 中（已在 `.gitignore`）
- [ ] 环境变量已准备好
- [ ] 前端 API 地址配置正确
- [ ] 数据库已创建或准备好连接信息
- [ ] CORS 配置正确

---

## 🎉 完成部署后

1. **测试应用**：访问提供的 URL
2. **设置自定义域名**（可选）：在平台设置中添加域名
3. **配置 HTTPS**：大多数平台自动提供
4. **监控和日志**：在平台控制台查看

---

## 📚 相关链接

- **Railway**: https://railway.app/
- **Vercel**: https://vercel.com/
- **Render**: https://render.com/
- **GitHub 仓库**: https://github.com/darzui88/shanghai_tour
