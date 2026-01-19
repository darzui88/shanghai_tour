@echo off
chcp 65001 >nul
set "GIT_PATH=D:\Program Files\Git\bin\git.exe"

echo ====================================
echo 配置 Git 用户信息
echo ====================================
echo.
echo 这个信息会显示在你的 Git 提交记录中
echo.

set /p GIT_NAME="请输入你的名字: "
set /p GIT_EMAIL="请输入你的邮箱: "

if "%GIT_NAME%"=="" (
    echo [错误] 名字不能为空
    pause
    exit /b 1
)

if "%GIT_EMAIL%"=="" (
    echo [错误] 邮箱不能为空
    pause
    exit /b 1
)

"%GIT_PATH%" config --global user.name "%GIT_NAME%"
"%GIT_PATH%" config --global user.email "%GIT_EMAIL%"

echo.
echo ✅ Git 用户信息已配置:
"%GIT_PATH%" config --global --get user.name
"%GIT_PATH%" config --global --get user.email
echo.
pause
