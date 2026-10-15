const { body } = require('express-validator');

exports.newsletterValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];
