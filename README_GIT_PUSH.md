# 快速推送到 GitHub - 简单指南

## 问题说明

批处理文件中的中文字符在某些 Windows 系统上会导致编码错误。我已经创建了纯英文版本的脚本。

## 推荐方法：使用纯英文脚本

**运行：`git-push.bat`**

这个脚本完全使用英文，避免了所有编码问题。

---

## 或者：手动执行命令

如果脚本仍有问题，可以手动执行以下命令：

### 1. 配置 Git 用户信息（首次必须）

```powershell
&"D:\Program Files\Git\bin\git.exe" config --global user.name "Your Name"
&"D:\Program Files\Git\bin\git.exe" config --global user.email "your.email@example.com"
```

### 2. 提交代码

```powershell
&"D:\Program Files\Git\bin\git.exe" add .
&"D:\Program Files\Git\bin\git.exe" commit -m "Initial commit: Shanghai Tour Guide App"
```

### 3. 在 GitHub 创建仓库

1. 访问：https://github.com/new
2. 填写仓库名称（例如：`shanghai-tour-guide`）
3. 选择 Public 或 Private
4. **不要勾选** "Initialize with README"
5. 点击 "Create repository"

### 4. 添加远程仓库并推送

```powershell
# 添加远程仓库（替换为你的实际地址）
&"D:\Program Files\Git\bin\git.exe" remote add origin https://github.com/你的用户名/仓库名.git

# 设置分支为 main
&"D:\Program Files\Git\bin\git.exe" branch -M main

# 推送到 GitHub
&"D:\Program Files\Git\bin\git.exe" push -u origin main
```

---

## 重要提示

### 推送时的身份验证

当执行 `git push` 时，会要求输入：
- **用户名**：输入你的 GitHub 用户名
- **密码**：输入 **Personal Access Token**（不是 GitHub 密码）

### 如何创建 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 点击 "Generate token"
5. **立即复制 Token**（只显示一次！）
6. 推送时在密码框输入这个 Token

---

## 当前状态

- ✅ Git 仓库已初始化
- ✅ 文件已添加到暂存区
- ⏳ 需要配置 Git 用户信息
- ⏳ 需要提交代码
- ⏳ 需要添加 GitHub 远程仓库
- ⏳ 需要推送到 GitHub

---

## 推荐操作

1. **先运行 `git-push.bat`**（纯英文，无编码问题）
2. 如果仍有问题，按照上面的手动步骤操作
