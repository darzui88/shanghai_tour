/**
 * 检查events表结构
 */

const { sequelize } = require('../config/database');

async function checkStructure() {
  try {
    const [results] = await sequelize.query('DESCRIBE events');
    
    console.log('Events表结构检查:');
    console.log('='.repeat(60));
    
    const fieldsToCheck = ['startDate', 'endDate', 'openingHours'];
    
    results.forEach(row => {
      if (fieldsToCheck.includes(row.Field)) {
        console.log(`字段: ${row.Field}`);
        console.log(`  类型: ${row.Type}`);
        console.log(`  可空: ${row.Null === 'YES' ? 'YES' : 'NO'}`);
        console.log(`  注释: ${row.Comment || '(无)'}`);
        console.log('');
      }
    });
    
    // 检查是否所有字段都存在
    const existingFields = results.map(r => r.Field);
    const missingFields = fieldsToCheck.filter(f => !existingFields.includes(f));
    
    if (missingFields.length > 0) {
      console.log('⚠️  缺失字段:', missingFields.join(', '));
    } else {
      console.log('✅ 所有字段检查完成');
    }
    
    // 检查startDate和endDate是否可空
    const startDateRow = results.find(r => r.Field === 'startDate');
    const endDateRow = results.find(r => r.Field === 'endDate');
    const openingHoursRow = results.find(r => r.Field === 'openingHours');
    
    if (startDateRow && startDateRow.Null === 'YES') {
      console.log('✅ startDate已设置为可空');
    } else {
      console.log('⚠️  startDate未设置为可空');
    }
    
    if (endDateRow && endDateRow.Null === 'YES') {
      console.log('✅ endDate已设置为可空');
    } else {
      console.log('⚠️  endDate未设置为可空');
    }
    
    if (openingHoursRow) {
      console.log('✅ openingHours字段已存在');
    } else {
      console.log('⚠️  openingHours字段不存在');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error.message);
    process.exit(1);
  }
}

checkStructure();
