const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers } = require('../controllers/newsletterController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { newsletterValidation } = require('../validators/newsletterValidator');
const { validate } = require('../middleware/validationMiddleware');

router.post('/subscribe', newsletterValidation, validate, subscribe);
router.post('/unsubscribe', newsletterValidation, validate, unsubscribe);
router.get('/', protect, admin, getSubscribers);

module.exports = router;
