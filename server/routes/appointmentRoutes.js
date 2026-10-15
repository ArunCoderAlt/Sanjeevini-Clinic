const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, getAppointmentById, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { appointmentValidation } = require('../validators/appointmentValidator');
const { validate } = require('../middleware/validationMiddleware');

router.route('/')
  .post(appointmentValidation, validate, createAppointment)
  .get(protect, admin, getAppointments);

router.route('/:id')
  .get(protect, admin, getAppointmentById)
  .delete(protect, admin, deleteAppointment);

router.put('/:id/status', protect, admin, updateAppointmentStatus);

module.exports = router;
