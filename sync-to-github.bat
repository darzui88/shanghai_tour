@echo off
chcp 65001 >nul
echo ====================================
echo 同步项目到 GitHub
echo ====================================
echo.

REM 检查 Git 是否安装
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Git
    echo.
    echo 请先安装 Git:
    echo 1. 访问 https://git-scm.com/download/win
    echo 2. 下载并安装 Git for Windows
    echo 3. 安装完成后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [1/7] Git 已安装
git --version
echo.

REM 检查是否已初始化仓库
if not exist .git (
    echo [2/7] 初始化 Git 仓库...
    git init
    echo ✅ 仓库初始化完成
    echo.
) else (
    echo [2/7] Git 仓库已存在
    echo.
)

REM 检查 .gitignore
if exist .gitignore (
    echo [3/7] .gitignore 文件存在
    echo.
) else (
    echo [警告] .gitignore 文件不存在，正在创建...
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
    ) > .gitignore
    echo ✅ 已创建 .gitignore
    echo.
)

REM 检查 Git 用户配置
git config user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [4/7] 配置 Git 用户信息...
    echo.
    set /p GIT_NAME="请输入你的名字: "
    set /p GIT_EMAIL="请输入你的邮箱: "
    git config --global user.name "%GIT_NAME%"
    git config --global user.email "%GIT_EMAIL%"
    echo ✅ Git 用户信息已配置
    echo.
) else (
    echo [4/7] Git 用户信息已配置
    git config user.name
    git config user.email
    echo.
)

REM 添加文件
echo [5/7] 添加文件到 Git...
git add .
echo ✅ 文件已添加
echo.

REM 检查是否有未提交的更改
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [6/7] 提交更改...
    set /p COMMIT_MSG="请输入提交信息 (直接回车使用默认): "
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=Initial commit: Shanghai Tour Guide App
    git commit -m "%COMMIT_MSG%"
    echo ✅ 更改已提交
    echo.
) else (
    echo [6/7] 没有需要提交的更改
    echo.
)

REM 检查远程仓库
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [7/7] 设置远程仓库...
    echo.
    echo 请在 GitHub 上创建新仓库（如果还没有）:
    echo 1. 访问 https://github.com/new
    echo 2. 填写仓库名称（例如: shanghai-tour-guide）
    echo 3. 不要勾选 "Initialize with README"
    echo 4. 点击 "Create repository"
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址 (例如: https://github.com/用户名/仓库名.git): "
    
    if "!REPO_URL!"=="" (
        echo [跳过] 未输入仓库地址，稍后可以手动运行:
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
    echo [7/7] 远程仓库已配置
    git remote get-url origin
    echo.
)

REM 推送代码
echo 准备推送到 GitHub...
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
    echo ✅ 成功！代码已推送到 GitHub
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
