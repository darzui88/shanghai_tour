@echo off
chcp 65001 >nul
echo 正在将 Node.js 添加到系统 PATH 环境变量...
echo.

set "NODEJS_PATH=D:\develop\nodejs"
set "CURRENT_PATH=%PATH%"

echo Node.js 路径: %NODEJS_PATH%
echo.

REM 检查是否已经在 PATH 中
echo %CURRENT_PATH% | findstr /C:"%NODEJS_PATH%" >nul
if %ERRORLEVEL% EQU 0 (
    echo [提示] Node.js 路径已经在 PATH 环境变量中！
    echo.
    pause
    exit /b 0
)

REM 检查路径是否存在
if not exist "%NODEJS_PATH%\node.exe" (
    echo [错误] Node.js 路径不存在或 node.exe 文件未找到！
    echo 请确认路径是否正确: %NODEJS_PATH%
    echo.
    pause
    exit /b 1
)

echo [信息] 当前 PATH 中没有找到 Node.js 路径，需要添加。
echo [提示] 此操作需要管理员权限。
echo.
echo 请选择添加方式:
echo 1. 添加到用户环境变量（推荐）
echo 2. 添加到系统环境变量（需要管理员权限）
echo 3. 仅显示手动添加步骤
echo.
set /p choice="请输入选项 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 正在添加到用户 PATH 环境变量...
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"
    if not defined USER_PATH (
        reg add "HKCU\Environment" /v PATH /t REG_EXPAND_SZ /d "%NODEJS_PATH%" /f >nul
    ) else (
        echo %USER_PATH% | findstr /C:"%NODEJS_PATH%" >nul
        if errorlevel 1 (
            reg add "HKCU\Environment" /v PATH /t REG_EXPAND_SZ /d "%USER_PATH%;%NODEJS_PATH%" /f >nul
        )
    )
    echo [完成] Node.js 已添加到用户 PATH！
    echo [提示] 请重新启动命令提示符或 PowerShell 以使更改生效。
) else if "%choice%"=="2" (
    echo.
    echo 正在尝试添加到系统 PATH 环境变量...
    net session >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 需要管理员权限！请右键选择"以管理员身份运行"。
        pause
        exit /b 1
    )
    for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYSTEM_PATH=%%B"
    if not defined SYSTEM_PATH (
        reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH /t REG_EXPAND_SZ /d "%NODEJS_PATH%" /f >nul
    ) else (
        echo %SYSTEM_PATH% | findstr /C:"%NODEJS_PATH%" >nul
        if errorlevel 1 (
            reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH /t REG_EXPAND_SZ /d "%SYSTEM_PATH%;%NODEJS_PATH%" /f >nul
        )
    )
    echo [完成] Node.js 已添加到系统 PATH！
    echo [提示] 请重新启动命令提示符或 PowerShell 以使更改生效。
) else if "%choice%"=="3" (
    echo.
    echo ========================================
    echo 手动添加步骤:
    echo ========================================
    echo.
    echo 1. 按 Win + R，输入 sysdm.cpl，按回车
    echo 2. 点击"高级"选项卡
    echo 3. 点击"环境变量"按钮
    echo 4. 在"用户变量"或"系统变量"中找到 PATH 变量
    echo 5. 点击"编辑"
    echo 6. 点击"新建"，输入: %NODEJS_PATH%
    echo 7. 点击"确定"保存所有更改
    echo 8. 重新打开命令提示符或 PowerShell
    echo.
) else (
    echo [错误] 无效的选项！
)

echo.
pause
