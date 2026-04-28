require('dotenv').config();
const connectDB = require('../config/db');
const seedDefaultUsers = require('../utils/seedDefaultUsers');

const run = async () => {
  try {
    await connectDB();
    await seedDefaultUsers();
    console.log('Seed script finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Seed script failed: ${error.message}`);
    process.exit(1);
  }
};

run();
