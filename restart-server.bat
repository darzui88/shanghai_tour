@echo off
echo 正在重启后端服务...
echo.

REM 查找并终止运行在5000端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo 终止进程 %%a
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul

REM 启动后端服务
echo 启动后端服务...
start "Backend Server" cmd /k "cd /d %~dp0 && npm run server"

echo.
echo 后端服务已启动，请在新窗口中查看日志
echo 按任意键退出...
pause >nul
