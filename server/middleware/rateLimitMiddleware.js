const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

const isLoopback = (ip) => {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip === 'localhost'
  );
};

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // High ceiling so normal client browsing never hits 429
  limit: isDev ? 50000 : 2500,
  skip: (req) => isDev || isLoopback(req.ip) || req.path === '/auth/me',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 500 : 20,
  skip: (req) => isDev && isLoopback(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

exports.contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many form submissions, please try again after 15 minutes',
  },
});
