const { sequelize } = require('./server/config/database');
const { DataTypes } = require('sequelize');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    const queryInterface = sequelize.getQueryInterface();

    // 添加新字段
    console.log('📝 Adding venueName and venueAddress fields...');
    await queryInterface.addColumn('events', 'venueName', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '地点名称'
    });
    await queryInterface.addColumn('events', 'venueAddress', {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '地点地址'
    });

    console.log('✅ Added venueName and venueAddress fields');

    // 迁移现有数据
    console.log('📝 Migrating existing data...');
    const [results] = await sequelize.query(`
      SELECT id, venue FROM events WHERE venue IS NOT NULL
    `);

    let migrated = 0;
    for (const row of results) {
      try {
        let venueName = '';
        let venueAddress = '';
        
        if (typeof row.venue === 'string') {
          const venue = JSON.parse(row.venue);
          venueName = venue.name || '';
          venueAddress = venue.address || '';
        } else if (typeof row.venue === 'object' && row.venue !== null) {
          venueName = row.venue.name || '';
          venueAddress = row.venue.address || '';
        }

        await sequelize.query(`
          UPDATE events 
          SET venueName = ?, venueAddress = ? 
          WHERE id = ?
        `, {
          replacements: [venueName, venueAddress, row.id]
        });
        migrated++;
      } catch (error) {
        console.error(`❌ Error migrating event ${row.id}:`, error.message);
      }
    }

    console.log(`✅ Migrated ${migrated} events`);

    // 添加索引
    console.log('📝 Adding index on venueName...');
    await queryInterface.addIndex('events', ['venueName']);
    console.log('✅ Added index on venueName');

    // 注意：不删除旧的venue字段，以防需要回滚
    // 如果需要删除旧字段，可以手动执行：
    // await queryInterface.removeColumn('events', 'venue');

    console.log('✅ Migration completed!');
    console.log('⚠️  Note: Old "venue" column is still present. You can remove it manually if migration is successful.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
})();
