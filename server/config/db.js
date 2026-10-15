const env = require('./environment');
const logger = require('../utils/logger');
const { testSupabaseConnection } = require('./supabase');

const connectDB = async () => {
  try {
    if (!env.supabaseUrl || !env.supabaseKey) {
      logger.warn('⚠️ Supabase credentials are not set in server/.env.');
      logger.warn('Please add SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) to server/.env.');
      logger.warn('Run supabase/schema.sql in your Supabase SQL editor to create the database tables.');
      return;
    }

    const { connected, error } = await testSupabaseConnection();
    if (connected) {
      logger.info(`✅ Supabase Database Connected: ${env.supabaseUrl}`);
    } else {
      logger.warn(`⚠️ Supabase connection test returned an error: ${error}`);
      logger.warn('Ensure you have executed supabase/schema.sql in your Supabase project.');
    }
  } catch (error) {
    logger.error(`Database Connection Error: ${error.message}`);
  }
};

const disconnectDB = async () => {
  // Supabase REST client is stateless / connection pooled
  return Promise.resolve();
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
