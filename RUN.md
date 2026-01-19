# 运行应用指南

## 前置要求检查

在运行应用之前，请确保已安装以下软件：

### 1. Node.js (必需)
- **下载地址**: https://nodejs.org/
- **版本要求**: v16 或更高版本
- **验证安装**:
  ```bash
  node --version
  npm --version
  ```

### 2. MySQL (必需)
- **下载地址**: https://dev.mysql.com/downloads/mysql/
- **版本要求**: v5.7 或更高版本
- **验证安装**:
  ```bash
  mysql --version
  ```

## 快速开始

### 步骤 1: 创建 .env 文件

在项目根目录创建 `.env` 文件，内容如下：

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shanghai_tour
DB_USER=root
DB_PASSWORD=你的MySQL密码
JWT_SECRET=shanghai-tour-guide-secret-key-change-in-production
NODE_ENV=development
```

**重要**: 将 `DB_PASSWORD` 替换为你的 MySQL 密码。

### 步骤 2: 创建 MySQL 数据库

登录 MySQL 并创建数据库：

```bash
mysql -u root -p
```

然后执行：

```sql
CREATE DATABASE shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 步骤 3: 安装依赖

在项目根目录执行：

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 步骤 4: 初始化数据库

运行种子数据脚本（这会自动创建表并插入示例数据）：

```bash
npm run seed
```

如果成功，你会看到：
```
✅ Connected to MySQL database
✅ Database models synchronized
✅ Inserted X products
✅ Inserted X locations
✅ Seed data loaded successfully!
```

### 步骤 5: 启动应用

#### 方式一：同时启动前端和后端（推荐）

```bash
npm run dev
```

这会同时启动：
- 后端服务器: http://localhost:5000
- 前端开发服务器: http://localhost:5173

#### 方式二：分别启动

**终端 1 - 启动后端**:
```bash
npm run server
```

**终端 2 - 启动前端**:
```bash
npm run client
```

### 步骤 6: 访问应用

打开浏览器访问: http://localhost:5173

## 常见问题

### 问题 1: npm 命令未找到

**解决方案**:
- 确保已安装 Node.js
- 重启终端或命令行窗口
- 检查 PATH 环境变量是否包含 Node.js 路径

### 问题 2: MySQL 连接失败

**解决方案**:
- 检查 MySQL 服务是否运行
- 验证 `.env` 文件中的数据库配置
- 确保数据库 `shanghai_tour` 已创建
- 检查 MySQL 用户权限

### 问题 3: 端口已被占用

**解决方案**:
- 更改 `.env` 文件中的 `PORT` 值（后端）
- 或修改 `client/vite.config.js` 中的端口（前端）

### 问题 4: 数据库表不存在

**解决方案**:
```bash
# 重新运行种子数据脚本
npm run seed
```

### 问题 5: Puppeteer 安装失败（用于数据抓取）

**解决方案**:
```bash
# 强制重新安装
npm install puppeteer --force
```

## 其他有用命令

### 抓取活动数据
```bash
npm run scraper
```

### 生产构建
```bash
# 构建前端
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
tour/
├── server/          # 后端代码
│   ├── config/      # 数据库配置
│   ├── models/      # 数据模型
│   ├── routes/      # API 路由
│   └── scrapers/    # 数据抓取
├── client/          # 前端代码
│   └── src/         # React 源代码
└── package.json     # 项目依赖
```

## API 端点

后端 API 运行在: http://localhost:5000/api

- `GET /api/health` - 健康检查
- `GET /api/products` - 获取商品列表
- `GET /api/locations` - 获取地点列表
- `GET /api/events` - 获取活动列表
- `POST /api/orders` - 创建订单

## 需要帮助？

如果遇到问题，请检查：
1. Node.js 和 npm 是否正确安装
2. MySQL 服务是否运行
3. `.env` 文件配置是否正确
4. 数据库是否已创建
5. 所有依赖是否已安装
