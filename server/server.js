const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const env = require('./config/environment');

// Connect to database
connectDB();

const PORT = process.env.PORT || env.port || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${PORT} (0.0.0.0)`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
