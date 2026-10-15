const { error } = require('../utils/apiResponse');

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return error(res, 'Not authorized as an admin', 403);
  }
};
