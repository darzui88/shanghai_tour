const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库配置
const DB_NAME = process.env.DB_NAME || 'shanghai_tour';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

// 创建备份目录
const BACKUP_DIR = path.join(__dirname, 'database-backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 生成备份文件名（带时间戳）
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFileName = `backup-${DB_NAME}-${timestamp}.sql`;
const backupFilePath = path.join(BACKUP_DIR, backupFileName);

console.log('====================================');
console.log('数据库备份工具');
console.log('====================================');
console.log(`数据库: ${DB_NAME}`);
console.log(`主机: ${DB_HOST}:${DB_PORT}`);
console.log(`用户: ${DB_USER}`);
console.log(`备份文件: ${backupFileName}`);
console.log('====================================\n');

// 常见的 MySQL 安装路径
const commonMySQLPaths = [
  'D:\\develop\\MySQL\\MySQL Server 9.5\\bin',
  'C:\\Program Files\\MySQL\\MySQL Server 9.5\\bin',
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin',
  'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin',
  'C:\\xampp\\mysql\\bin',
  'C:\\wamp64\\bin\\mysql\\mysql8.0.xx\\bin'
];

// 查找 mysqldump
function findMysqldump() {
  return new Promise((resolve, reject) => {
    // 先检查 PATH 中是否有
    exec('where mysqldump', (error, stdout) => {
      if (!error && stdout.trim()) {
        resolve('mysqldump');
        return;
      }
      
      // 在常见路径中查找
      const path = require('path');
      for (const mysqlPath of commonMySQLPaths) {
        const mysqldumpPath = path.join(mysqlPath, 'mysqldump.exe');
        if (fs.existsSync(mysqldumpPath)) {
          resolve(mysqldumpPath);
          return;
        }
      }
      
      reject(new Error('未找到 mysqldump'));
    });
  });
}

// 检查 mysqldump 是否可用
findMysqldump().then((mysqldumpCmd) => {
  // 如果找到完整路径，使用完整路径；否则使用命令名
  const mysqldumpExec = mysqldumpCmd.includes('\\') ? `"${mysqldumpCmd}"` : mysqldumpCmd;
  
  // 构建 mysqldump 命令
  let mysqldumpArgs;
  if (DB_PASSWORD) {
    mysqldumpArgs = `${mysqldumpExec} -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME}`;
  } else {
    mysqldumpArgs = `${mysqldumpExec} -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_NAME}`;
  }
  
  // 执行备份
  console.log('正在备份数据库...\n');
  exec(`${mysqldumpArgs} > "${backupFilePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ 备份失败:', error.message);
      if (stderr) {
        console.error('错误详情:', stderr);
      }
      process.exit(1);
    }

    // 检查文件是否创建成功
    if (fs.existsSync(backupFilePath)) {
      const stats = fs.statSync(backupFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log('✅ 数据库备份成功!');
      console.log(`📁 备份文件: ${backupFilePath}`);
      console.log(`📊 文件大小: ${fileSizeMB} MB`);
      console.log(`\n备份文件已保存到: database-backups/${backupFileName}`);
    } else {
      console.error('❌ 备份文件未创建，请检查数据库连接和权限');
      process.exit(1);
    }
  });
}).catch((error) => {
  console.error('❌ 错误: 未找到 mysqldump 命令');
  console.error('请确保 MySQL 已安装并且 mysqldump 在系统 PATH 中');
  console.error('\n已检查的路径:');
  commonMySQLPaths.forEach(path => console.error(`  - ${path}`));
  console.error('\n解决方案:');
  console.error('1. 确保 MySQL 已安装');
  console.error('2. 将 MySQL bin 目录添加到系统 PATH');
  console.error('   例如: C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin');
  process.exit(1);
});
