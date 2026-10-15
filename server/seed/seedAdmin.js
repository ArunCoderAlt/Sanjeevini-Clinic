require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  try {
    await connectDB();
    const adminExists = await User.findOne({ email: 'admin@sanjeevinisiddha.in' });
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.trim() === '') {
      logger.error('ADMIN_PASSWORD is missing or empty. Set it before seeding.');
      process.exit(1);
    }
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@sanjeevinisiddha.in',
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      logger.info('Admin user created');
    } else {
      logger.info('Admin already exists');
    }
    process.exit(0);
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

seedAdmin();
