const { body } = require('express-validator');

exports.testimonialValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('review').trim().notEmpty().withMessage('Review is required').isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('location').optional().trim(),
  body('treatment').optional().trim(),
];
