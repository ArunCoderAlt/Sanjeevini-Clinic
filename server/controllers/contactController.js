const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { notifyNewContact } = require('../services/notificationService');

exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const newMsg = await ContactMessage.create({
    name,
    email,
    phone,
    subject: subject || 'General Inquiry',
    message,
    isRead: false,
  });

  // Non-blocking notification dispatch
  notifyNewContact(newMsg).catch(() => {});

  return success(res, newMsg, 'Message sent successfully', 201);
});

exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  return success(res, messages);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!message) return error(res, 'Message not found', 404);
  return success(res, message, 'Message marked as read');
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return error(res, 'Message not found', 404);
  return success(res, null, 'Message deleted');
});
