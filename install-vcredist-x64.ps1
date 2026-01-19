# Visual C++ Redistributable x64 安装脚本
# 适用于 Visual Studio 2015/2017/2019

Write-Host "正在下载 Visual C++ Redistributable x64..." -ForegroundColor Cyan

# 微软官方下载链接（最新版本）
$downloadUrl = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
$installerPath = "$env:TEMP\vc_redist.x64.exe"

try {
    # 检查是否需要管理员权限
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "警告: 需要管理员权限才能安装。请右键选择'以管理员身份运行'。" -ForegroundColor Yellow
        Write-Host "是否继续下载? (Y/N)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne "Y" -and $response -ne "y") {
            Write-Host "操作已取消。" -ForegroundColor Red
            exit
        }
    }

    # 下载安装程序
    Write-Host "从微软官方服务器下载..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    
    if (Test-Path $installerPath) {
        Write-Host "下载完成! 文件位置: $installerPath" -ForegroundColor Green
        Write-Host "文件大小: $((Get-Item $installerPath).Length / 1MB) MB" -ForegroundColor Green
        
        # 运行安装程序
        Write-Host "`n正在启动安装程序..." -ForegroundColor Cyan
        Write-Host "提示: 如果系统提示需要管理员权限，请点击'是'。" -ForegroundColor Yellow
        
        # 静默安装（如果需要交互式安装，请使用 Start-Process $installerPath）
        $process = Start-Process -FilePath $installerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "`n安装成功!" -ForegroundColor Green
        } elseif ($process.ExitCode -eq 1638) {
            Write-Host "`n系统已安装了相同或更新的版本。" -ForegroundColor Yellow
        } else {
            Write-Host "`n安装可能未完成。退出代码: $($process.ExitCode)" -ForegroundColor Yellow
            Write-Host "尝试交互式安装..." -ForegroundColor Cyan
            Start-Process -FilePath $installerPath -Wait
        }
        
        # 清理下载的安装程序
        Write-Host "`n清理临时文件..." -ForegroundColor Cyan
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
        Write-Host "完成!" -ForegroundColor Green
        
    } else {
        Write-Host "下载失败，文件不存在。" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`n发生错误: $_" -ForegroundColor Red
    Write-Host "`n请尝试手动下载并安装:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist" -ForegroundColor Cyan
    Write-Host "2. 下载 'vc_redist.x64.exe'" -ForegroundColor Cyan
    Write-Host "3. 以管理员身份运行安装程序" -ForegroundColor Cyan
    exit 1
}
