@echo off
chcp 65001 >nul
set "GIT_PATH=D:\Program Files\Git\bin\git.exe"

echo ====================================
echo 配置 Git 并同步到 GitHub
echo ====================================
echo.

REM 检查 Git 是否存在
if not exist "%GIT_PATH%" (
    echo [错误] 未找到 Git，请确认路径正确
    pause
    exit /b 1
)

echo [1/6] Git 已找到: 
"%GIT_PATH%" --version
echo.

REM 检查用户配置
"%GIT_PATH%" config --global --get user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [2/6] 配置 Git 用户信息...
    echo.
    set /p GIT_NAME="请输入你的名字（用于 Git 提交）: "
    set /p GIT_EMAIL="请输入你的邮箱（用于 Git 提交）: "
    
    "%GIT_PATH%" config --global user.name "%GIT_NAME%"
    "%GIT_PATH%" config --global user.email "%GIT_EMAIL%"
    echo ✅ Git 用户信息已配置
    echo.
) else (
    echo [2/6] Git 用户信息已配置:
    "%GIT_PATH%" config --global --get user.name
    "%GIT_PATH%" config --global --get user.email
    echo.
)

REM 检查是否已初始化仓库
if not exist .git (
    echo [3/6] 初始化 Git 仓库...
    "%GIT_PATH%" init
    echo ✅ 仓库初始化完成
    echo.
) else (
    echo [3/6] Git 仓库已存在
    echo.
)

REM 添加文件
echo [4/6] 添加文件到 Git...
"%GIT_PATH%" add .
echo ✅ 文件已添加
echo.

REM 检查是否有未提交的更改
"%GIT_PATH%" diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [5/6] 提交更改...
    set /p COMMIT_MSG="请输入提交信息 (直接回车使用默认): "
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=Initial commit: Shanghai Tour Guide App
    "%GIT_PATH%" commit -m "%COMMIT_MSG%"
    echo ✅ 更改已提交
    echo.
) else (
    echo [5/6] 没有需要提交的更改
    echo.
)

REM 检查远程仓库
"%GIT_PATH%" remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [6/6] 设置远程仓库...
    echo.
    echo 请在 GitHub 上创建新仓库（如果还没有）:
    echo 1. 访问 https://github.com/new
    echo 2. 填写仓库名称（例如: shanghai-tour-guide）
    echo 3. 选择 Public 或 Private
    echo 4. ⚠️ 不要勾选 "Initialize with README"
    echo 5. 点击 "Create repository"
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址 (例如: https://github.com/用户名/仓库名.git): "
    
    if "!REPO_URL!"=="" (
        echo.
        echo [跳过] 未输入仓库地址
        echo.
        echo 稍后可以手动运行以下命令:
        echo   "%GIT_PATH%" remote add origin 你的仓库地址
        echo   "%GIT_PATH%" branch -M main
        echo   "%GIT_PATH%" push -u origin main
        echo.
        pause
        exit /b 0
    )
    
    "%GIT_PATH%" remote add origin "!REPO_URL!"
    echo ✅ 远程仓库已添加
    echo.
) else (
    echo [6/6] 远程仓库已配置:
    "%GIT_PATH%" remote get-url origin
    echo.
)

REM 推送代码
echo 准备推送到 GitHub...
echo.
set /p PUSH_NOW="是否现在推送? (Y/n): "
if /i "!PUSH_NOW!"=="n" (
    echo.
    echo 稍后可以运行以下命令推送:
    echo   "%GIT_PATH%" push -u origin main
    echo.
    pause
    exit /b 0
)

echo.
echo 正在推送到 GitHub...
echo.

REM 设置默认分支为 main
"%GIT_PATH%" branch -M main 2>nul

REM 尝试推送
"%GIT_PATH%" push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo ✅ 成功！代码已推送到 GitHub
    echo ====================================
    echo.
    "%GIT_PATH%" remote get-url origin
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
    echo 2. 身份验证失败
    echo    解决方法: 使用 Personal Access Token 而不是密码
    echo    - GitHub → Settings → Developer settings → Personal access tokens
    echo    - 创建新 Token，勾选 repo 权限
    echo    - 推送时密码框输入 Token
    echo 3. 仓库地址错误
    echo.
    echo 请参考 GITHUB_SYNC_GUIDE.md 查看详细说明
    echo.
)

echo.
pause
