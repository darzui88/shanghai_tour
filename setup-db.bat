@echo off
chcp 65001 >nul
echo ====================================
echo 数据库设置脚本
echo ====================================
echo.

REM Check if MySQL is available
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 MySQL 客户端
    echo 请确保 MySQL 已安装并在 PATH 中
    echo.
    echo 或者手动执行以下 SQL 命令：
    echo CREATE DATABASE shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    pause
    exit /b 1
)

echo [提示] 请确保 MySQL 服务正在运行
echo.
echo 请输入 MySQL root 密码（如果为空直接回车）:
set /p MYSQL_PWD="密码: "

if "%MYSQL_PWD%"=="" (
    echo 创建数据库...
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
) else (
    echo 创建数据库...
    mysql -u root -p%MYSQL_PWD% -e "CREATE DATABASE IF NOT EXISTS shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] 数据库创建成功！
    echo.
    echo 现在可以运行以下命令初始化数据：
    echo npm run seed
) else (
    echo.
    echo [错误] 数据库创建失败，请检查 MySQL 配置
)

echo.
pause
