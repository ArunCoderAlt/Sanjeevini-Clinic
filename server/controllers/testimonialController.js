const Testimonial = require('../models/Testimonial');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { notifyNewTestimonial } = require('../services/notificationService');

exports.getTestimonials = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const filter = isAdmin ? {} : { isApproved: true };
  const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
  return success(res, testimonials);
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const { name, review, rating, location, treatment } = req.body;
  const testimonial = await Testimonial.create({
    name,
    review,
    rating,
    location,
    treatment,
    isApproved: false,
  });
  await notifyNewTestimonial(testimonial);
  return success(res, testimonial, 'Testimonial submitted and pending approval', 201);
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) return error(res, 'Testimonial not found', 404);
  return success(res, testimonial, 'Testimonial updated');
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return error(res, 'Testimonial not found', 404);
  return success(res, null, 'Testimonial deleted');
});
