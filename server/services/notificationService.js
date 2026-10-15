const { sendEmail } = require('./emailService');
const env = require('../config/environment');

exports.notifyNewAppointment = async (appointment) => {
  const msg = `New appointment request from ${appointment.name}.\nPhone: ${appointment.phone}\nService: ${appointment.service}\nDate: ${appointment.preferredDate}`;
  await sendEmail({
    email: env.emailUser,
    subject: 'New Appointment Request',
    message: msg,
  }).catch(console.error);
};

exports.notifyNewContact = async (contact) => {
  const msg = `New contact message from ${contact.name}.\nEmail: ${contact.email}\nMessage: ${contact.message}`;
  await sendEmail({
    email: env.emailUser,
    subject: 'New Contact Message',
    message: msg,
  }).catch(console.error);
};

exports.notifyNewTestimonial = async (test) => {
  const msg = `New testimonial from ${test.name} pending approval.\nRating: ${test.rating}\nReview: ${test.review}`;
  await sendEmail({
    email: env.emailUser,
    subject: 'New Testimonial Pending Approval',
    message: msg,
  }).catch(console.error);
};
