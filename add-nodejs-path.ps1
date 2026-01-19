# 将 Node.js 添加到 PATH 环境变量

$nodePath = "D:\develop\nodejs"

# 检查路径是否存在
if (-not (Test-Path "$nodePath\node.exe")) {
    Write-Host "错误: Node.js 路径不存在: $nodePath" -ForegroundColor Red
    exit 1
}

# 获取当前的用户 PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

# 检查是否已经存在
if ($currentPath -and $currentPath.Contains($nodePath)) {
    Write-Host "提示: Node.js 路径已经在用户 PATH 环境变量中。" -ForegroundColor Yellow
    Write-Host "当前 PATH: $currentPath" -ForegroundColor Cyan
} else {
    # 添加到 PATH
    if ($currentPath) {
        $newPath = "$currentPath;$nodePath"
    } else {
        $newPath = $nodePath
    }
    
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    
    Write-Host "成功: 已将 Node.js 添加到用户 PATH 环境变量！" -ForegroundColor Green
    Write-Host "新 PATH: $newPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "重要提示: 请重新打开命令提示符或 PowerShell 窗口以使更改生效。" -ForegroundColor Yellow
}

# 验证安装
Write-Host ""
Write-Host "验证 Node.js 安装:" -ForegroundColor Cyan
& "$nodePath\node.exe" --version | ForEach-Object { Write-Host "Node.js: $_" -ForegroundColor Green }
& "$nodePath\npm.cmd" --version | ForEach-Object { Write-Host "npm: $_" -ForegroundColor Green }
