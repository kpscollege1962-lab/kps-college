require('dotenv').config();
require('../models'); // registers all models and associations before sync

const { sequelize } = require('../config/database');

const run = async () => {
  try {
    console.log('Syncing database schema...');
    await sequelize.sync({ alter: false, force: false });
    console.log('Database synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database sync failed:', err.message);
    process.exit(1);
  }
};

run();
