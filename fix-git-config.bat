@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "GIT_PATH=D:\Program Files\Git\bin\git.exe"

echo ====================================
echo 修复 Git 配置
echo ====================================
echo.

REM 检查并配置 Git 用户信息
"%GIT_PATH%" config --global --get user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 需要配置 Git 用户信息:
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
    echo [成功] Git 用户信息已配置
    echo.
) else (
    echo 当前 Git 用户信息:
    "%GIT_PATH%" config --global --get user.name
    "%GIT_PATH%" config --global --get user.email
    echo.
)

REM 删除错误的远程仓库
"%GIT_PATH%" remote get-url origin >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 当前远程仓库:
    "%GIT_PATH%" remote get-url origin
    echo.
    set /p REMOVE_REMOTE="远程仓库地址不正确，是否删除并重新配置? (Y/n): "
    if /i not "!REMOVE_REMOTE!"=="n" (
        "%GIT_PATH%" remote remove origin
        echo [成功] 已删除错误的远程仓库配置
        echo.
    )
)

REM 提交代码（如果还没有提交）
"%GIT_PATH%" rev-parse --verify HEAD >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 提交代码到本地仓库...
    "%GIT_PATH%" add .
    "%GIT_PATH%" commit -m "Initial commit: Shanghai Tour Guide App"
    if %ERRORLEVEL% EQU 0 (
        echo [成功] 代码已提交
    ) else (
        echo [错误] 提交失败
    )
    echo.
)

echo ====================================
echo 配置完成
echo ====================================
echo.
echo 下一步:
echo 1. 在 GitHub 上创建新仓库（如果还没有）
echo    访问: https://github.com/new
echo.
echo 2. 运行 quick-push-to-github.bat 完成推送
echo    或手动执行:
echo    git remote add origin https://github.com/用户名/仓库名.git
echo    git push -u origin main
echo.
pause
