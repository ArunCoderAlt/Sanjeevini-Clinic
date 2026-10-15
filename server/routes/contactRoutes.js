const express = require('express');
const router = express.Router();
const { submitContact, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { contactValidation } = require('../validators/contactValidator');
const { validate } = require('../middleware/validationMiddleware');
const { contactLimiter } = require('../middleware/rateLimitMiddleware');

router.route('/')
  .post(contactLimiter, contactValidation, validate, submitContact)
  .get(protect, admin, getMessages);

router.put('/:id/read', protect, admin, markAsRead);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;
