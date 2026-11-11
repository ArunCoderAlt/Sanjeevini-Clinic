const SwarnaBindu = require('../models/SwarnaBindu');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

exports.getEvents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }
  const events = await SwarnaBindu.find(filter).sort({ order: 1, date: 1, createdAt: 1 });
  return success(res, events);
});

exports.getEventById = asyncHandler(async (req, res) => {
  const event = await SwarnaBindu.findById(req.params.id);
  if (!event) return error(res, 'Swarna Bindu event not found', 404);
  return success(res, event);
});

exports.createEvent = asyncHandler(async (req, res) => {
  const event = await SwarnaBindu.create(req.body);
  return success(res, event, 'Swarna Bindu event created successfully', 201);
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await SwarnaBindu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) return error(res, 'Swarna Bindu event not found', 404);
  return success(res, event, 'Swarna Bindu event updated');
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await SwarnaBindu.findByIdAndDelete(req.params.id);
  if (!event) return error(res, 'Swarna Bindu event not found', 404);
  return success(res, null, 'Swarna Bindu event deleted');
});
