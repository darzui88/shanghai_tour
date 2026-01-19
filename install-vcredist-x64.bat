@echo off
chcp 65001 >nul
echo 正在下载 Visual C++ Redistributable x64...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& {$url='https://aka.ms/vs/17/release/vc_redist.x64.exe'; $file=Join-Path $env:TEMP 'vc_redist.x64.exe'; try { Write-Host 'Downloading from Microsoft...' -ForegroundColor Cyan; Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing; if (Test-Path $file) { Write-Host 'Download complete!' -ForegroundColor Green; Write-Host 'Starting installer...' -ForegroundColor Cyan; $proc = Start-Process -FilePath $file -ArgumentList '/install','/quiet','/norestart' -Wait -PassThru; if ($proc.ExitCode -eq 0) { Write-Host 'Installation successful!' -ForegroundColor Green } elseif ($proc.ExitCode -eq 1638) { Write-Host 'A newer or same version is already installed.' -ForegroundColor Yellow } else { Write-Host 'Running interactive installer...' -ForegroundColor Cyan; Start-Process -FilePath $file -Wait } Remove-Item $file -Force -ErrorAction SilentlyContinue; Write-Host 'Done!' -ForegroundColor Green } else { Write-Host 'Download failed!' -ForegroundColor Red } } catch { Write-Host 'Error:' $_.Exception.Message -ForegroundColor Red; Write-Host 'Please download manually from:' -ForegroundColor Yellow; Write-Host 'https://aka.ms/vs/17/release/vc_redist.x64.exe' -ForegroundColor Cyan } }"

echo.
echo 如果安装遇到问题，请手动下载安装程序:
echo https://aka.ms/vs/17/release/vc_redist.x64.exe
echo.
pause
