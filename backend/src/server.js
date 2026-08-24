require('dotenv').config();
const app = require('./app');
const { testDbConnection } = require('./config/database');

const PORT = process.env.PORT;

const start = async () => {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();
