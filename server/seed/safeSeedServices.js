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

const safeSeedServices = async () => {
  let inserted = 0;
  let skipped = 0;
  let exitCode = 0;
  try {
    await connectDB();
    for (const s of services) {
      const exists = await Service.findOne({ slug: s.slug });
      if (exists) {
        skipped += 1;
        logger.info(`Skip existing: ${s.slug}`);
        continue;
      }
      const result = await Service.create({ ...s, isActive: true });
      if (result && (result._id || result.id)) {
        inserted += 1;
        logger.info(`Inserted: ${s.slug}`);
      }
    }
    logger.info(`Results: inserted=${inserted}, skipped=${skipped}`);
  } catch (err) {
    exitCode = 1;
    logger.error(err.message);
  } finally {
    process.exitCode = exitCode;
  }
};

safeSeedServices();
