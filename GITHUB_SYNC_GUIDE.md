# 📤 将项目同步到 GitHub 指南

## 前置准备

### 步骤 1：安装 Git

如果还没有安装 Git：

1. **下载 Git**
   - 访问：https://git-scm.com/download/win
   - 下载 Windows 版本并安装

2. **验证安装**
   ```powershell
   git --version
   ```
   应该显示类似：`git version 2.xx.x`

3. **配置 Git（首次使用需要）**
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

---

## 🚀 快速同步步骤

### 方法一：使用提供的脚本（推荐）

1. **双击运行** `sync-to-github.bat`
2. **按照提示操作**

---

### 方法二：手动同步

#### 步骤 1：检查是否已初始化 Git 仓库

在项目目录打开 PowerShell 或命令提示符：

```bash
cd D:\work\coding\tour
git status
```

**如果显示 "not a git repository"**，继续步骤 2。

**如果已初始化**，跳到步骤 5。

---

#### 步骤 2：初始化 Git 仓库

```bash
git init
```

---

#### 步骤 3：添加文件到 Git

```bash
# 添加所有文件（.gitignore 会自动排除 node_modules 等）
git add .

# 提交到本地仓库
git commit -m "Initial commit: Shanghai Tour Guide App"
```

---

#### 步骤 4：在 GitHub 上创建新仓库

1. **登录 GitHub**
   - 访问：https://github.com/
   - 登录你的账号

2. **创建新仓库**
   - 点击右上角的 `+` → `New repository`
   - 填写仓库信息：
     - **Repository name**: `shanghai-tour-guide`（或你喜欢的名字）
     - **Description**: `Shopping and tourism information app for foreigners in Shanghai`
     - **Visibility**: 
       - ✅ Public（公开，推荐用于学习项目）
       - ⚪ Private（私有，如果你不想公开代码）
     - **⚠️ 重要**：不要勾选 "Initialize this repository with a README"
   - 点击 `Create repository`

3. **复制仓库地址**
   - 创建后会显示类似：
   ```
   https://github.com/你的用户名/shanghai-tour-guide.git
   ```
   - 复制这个地址

---

#### 步骤 5：连接远程仓库并推送

```bash
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/shanghai-tour-guide.git

# 如果已经存在远程仓库，先删除再添加
# git remote remove origin
# git remote add origin https://github.com/你的用户名/shanghai-tour-guide.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

#### 步骤 6：验证

访问你的 GitHub 仓库地址，应该能看到所有文件了！

---

## 🔄 后续更新代码

每次修改代码后，使用以下命令同步：

```bash
# 1. 查看修改的文件
git status

# 2. 添加修改的文件
git add .

# 3. 提交修改（写上有意义的提交信息）
git commit -m "描述你的修改，例如：添加部署指南"

# 4. 推送到 GitHub
git push
```

---

## 🔐 身份验证问题

### 如果推送时要求输入用户名和密码：

**推荐方法：使用 Personal Access Token**

1. **创建 Token**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制 Token（只显示一次，请保存）

2. **使用 Token 推送**
   - 用户名：你的 GitHub 用户名
   - 密码：使用刚才生成的 Token（不是 GitHub 密码）

**或者使用 SSH（推荐长期使用）：**

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 按 Enter 使用默认路径
   # 可以设置密码或直接 Enter
   ```

2. **复制公钥**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # 复制输出的内容
   ```

3. **添加到 GitHub**
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - 粘贴公钥，保存

4. **修改远程仓库地址为 SSH**
   ```bash
   git remote set-url origin git@github.com:你的用户名/shanghai-tour-guide.git
   ```

---

## ⚠️ 注意事项

### 确保 .gitignore 正确配置

你的 `.gitignore` 应该包含：
```
node_modules/
.env
dist/
build/
*.log
.DS_Store
.vscode/
.idea/
coverage/
```

**不要提交的文件：**
- ✅ `node_modules/` - 依赖包（太大，部署时会重新安装）
- ✅ `.env` - 环境变量（包含敏感信息）
- ✅ `dist/` - 构建文件
- ✅ `*.log` - 日志文件
- ✅ 备份文件（如 `tour1.0.zip`）

### 建议添加到 .gitignore 的文件

检查以下文件是否需要忽略：
```bash
# 备份文件
*.zip
*.bak
dump-*.sql
```

---

## 🆘 常见问题

### 问题 1：推送被拒绝

**错误信息：** `error: failed to push some refs`

**解决方案：**
```bash
# 先拉取远程更改（如果有）
git pull origin main --allow-unrelated-histories

# 解决冲突后，再推送
git push
```

### 问题 2：文件太大无法推送

**错误信息：** `remote: error: File xxx is too large`

**解决方案：**
- GitHub 限制单个文件 100MB
- 如果 `tour1.0.zip` 等大文件已经被提交：
  ```bash
  # 从 Git 历史中删除大文件
  git rm --cached tour1.0.zip
  git commit -m "Remove large backup file"
  git push
  ```

### 问题 3：需要忽略的文件被提交了

**解决方案：**
```bash
# 从 Git 中删除但保留本地文件
git rm --cached -r node_modules/
git rm --cached .env

# 更新 .gitignore（如果还没有）
# 然后提交
git commit -m "Remove ignored files"
git push
```

---

## ✅ 检查清单

同步前确认：

- [ ] Git 已安装并配置
- [ ] GitHub 账号已创建
- [ ] `.gitignore` 已正确配置
- [ ] 大文件和敏感文件已排除
- [ ] 代码已测试无误
- [ ] README.md 已更新（可选但推荐）

---

## 📝 创建仓库后的建议

1. **添加 README.md**（如果还没有）
   - 描述项目功能
   - 添加安装说明
   - 添加截图或演示链接

2. **添加 LICENSE**
   - 选择合适的开源许可证（如 MIT）

3. **设置 Topics**
   - 在仓库页面点击 ⚙️ → Topics
   - 添加：`nodejs` `react` `express` `tourism` `shanghai`

4. **创建 Issues 和 Projects**
   - 规划功能开发
   - 记录 Bug

---

## 🎉 完成！

现在你的项目已经在 GitHub 上了！可以：
- 分享给其他开发者
- 部署到云服务器
- 使用 GitHub Actions 做 CI/CD
- 协作开发
