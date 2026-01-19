@echo off
chcp 65001 >nul
echo ====================================
echo Shanghai Tour Guide App
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] 检查 Node.js...
node --version
npm --version
echo.

REM Check if .env file exists
if not exist .env (
    echo [2/4] 创建 .env 文件...
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
    echo [提示] 已创建 .env 文件，请编辑并设置你的 MySQL 密码
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo [3/4] 安装后端依赖...
    call npm install
    echo.
) else (
    echo [3/4] 后端依赖已安装
    echo.
)

if not exist client\node_modules (
    echo [4/4] 安装前端依赖...
    cd client
    call npm install
    cd ..
    echo.
) else (
    echo [4/4] 前端依赖已安装
    echo.
)

echo ====================================
echo 准备启动应用...
echo ====================================
echo.
echo [提示] 请确保：
echo 1. MySQL 服务正在运行
echo 2. 已创建数据库 shanghai_tour
echo 3. .env 文件中的数据库密码已配置
echo.
echo 启动应用...
echo.

call npm run dev

pause
