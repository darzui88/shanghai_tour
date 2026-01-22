@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 同步代码和数据库到 GitHub
echo ====================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 检查 Git 是否安装
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Git
    echo 请先安装 Git: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/6] 环境检查完成
echo   - Node.js: 
node --version
echo   - Git: 
git --version
echo.

REM 步骤 1: 备份数据库
echo [2/6] 备份数据库...
echo.
node backup-database.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ 数据库备份失败，但将继续同步代码
    echo.
    pause
) else (
    echo ✅ 数据库备份完成
    echo.
)

REM 检查是否已初始化仓库
if not exist .git (
    echo [3/6] 初始化 Git 仓库...
    git init
    echo ✅ 仓库初始化完成
    echo.
) else (
    echo [3/6] Git 仓库已存在
    echo.
)

REM 检查 .gitignore
if exist .gitignore (
    echo [4/6] 检查 .gitignore...
    findstr /C:"database-backups/" .gitignore >nul
    if %ERRORLEVEL% NEQ 0 (
        echo   添加 database-backups/ 到 .gitignore（但允许备份文件）...
        echo # 数据库备份目录（允许提交备份文件） >> .gitignore
        echo !database-backups/*.sql >> .gitignore
        echo ✅ .gitignore 已更新
    )
    echo.
) else (
    echo [4/6] 创建 .gitignore...
    (
        echo node_modules/
        echo .env
        echo dist/
        echo build/
        echo *.log
        echo .DS_Store
        echo .vscode/
        echo .idea/
        echo coverage/
        echo *.zip
        echo dump-*.sql
        echo # 数据库备份目录（允许提交备份文件）
        echo !database-backups/*.sql
    ) > .gitignore
    echo ✅ .gitignore 已创建
    echo.
)

REM 添加文件
echo [5/6] 添加文件到 Git...
git add .
echo ✅ 文件已添加
echo.

REM 检查是否有未提交的更改
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [6/6] 提交更改...
    set /p COMMIT_MSG="请输入提交信息 (直接回车使用默认): "
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=更新代码和数据库备份
    git commit -m "!COMMIT_MSG!"
    echo ✅ 更改已提交
    echo.
) else (
    echo [6/6] 没有需要提交的更改
    echo.
)

REM 检查远程仓库
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ====================================
    echo 设置远程仓库
    echo ====================================
    echo.
    echo 请在 GitHub 上创建新仓库（如果还没有）:
    echo 1. 访问 https://github.com/new
    echo 2. 填写仓库名称
    echo 3. 不要勾选 "Initialize with README"
    echo 4. 点击 "Create repository"
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址: "
    
    if "!REPO_URL!"=="" (
        echo.
        echo [跳过] 未输入仓库地址
        echo 稍后可以手动运行:
        echo   git remote add origin 你的仓库地址
        echo   git push -u origin main
        echo.
        pause
        exit /b 0
    )
    
    git remote add origin "!REPO_URL!"
    echo ✅ 远程仓库已添加
    echo.
) else (
    echo 远程仓库已配置:
    git remote get-url origin
    echo.
)

REM 推送代码
echo ====================================
echo 准备推送到 GitHub
echo ====================================
echo.
set /p PUSH_NOW="是否现在推送? (Y/n): "
if /i "!PUSH_NOW!"=="n" (
    echo.
    echo 稍后可以运行以下命令推送:
    echo   git push -u origin main
    echo.
    pause
    exit /b 0
)

echo.
echo 正在推送到 GitHub...
echo.

REM 设置默认分支为 main
git branch -M main 2>nul

REM 尝试推送
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo ✅ 成功！代码和数据库备份已推送到 GitHub
    echo ====================================
    echo.
    git remote get-url origin
    echo.
    echo 你可以访问上面的地址查看你的仓库
) else (
    echo.
    echo ====================================
    echo ⚠️ 推送失败
    echo ====================================
    echo.
    echo 可能的原因:
    echo 1. 网络连接问题
    echo 2. 身份验证失败（需要使用 Personal Access Token）
    echo 3. 仓库地址错误
    echo.
    echo 请参考 GITHUB_SYNC_GUIDE.md 查看详细说明
    echo.
)

echo.
pause
