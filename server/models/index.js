const { sequelize } = require('../config/database');
const Product = require('./Product');
const Location = require('./Location');
const Event = require('./Event');
const Order = require('./Order');
const Admin = require('./Admin');
const Guide = require('./Guide');
const User = require('./User');

// Sync database (create tables if they don't exist)
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database models synchronized');
    return true;
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  Product,
  Location,
  Event,
  Order,
  Admin,
  Guide,
  User,
  syncDatabase
};
