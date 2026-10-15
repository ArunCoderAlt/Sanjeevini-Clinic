const express = require('express');
const router = express.Router();
const { getTreatments, getTreatmentById, getTreatmentBySlug, getTreatmentCategories, createTreatment, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .get(getTreatments)
  .post(protect, admin, createTreatment);

router.get('/categories', getTreatmentCategories);
router.get('/slug/:slug', getTreatmentBySlug);

router.route('/:id')
  .get(getTreatmentById)
  .put(protect, admin, updateTreatment)
  .delete(protect, admin, deleteTreatment);

module.exports = router;
