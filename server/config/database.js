const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'shanghai_tour',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    return false;
  }
}

module.exports = { sequelize, testConnection };
