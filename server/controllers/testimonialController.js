const Testimonial = require('../models/Testimonial');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { notifyNewTestimonial } = require('../services/notificationService');

exports.getTestimonials = asyncHandler(async (req, res) => {
  const isAdmin = (req.user && req.user.role === 'admin') || req.query.all === 'true';
  const filter = isAdmin ? {} : { isApproved: true };
  const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
  return success(res, testimonials);
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const { name, review, rating, location, treatment } = req.body;
  const isAdmin = req.user && req.user.role === 'admin';
  const isApproved = isAdmin && req.body.isApproved !== undefined ? Boolean(req.body.isApproved) : false;
  const isFeatured = isAdmin && req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : false;
  
  const testimonial = await Testimonial.create({
    name,
    review,
    rating,
    location,
    treatment,
    isApproved,
    isFeatured,
  });
  await notifyNewTestimonial(testimonial);
  return success(res, testimonial, isAdmin ? 'Testimonial created successfully' : 'Testimonial submitted and pending approval', 201);
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
