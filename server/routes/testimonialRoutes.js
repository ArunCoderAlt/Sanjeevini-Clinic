const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { testimonialValidator } = require('../validators/testimonialValidator');
const { validate } = require('../middleware/validationMiddleware');
const { submissionLimiter } = require('../middleware/rateLimitMiddleware');

router.route('/')
  .get(optionalAuth, getTestimonials)
  .post(submissionLimiter, optionalAuth, testimonialValidator, validate, createTestimonial);

router.route('/:id')
  .put(protect, admin, updateTestimonial)
  .delete(protect, admin, deleteTestimonial);

module.exports = router;
