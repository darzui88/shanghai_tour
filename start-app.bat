@echo off
chcp 65001 >nul
title Shanghai Tour Guide - 应用启动中...

REM 设置 Node.js 路径
set "PATH=%PATH%;D:\develop\nodejs"

REM 切换到项目目录
cd /d "%~dp0"

echo ====================================
echo Shanghai Tour Guide App
echo ====================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Node.js
    echo 请确保 Node.js 已安装在 D:\develop\nodejs
    pause
    exit /b 1
)

echo [信息] Node.js 版本:
node --version
npm --version
echo.

REM 检查 .env 文件
if not exist .env (
    echo [信息] 创建 .env 文件...
    (
        echo PORT=5000
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_NAME=shanghai_tour
        echo DB_USER=root
        echo DB_PASSWORD=
        echo JWT_SECRET=shanghai-tour-guide-secret-key
        echo NODE_ENV=development
    ) > .env
    echo [提示] 已创建 .env 文件，请配置 MySQL 密码
    echo.
)

REM 检查并安装后端依赖
if not exist node_modules (
    echo [信息] 安装后端依赖...
    call npm install
    echo.
) else (
    echo [信息] 后端依赖已安装
    echo.
)

REM 检查并安装前端依赖
if not exist client\node_modules (
    echo [信息] 安装前端依赖...
    cd client
    call npm install
    cd ..
    echo.
) else (
    echo [信息] 前端依赖已安装
    echo.
)

echo ====================================
echo 启动应用...
echo ====================================
echo.
echo [提示] 应用将在以下地址运行:
echo - 前端: http://localhost:5173
echo - 后端 API: http://localhost:5000
echo.
echo [提示] 按 Ctrl+C 停止应用
echo.

REM 启动开发服务器
call npm run dev

pause
