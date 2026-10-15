require('dotenv').config();
const Doctor = require('../models/Doctor');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const doctors = [
  {
    name: 'Dr. Thiagarajan Saminadane',
    slug: 'thiagarajan-saminadane',
    qualification: 'MD (Siddha)',
    specialization: 'Siddha',
    experience: 20,
    bio: 'Expert in Siddha diagnostic methods and comprehensive health assessment.',
    order: 1
  },
  {
    name: 'Dr. Subashini Ganesan',
    slug: 'subashini-ganesan',
    qualification: 'BAMS (Ayurveda)',
    specialization: 'Ayurveda',
    experience: 15,
    bio: 'Expert in Ayurvedic treatments and holistic wellness.',
    order: 2
  }
];

const seedDoctors = async () => {
  try {
    await connectDB();
    await Doctor.deleteMany();
    await Doctor.insertMany(doctors);
    logger.info('Doctors seeded');
    process.exit(0);
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

seedDoctors();
