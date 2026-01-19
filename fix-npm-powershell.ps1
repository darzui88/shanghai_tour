# 修复 npm 在 PowerShell 中的执行策略问题
# 需要以管理员身份运行

Write-Host "正在检查当前执行策略..." -ForegroundColor Cyan
$currentPolicy = Get-ExecutionPolicy
Write-Host "当前执行策略: $currentPolicy" -ForegroundColor Yellow

if ($currentPolicy -eq "Restricted") {
    Write-Host "`n检测到执行策略为 Restricted，需要修改为 RemoteSigned" -ForegroundColor Yellow
    Write-Host "这需要管理员权限。" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "方法 1 (推荐): 修改当前用户的执行策略" -ForegroundColor Cyan
    Write-Host "运行: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Green
    Write-Host ""
    Write-Host "方法 2: 使用 npm.cmd 代替 npm" -ForegroundColor Cyan
    Write-Host "使用: npm.cmd 或 npx.cmd" -ForegroundColor Green
    Write-Host ""
    Write-Host "方法 3: 在命令前加上 -ExecutionPolicy Bypass" -ForegroundColor Cyan
    Write-Host "例如: powershell -ExecutionPolicy Bypass -Command npm install" -ForegroundColor Green
} else {
    Write-Host "执行策略允许运行脚本。" -ForegroundColor Green
}

Write-Host ""
Write-Host "建议: 在项目中使用 npm.cmd 而不是 npm" -ForegroundColor Yellow
Write-Host "例如: npm.cmd install 或 npm.cmd run dev" -ForegroundColor Cyan
