@echo off
chcp 65001 >nul
set "NODEJS_PATH=D:\develop\nodejs"

echo Adding Node.js to user PATH environment variable...
echo.

for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"

if defined USER_PATH (
    echo %USER_PATH% | findstr /C:"%NODEJS_PATH%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo Node.js path is already in user PATH.
    ) else (
        set "NEW_PATH=%USER_PATH%;%NODEJS_PATH%"
        reg add "HKCU\Environment" /v PATH /t REG_EXPAND_SZ /d "%NEW_PATH%" /f >nul
        echo Successfully added Node.js to user PATH!
        echo.
        echo Please restart your command prompt or PowerShell for changes to take effect.
    )
) else (
    reg add "HKCU\Environment" /v PATH /t REG_EXPAND_SZ /d "%NODEJS_PATH%" /f >nul
    echo Successfully added Node.js to user PATH!
    echo.
    echo Please restart your command prompt or PowerShell for changes to take effect.
)

echo.
echo Verifying installation:
"%NODEJS_PATH%\node.exe" --version
"%NODEJS_PATH%\npm.cmd" --version

pause
