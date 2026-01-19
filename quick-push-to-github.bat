@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "GIT_PATH=D:\Program Files\Git\bin\git.exe"

echo ====================================
echo 快速推送项目到 GitHub
echo ====================================
echo.

REM 检查 Git 用户配置
"%GIT_PATH%" config --global --get user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [步骤 1/4] 配置 Git 用户信息（首次使用需要）
    echo.
    set /p GIT_NAME="请输入你的名字: "
    set /p GIT_EMAIL="请输入你的邮箱: "
    
    if "!GIT_NAME!"=="" (
        echo [错误] 名字不能为空
        pause
        exit /b 1
    )
    if "!GIT_EMAIL!"=="" (
        echo [错误] 邮箱不能为空
        pause
        exit /b 1
    )
    
    "%GIT_PATH%" config --global user.name "!GIT_NAME!"
    "%GIT_PATH%" config --global user.email "!GIT_EMAIL!"
    
    REM 验证配置是否成功
    "%GIT_PATH%" config --global --get user.name >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] Git 用户信息配置失败
        pause
        exit /b 1
    )
    
    echo [成功] Git 用户信息已配置
    echo.
) else (
    echo [步骤 1/4] Git 用户信息已配置:
    "%GIT_PATH%" config --global --get user.name
    "%GIT_PATH%" config --global --get user.email
    echo.
)

REM 提交代码（如果还没有提交）
"%GIT_PATH%" rev-parse --verify HEAD >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [步骤 2/4] 提交代码...
    "%GIT_PATH%" add .
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 添加文件失败
        pause
        exit /b 1
    )
    
    "%GIT_PATH%" commit -m "Initial commit: Shanghai Tour Guide App"
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 提交失败，请检查 Git 用户信息是否配置正确
        pause
        exit /b 1
    )
    echo [成功] 代码已提交
    echo.
) else (
    echo [步骤 2/4] 检查是否有未提交的更改...
    "%GIT_PATH%" diff --cached --quiet
    if %ERRORLEVEL% NEQ 0 (
        echo 发现有未提交的更改，正在提交...
        "%GIT_PATH%" commit -m "Update: Shanghai Tour Guide App"
        if %ERRORLEVEL% EQU 0 (
            echo [成功] 更改已提交
        ) else (
            echo [错误] 提交失败
        )
        echo.
    ) else (
        echo [成功] 所有更改已提交
        echo.
    )
)

REM 检查远程仓库
echo [步骤 3/4] 配置 GitHub 远程仓库...
echo.
"%GIT_PATH%" remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 请在 GitHub 上创建新仓库（如果还没有）:
    echo.
    echo 1. 访问: https://github.com/new
    echo 2. 填写仓库名称（例如: shanghai-tour-guide）
    echo 3. 选择 Public 或 Private
    echo 4. 重要: 不要勾选 "Initialize with README"
    echo 5. 点击 "Create repository"
    echo.
    echo 仓库地址格式: https://github.com/用户名/仓库名.git
    echo 示例: https://github.com/zhangsan/shanghai-tour-guide.git
    echo.
    set /p REPO_URL="请输入完整的 GitHub 仓库地址: "
    
    if "!REPO_URL!"=="" (
        echo.
        echo [错误] 仓库地址不能为空
        echo.
        echo 稍后可以运行以下命令:
        echo   "%GIT_PATH%" remote add origin 你的仓库地址
        echo   "%GIT_PATH%" push -u origin main
        pause
        exit /b 1
    )
    
    REM 验证地址格式
    echo !REPO_URL! | findstr /C:"https://github.com" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [警告] 地址格式可能不正确，应该是: https://github.com/用户名/仓库名.git
        echo 继续使用输入的地址...
        echo.
    )
    
    "%GIT_PATH%" remote add origin "!REPO_URL!"
    if %ERRORLEVEL% EQU 0 (
        echo [成功] 远程仓库已添加
    ) else (
        echo [错误] 添加远程仓库失败
        pause
        exit /b 1
    )
    echo.
) else (
    echo 远程仓库已配置:
    "%GIT_PATH%" remote get-url origin
    echo.
)

REM 推送代码
echo [步骤 4/4] 推送到 GitHub...
echo.
echo 身份验证提示:
echo - 用户名: 输入你的 GitHub 用户名
echo - 密码: 输入 Personal Access Token（不是 GitHub 密码）
echo.
echo 如何创建 Token:
echo 1. 访问: https://github.com/settings/tokens
echo 2. 点击 "Generate new token (classic)"
echo 3. 勾选 "repo" 权限
echo 4. 生成后复制 Token（只显示一次）
echo 5. 推送时在密码框输入 Token
echo.

set /p PUSH_NOW="是否现在推送? (Y/n): "
if /i "!PUSH_NOW!"=="n" (
    echo.
    echo 稍后可以运行:
    echo   "%GIT_PATH%" push -u origin main
    pause
    exit /b 0
)

echo.
echo 正在推送到 GitHub...
"%GIT_PATH%" branch -M main 2>nul
"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo [成功] 代码已推送到 GitHub
    echo ====================================
    echo.
    echo 远程仓库地址:
    "%GIT_PATH%" remote get-url origin
    echo.
    echo 你可以访问上面的地址查看你的仓库！
) else (
    echo.
    echo ====================================
    echo [错误] 推送失败
    echo ====================================
    echo.
    echo 可能的原因:
    echo 1. 身份验证失败 - 请使用 Personal Access Token
    echo 2. 仓库地址错误 - 检查地址格式
    echo 3. 网络问题 - 检查网络连接
    echo 4. 权限问题 - 确认有推送权限
    echo.
    echo 如何创建 Token:
    echo https://github.com/settings/tokens
    echo.
    echo 可以重新运行此脚本重试
)

echo.
pause
