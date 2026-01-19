# 安装和运行指南

## ⚠️ 前置要求

在运行应用之前，您需要安装以下软件：

### 1. Node.js（必需）

**下载和安装**：
1. 访问 https://nodejs.org/
2. 下载 LTS 版本（推荐）
3. 运行安装程序，按照提示安装
4. **重要**：安装时确保勾选 "Add to PATH" 选项

**验证安装**：
打开新的命令提示符或 PowerShell，运行：
```bash
node --version
npm --version
```

应该显示版本号，例如：
```
v18.17.0
9.6.7
```

### 2. MySQL（必需）

**下载和安装**：
1. 访问 https://dev.mysql.com/downloads/mysql/
2. 下载 MySQL Community Server
3. 运行安装程序
4. 记住设置的 root 密码（稍后需要用到）

**验证安装**：
```bash
mysql --version
```

## 📋 运行步骤

### 步骤 1: 创建数据库

打开 MySQL 命令行或使用 MySQL Workbench，执行：

```sql
CREATE DATABASE shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

或者运行我们提供的脚本：
```
双击运行: setup-db.bat
```

### 步骤 2: 配置环境变量

在项目根目录创建 `.env` 文件（如果没有），内容如下：

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shanghai_tour
DB_USER=root
DB_PASSWORD=你的MySQL密码
JWT_SECRET=shanghai-tour-guide-secret-key
NODE_ENV=development
```

**重要**：将 `DB_PASSWORD` 替换为您的 MySQL root 密码。

### 步骤 3: 安装依赖

打开命令提示符或 PowerShell，进入项目目录：

```bash
cd D:\document\work\tour

# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 步骤 4: 初始化数据库

运行种子数据脚本（创建表并插入示例数据）：

```bash
npm run seed
```

如果成功，您会看到类似输出：
```
✅ Connected to MySQL database
✅ Database models synchronized
✅ Inserted 5 products
✅ Inserted 3 locations
✅ Seed data loaded successfully!
```

### 步骤 5: 启动应用

**方式一：同时启动前后端（推荐）**

```bash
npm run dev
```

**方式二：分别启动**

打开两个终端窗口：

**终端 1 - 后端**：
```bash
npm run server
```

**终端 2 - 前端**：
```bash
npm run client
```

### 步骤 6: 访问应用

在浏览器中打开：http://localhost:5173

后端 API 地址：http://localhost:5000/api

## 🚀 快速启动（使用批处理脚本）

如果您已经安装了 Node.js 和 MySQL，可以直接：

1. **首次运行**：
   - 双击 `setup-db.bat` 创建数据库
   - 编辑 `.env` 文件，设置 MySQL 密码
   - 双击 `start.bat` 启动应用

2. **后续运行**：
   - 直接双击 `start.bat` 即可

## ❓ 常见问题

### Q1: 提示 "node 不是内部或外部命令"

**解决方案**：
- 确保已安装 Node.js
- 重新打开命令提示符/PowerShell
- 如果仍然不行，重新安装 Node.js，确保勾选 "Add to PATH"

### Q2: npm 安装依赖很慢或失败

**解决方案**：
- 使用国内镜像（淘宝镜像）：
  ```bash
  npm config set registry https://registry.npmmirror.com
  ```
- 或者使用 cnpm：
  ```bash
  npm install -g cnpm --registry=https://registry.npmmirror.com
  cnpm install
  ```

### Q3: MySQL 连接失败

**解决方案**：
- 检查 MySQL 服务是否运行（Windows 服务管理器）
- 确认 `.env` 文件中的密码正确
- 确认数据库 `shanghai_tour` 已创建
- 检查防火墙设置

### Q4: 端口被占用

**解决方案**：
- 后端端口（默认 5000）：修改 `.env` 中的 `PORT=5000`
- 前端端口（默认 5173）：修改 `client/vite.config.js` 中的端口配置

### Q5: 数据库表不存在

**解决方案**：
重新运行种子脚本：
```bash
npm run seed
```

## 📁 项目文件说明

- `start.bat` - 一键启动脚本（Windows）
- `setup-db.bat` - 数据库设置脚本（Windows）
- `.env` - 环境配置文件（需要您创建）
- `RUN.md` - 详细运行文档
- `INSTALL_AND_RUN.md` - 本文档

## 🎯 下一步

应用运行后，您可以：

1. 浏览商品：http://localhost:5173/products
2. 查看购物地点：http://localhost:5173/locations
3. 查看活动：http://localhost:5173/events
4. 测试 API：http://localhost:5000/api/health

## 💡 提示

- 首次运行建议使用 `npm run dev` 查看详细日志
- 如果遇到问题，检查终端输出的错误信息
- 确保 MySQL 服务在运行
- 开发环境建议使用 `nodemon`（已包含），代码修改会自动重启服务器
