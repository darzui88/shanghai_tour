@echo off
chcp 65001 >nul
set "GIT_PATH=D:\Program Files\Git\bin\git.exe"

echo ====================================
echo 修复并推送到 GitHub
echo ====================================
echo.

REM 检查远程仓库
"%GIT_PATH%" remote -v >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 远程仓库未配置，需要添加 GitHub 仓库地址
    echo.
    goto :ADD_REMOTE
)

echo 当前远程仓库配置:
"%GIT_PATH%" remote -v
echo.

set /p CONFIRM="使用当前远程仓库地址? (Y/n): "
if /i "!CONFIRM!"=="n" (
    goto :CHANGE_REMOTE
)

goto :PUSH

:CHANGE_REMOTE
echo.
echo 删除当前远程仓库配置...
"%GIT_PATH%" remote remove origin
echo.

:ADD_REMOTE
echo 请在 GitHub 上创建仓库（如果还没有）:
echo 1. 访问 https://github.com/new
echo 2. 填写仓库名称（例如: shanghai-tour-guide）
echo 3. 选择 Public 或 Private
echo 4. ⚠️ 不要勾选 "Initialize with README"
echo 5. 点击 "Create repository"
echo.
set /p REPO_URL="请输入 GitHub 仓库地址 (例如: https://github.com/用户名/仓库名.git): "

if "!REPO_URL!"=="" (
    echo [错误] 仓库地址不能为空
    pause
    exit /b 1
)

echo.
echo 添加远程仓库...
"%GIT_PATH%" remote add origin "!REPO_URL!"
echo ✅ 远程仓库已添加

:PUSH
echo.
echo 设置分支为 main...
"%GIT_PATH%" branch -M main 2>nul

echo.
echo 准备推送到 GitHub...
echo.
echo ⚠️ 重要提示:
echo - 如果要求输入用户名，输入你的 GitHub 用户名
echo - 如果要求输入密码，使用 Personal Access Token（不是 GitHub 密码）
echo.
echo 如何创建 Token:
echo 1. GitHub → Settings → Developer settings
echo 2. Personal access tokens → Tokens (classic)
echo 3. Generate new token (classic)
echo 4. 勾选 "repo" 权限
echo 5. 生成并复制 Token
echo.

set /p PUSH_NOW="是否现在推送? (Y/n): "
if /i "!PUSH_NOW!"=="n" (
    echo.
    echo 稍后可以运行以下命令推送:
    echo   "%GIT_PATH%" push -u origin main
    pause
    exit /b 0
)

echo.
echo 正在推送到 GitHub...
echo.

"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo ✅ 成功！代码已推送到 GitHub
    echo ====================================
    echo.
    echo 远程仓库地址:
    "%GIT_PATH%" remote get-url origin
    echo.
    echo 你可以访问 GitHub 查看你的仓库了！
) else (
    echo.
    echo ====================================
    echo ⚠️ 推送失败
    echo ====================================
    echo.
    echo 可能的原因和解决方法:
    echo.
    echo 1. 身份验证失败
    echo    解决方法: 使用 Personal Access Token
    echo    创建地址: https://github.com/settings/tokens
    echo.
    echo 2. 仓库地址错误
    echo    检查地址格式: https://github.com/用户名/仓库名.git
    echo.
    echo 3. 网络问题
    echo    检查网络连接，或稍后重试
    echo.
    echo 4. 权限问题
    echo    确认你有该仓库的推送权限
    echo.
)

echo.
pause
