@echo off
setlocal enabledelayedexpansion
set "GIT_PATH=D:\Program Files\Git\bin\git.exe"

echo ====================================
echo Push Project to GitHub
echo ====================================
echo.

REM Check and configure Git user
echo [Step 1/4] Configure Git user
"%GIT_PATH%" config --global --get user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    set /p GIT_NAME="Enter your name: "
    set /p GIT_EMAIL="Enter your email: "
    if not "!GIT_NAME!"=="" if not "!GIT_EMAIL!"=="" (
        "%GIT_PATH%" config --global user.name "!GIT_NAME!"
        "%GIT_PATH%" config --global user.email "!GIT_EMAIL!"
        echo Git user configured successfully.
    ) else (
        echo Error: Name and email are required.
        pause
        exit /b 1
    )
) else (
    echo Git user already configured:
    "%GIT_PATH%" config --global --get user.name
    "%GIT_PATH%" config --global --get user.email
)
echo.

REM Commit code
echo [Step 2/4] Commit code
"%GIT_PATH%" rev-parse --verify HEAD >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    "%GIT_PATH%" add .
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to add files.
        pause
        exit /b 1
    )
    "%GIT_PATH%" commit -m "Initial commit: Shanghai Tour Guide App"
    if %ERRORLEVEL% EQU 0 (
        echo Code committed successfully.
    ) else (
        echo Error: Commit failed. Please check Git user configuration.
        pause
        exit /b 1
    )
) else (
    echo Checking for uncommitted changes...
    "%GIT_PATH%" diff --cached --quiet
    if %ERRORLEVEL% NEQ 0 (
        echo Found uncommitted changes, committing...
        "%GIT_PATH%" commit -m "Update: Shanghai Tour Guide App"
        if %ERRORLEVEL% EQU 0 (
            echo Changes committed successfully.
        )
    ) else (
        echo All changes are already committed.
    )
)
echo.

REM Configure remote repository
echo [Step 3/4] Configure GitHub remote repository
"%GIT_PATH%" remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please create a repository on GitHub:
    echo 1. Visit: https://github.com/new
    echo 2. Enter repository name (e.g., shanghai-tour-guide)
    echo 3. Choose Public or Private
    echo 4. DO NOT check "Initialize with README"
    echo 5. Click "Create repository"
    echo.
    echo Repository URL format: https://github.com/username/repo-name.git
    echo Example: https://github.com/zhangsan/shanghai-tour-guide.git
    echo.
    set /p REPO_URL="Enter your GitHub repository URL: "
    
    if "!REPO_URL!"=="" (
        echo.
        echo Error: Repository URL cannot be empty.
        echo.
        echo To add later, run:
        echo   "%GIT_PATH%" remote add origin YOUR_REPO_URL
        echo   "%GIT_PATH%" push -u origin main
        pause
        exit /b 1
    )
    
    echo !REPO_URL! | findstr /C:"https://github.com" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo Warning: URL format may be incorrect.
        echo Expected format: https://github.com/username/repo-name.git
        echo Continuing with provided URL...
        echo.
    )
    
    "%GIT_PATH%" remote add origin "!REPO_URL!"
    if %ERRORLEVEL% EQU 0 (
        echo Remote repository added successfully.
    ) else (
        echo Error: Failed to add remote repository.
        pause
        exit /b 1
    )
) else (
    echo Remote repository already configured:
    "%GIT_PATH%" remote get-url origin
)
echo.

REM Push to GitHub
echo [Step 4/4] Push to GitHub
echo.
echo Authentication Instructions:
echo - Username: Enter your GitHub username
echo - Password: Enter Personal Access Token (NOT your GitHub password)
echo.
echo How to create a Personal Access Token:
echo 1. Visit: https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Check "repo" permission
echo 4. Generate and copy the token (shown only once)
echo 5. Use the token as password when pushing
echo.

set /p PUSH_NOW="Push now? (Y/n): "
if /i "!PUSH_NOW!"=="n" (
    echo.
    echo To push later, run:
    echo   "%GIT_PATH%" push -u origin main
    pause
    exit /b 0
)

echo.
echo Pushing to GitHub...
"%GIT_PATH%" branch -M main 2>nul
"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Success! Code pushed to GitHub
    echo ====================================
    echo.
    echo Repository URL:
    "%GIT_PATH%" remote get-url origin
    echo.
    echo Visit the URL above to view your repository!
) else (
    echo.
    echo ====================================
    echo Error: Push failed
    echo ====================================
    echo.
    echo Possible reasons:
    echo 1. Authentication failed - Use Personal Access Token
    echo 2. Wrong repository URL - Check URL format
    echo 3. Network issue - Check internet connection
    echo 4. Permission issue - Verify you have push permissions
    echo.
    echo How to create Token:
    echo https://github.com/settings/tokens
    echo.
    echo You can run this script again to retry.
)

echo.
pause
