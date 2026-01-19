# ✅ Git 安装检查和配置

## 🔍 快速检查 Git 是否已安装

### 方法 1：在新的 PowerShell 窗口中检查

1. **关闭当前的 PowerShell 或终端窗口**
2. **打开新的 PowerShell 窗口**（重要！）
3. **运行以下命令**：
   ```powershell
   git --version
   ```

**如果显示版本号**（如 `git version 2.42.0`）：
- ✅ Git 已安装，可以继续下一步

**如果显示"找不到命令"**：
- ❌ Git 未安装或未配置到 PATH
- 请按照下方步骤安装

---

## 📥 安装 Git（如果还没安装）

### Windows 安装步骤

1. **下载 Git**
   - 访问：https://git-scm.com/download/win
   - 点击下载，会下载 `Git-2.xx.x-64-bit.exe`

2. **运行安装程序**
   - 双击安装文件
   - **重要选项**：
     - ✅ 选择 "Git from the command line and also from 3rd-party software"
     - ✅ 选择 "Use bundled OpenSSH"
     - ✅ 其他选项使用默认即可

3. **完成安装后**
   - **必须重新打开 PowerShell 或命令提示符**（重要！）
   - 再次运行 `git --version` 验证

---

## ⚙️ 配置 Git（首次使用必须）

安装 Git 后，在新打开的终端中运行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

**示例**：
```bash
git config --global user.name "Zhang San"
git config --global user.email "zhangsan@example.com"
```

---

## 🚀 下一步：同步到 GitHub

Git 安装并配置完成后，你有两个选择：

### 选项 1：使用自动化脚本（推荐）

1. **双击运行** `sync-to-github.bat`
2. 按照提示操作

### 选项 2：手动执行命令

打开**新的** PowerShell 窗口，在项目目录执行：

```bash
# 1. 进入项目目录
cd D:\work\coding\tour

# 2. 初始化仓库
git init

# 3. 添加文件
git add .

# 4. 提交
git commit -m "Initial commit: Shanghai Tour Guide App"

# 5. 在 GitHub 创建仓库后，添加远程地址
git remote add origin https://github.com/你的用户名/仓库名.git

# 6. 推送
git branch -M main
git push -u origin main
```

---

## 🆘 如果仍然无法使用 Git

### 问题 1：提示"git 不是内部或外部命令"

**解决方案**：
1. 确认 Git 已安装完成
2. **重启电脑**（有时需要重启才能更新环境变量）
3. 或手动添加到 PATH：
   - 打开"系统环境变量"设置
   - 编辑 PATH 变量
   - 添加：`C:\Program Files\Git\bin`

### 问题 2：Git 命令在 PowerShell 中不工作

**解决方案**：
- 使用 **Git Bash**（安装 Git 时会自带）
- 或使用 **命令提示符（CMD）** 而不是 PowerShell

---

## ✅ 验证检查清单

完成以下所有项后，可以开始同步：

- [ ] Git 已安装
- [ ] 在新终端中 `git --version` 可以运行
- [ ] 已配置 `user.name` 和 `user.email`
- [ ] 已有 GitHub 账号
- [ ] 已在 GitHub 创建仓库（或准备创建）

---

## 📝 需要帮助？

如果遇到问题：
1. 确认使用的是**新打开的**终端窗口
2. 确认 Git 安装时选择了命令行选项
3. 尝试重启电脑
4. 参考 `GITHUB_SYNC_GUIDE.md` 获取详细说明
