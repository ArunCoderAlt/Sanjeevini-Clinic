require('dotenv').config();
const Service = require('../models/Service');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const services = [
  {
    title: 'Varmam Therapy',
    slug: 'varmam-therapy',
    shortDescription: 'Traditional therapeutic technique targeting vital energy points',
    order: 1
  },
  {
    title: 'Thokkanam Therapy',
    slug: 'thokkanam-therapy',
    shortDescription: 'Traditional Siddha massage therapy for healing',
    order: 2
  },
  {
    title: 'Wellness Support',
    slug: 'wellness-support',
    shortDescription: 'Holistic wellness and preventive care programs',
    order: 3
  }
];

const seedServices = async () => {
  try {
    await connectDB();
    await Service.deleteMany();
    await Service.insertMany(services);
    logger.info('Services seeded');
    process.exit(0);
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

seedServices();
