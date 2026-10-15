const express = require('express');
const router = express.Router();
const { getServices, getServiceById, getServiceBySlug, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .get(getServices)
  .post(protect, admin, createService);

router.get('/slug/:slug', getServiceBySlug);

router.route('/:id')
  .get(getServiceById)
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);

module.exports = router;
