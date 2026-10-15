const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getDoctorBySlug, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .get(getDoctors)
  .post(protect, admin, createDoctor);

router.get('/slug/:slug', getDoctorBySlug);

router.route('/:id')
  .get(getDoctorById)
  .put(protect, admin, updateDoctor)
  .delete(protect, admin, deleteDoctor);

module.exports = router;
