const env = require('../config/environment');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
  }
  res.status(statusCode).json({
    success: false,
    message: statusCode === 400 && err instanceof SyntaxError ? 'Invalid JSON format in request body' : (err.message || 'Server Error'),
    stack: env.nodeEnv === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
