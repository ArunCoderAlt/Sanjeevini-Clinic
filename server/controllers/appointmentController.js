const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { notifyNewAppointment } = require('../services/notificationService');

exports.createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create(req.body);
  await notifyNewAppointment(appointment);
  return success(res, appointment, 'Appointment booked successfully', 201);
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
  return success(res, appointments);
});

exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return error(res, 'Appointment not found', 404);
  return success(res, appointment);
});

exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!appointment) return error(res, 'Appointment not found', 404);
  return success(res, appointment, 'Appointment status updated');
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) return error(res, 'Appointment not found', 404);
  return success(res, null, 'Appointment deleted successfully');
});
