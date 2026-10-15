const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array(),
    });
  }
  next();
};
