# 数据库备份脚本 (PowerShell)
# 使用: .\backup-database.ps1

$ErrorActionPreference = "Stop"

# 加载环境变量
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# 数据库配置
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "shanghai_tour" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }

# 创建备份目录
$BACKUP_DIR = Join-Path $PSScriptRoot "database-backups"
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

# 生成备份文件名（带时间戳）
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFileName = "backup-${DB_NAME}-${timestamp}.sql"
$backupFilePath = Join-Path $BACKUP_DIR $backupFileName

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "数据库备份工具" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "数据库: $DB_NAME"
Write-Host "主机: ${DB_HOST}:${DB_PORT}"
Write-Host "用户: $DB_USER"
Write-Host "备份文件: $backupFileName"
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 mysqldump 是否可用
$mysqldumpPath = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqldumpPath) {
    Write-Host "❌ 错误: 未找到 mysqldump 命令" -ForegroundColor Red
    Write-Host "请确保 MySQL 已安装并且 mysqldump 在系统 PATH 中"
    Write-Host ""
    Write-Host "解决方案:"
    Write-Host "1. 确保 MySQL 已安装"
    Write-Host "2. 将 MySQL bin 目录添加到系统 PATH"
    Write-Host "   例如: C:\Program Files\MySQL\MySQL Server 8.0\bin"
    exit 1
}

# 构建 mysqldump 命令
$mysqldumpArgs = @(
    "-h", $DB_HOST,
    "-P", $DB_PORT,
    "-u", $DB_USER
)

if ($DB_PASSWORD) {
    $mysqldumpArgs += "-p$DB_PASSWORD"
}

$mysqldumpArgs += $DB_NAME

Write-Host "正在备份数据库..." -ForegroundColor Yellow
Write-Host ""

try {
    # 执行备份
    & mysqldump $mysqldumpArgs | Out-File -FilePath $backupFilePath -Encoding UTF8
    
    if (Test-Path $backupFilePath) {
        $fileInfo = Get-Item $backupFilePath
        $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        
        Write-Host "✅ 数据库备份成功!" -ForegroundColor Green
        Write-Host "📁 备份文件: $backupFilePath" -ForegroundColor Green
        Write-Host "📊 文件大小: $fileSizeMB MB" -ForegroundColor Green
        Write-Host ""
        Write-Host "备份文件已保存到: database-backups/$backupFileName" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 备份文件未创建，请检查数据库连接和权限" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 备份失败: $_" -ForegroundColor Red
    exit 1
}
