@echo off
chcp 65001 >nul
echo 检查应用状态...
echo.

echo 检查端口占用情况:
echo.
netstat -ano | findstr ":5000 :5173" || echo 端口未被占用（应用可能未运行）
echo.

echo 检查进程:
echo.
tasklist | findstr /i "node.exe" || echo 未找到 node.exe 进程
echo.

pause
