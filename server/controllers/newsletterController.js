const Newsletter = require('../models/Newsletter');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

exports.subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
      return success(res, existing, 'Resubscribed successfully');
    }
    return error(res, 'Email already subscribed', 400);
  }
  const sub = await Newsletter.create({ email });
  return success(res, sub, 'Subscribed successfully', 201);
});

exports.unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const sub = await Newsletter.findOneAndUpdate({ email }, { isActive: false }, { new: true });
  if (!sub) return error(res, 'Subscription not found', 404);
  return success(res, sub, 'Unsubscribed successfully');
});

exports.getSubscribers = asyncHandler(async (req, res) => {
  const subs = await Newsletter.find().sort({ subscribedAt: -1 });
  return success(res, subs);
});
