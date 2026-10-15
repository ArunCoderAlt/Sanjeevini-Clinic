require('dotenv').config();
const Treatment = require('../models/Treatment');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const categories = [
  'Gastrointestinal', 'Dermatology', "Women's Health", 'Kidney', 'Musculoskeletal',
  'Pediatrics', 'Respiratory', 'Neurology', 'Anorectal', "Men's Health", 'Other'
];

const treatments = categories.map((cat, i) => ({
  name: `${cat} Treatments`,
  slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  category: cat,
  description: `Holistic treatments for ${cat} conditions.`,
  order: i + 1
}));

const seedTreatments = async () => {
  try {
    await connectDB();
    await Treatment.deleteMany();
    await Treatment.insertMany(treatments);
    logger.info('Treatments seeded');
    process.exit(0);
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

seedTreatments();
