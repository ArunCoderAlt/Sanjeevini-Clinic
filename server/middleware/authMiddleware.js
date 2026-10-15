const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');
const env = require('../config/environment');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return error(res, 'Not authorized, no token', 401);
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (!decoded || !decoded.id) {
      return error(res, 'Not authorized, invalid token payload', 401);
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return error(res, 'Not authorized, user not found or token expired', 401);
    }

    next();
  } catch (err) {
    return error(res, 'Not authorized, token failed', 401);
  }
});
