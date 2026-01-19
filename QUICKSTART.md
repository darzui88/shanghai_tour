# 🚀 快速开始

## 5分钟快速启动指南

### ✅ 检查清单

在开始之前，请确认：

- [ ] 已安装 Node.js (v16+) → https://nodejs.org/
- [ ] 已安装 MySQL (v5.7+) → https://dev.mysql.com/downloads/
- [ ] MySQL 服务正在运行
- [ ] 知道 MySQL root 密码

---

## 第一步：安装 Node.js

如果还没有安装 Node.js：

1. 访问：https://nodejs.org/
2. 下载 **LTS 版本**
3. 运行安装程序
4. **重要**：安装时勾选 "Add to PATH"
5. 安装完成后，**重新打开命令提示符/PowerShell**

验证安装：
```bash
node --version
npm --version
```

---

## 第二步：创建数据库

**方法 A：使用脚本（推荐）**
```
双击运行: setup-db.bat
```

**方法 B：手动创建**
打开 MySQL 命令行或 MySQL Workbench，执行：
```sql
CREATE DATABASE shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 第三步：配置环境

1. 在项目根目录检查是否有 `.env` 文件
2. 如果没有，创建一个 `.env` 文件
3. 复制以下内容到 `.env`：

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

**⚠️ 重要**：将 `DB_PASSWORD` 替换为您的 MySQL root 密码！

---

## 第四步：安装依赖

在项目目录打开命令提示符/PowerShell，运行：

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

**💡 提示**：如果下载慢，可以使用淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

---

## 第五步：初始化数据库

```bash
npm run seed
```

这会创建表并插入示例数据。

---

## 第六步：启动应用

**选项 A：一键启动（推荐）**
```
双击运行: start.bat
```

**选项 B：命令行启动**
```bash
npm run dev
```

---

## 第七步：访问应用

在浏览器中打开：
- 🌐 前端应用：http://localhost:5173
- 🔌 API 端点：http://localhost:5000/api/health

---

## ✅ 完成！

如果一切顺利，您应该能看到：

1. 后端服务器运行在 http://localhost:5000
2. 前端开发服务器运行在 http://localhost:5173
3. 浏览器中显示应用首页

---

## 🆘 遇到问题？

### "node 不是内部或外部命令"
→ 重新安装 Node.js，确保勾选 "Add to PATH"，然后**重启命令行窗口**

### "MySQL 连接失败"
→ 检查 MySQL 服务是否运行，确认 `.env` 中的密码正确

### "端口被占用"
→ 修改 `.env` 中的 `PORT=5000` 为其他端口（如 `PORT=5001`）

### 其他问题
→ 查看 `INSTALL_AND_RUN.md` 获取详细帮助

---

## 📚 更多信息

- 详细安装指南：`INSTALL_AND_RUN.md`
- 运行说明：`RUN.md`
- 项目设置：`SETUP.md`
