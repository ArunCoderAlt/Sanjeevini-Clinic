const jwt = require('jsonwebtoken');
const env = require('../config/environment');

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
};

module.exports = generateToken;
