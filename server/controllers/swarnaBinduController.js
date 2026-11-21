const SwarnaBindu = require('../models/SwarnaBindu');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

exports.getEvents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  let events = await SwarnaBindu.find(filter).sort({ order: 1, date: 1, createdAt: 1 });
  if (req.query.status && req.query.status !== 'all') {
    events = events.filter((e) => e.status === req.query.status);
  }
  return success(res, events);
});

exports.getEventById = asyncHandler(async (req, res) => {
  const event = await SwarnaBindu.findById(req.params.id);
  if (!event) return error(res, 'Swarna Bindu event not found', 404);
  return success(res, event);
});

exports.createEvent = asyncHandler(async (req, res) => {
  if (req.body && req.body.status === 'Next Camp') {
    try {
      const allEvents = await SwarnaBindu.find({});
      for (const ev of allEvents) {
        if (ev.status === 'Next Camp') {
          const evId = ev.id || ev._id;
          await SwarnaBindu.findByIdAndUpdate(evId, { ...ev, status: 'Upcoming' });
        }
      }
    } catch (_) {}
  }
  const event = await SwarnaBindu.create(req.body);
  return success(res, event, 'Swarna Bindu event created successfully', 201);
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  // When setting an item as Next Camp, clear Spotlight from any previous Next Camp item
  if (req.body && req.body.status === 'Next Camp') {
    try {
      const allEvents = await SwarnaBindu.find({});
      for (const ev of allEvents) {
        const evId = ev.id || ev._id;
        if (evId !== targetId && ev.status === 'Next Camp') {
          await SwarnaBindu.findByIdAndUpdate(evId, { ...ev, status: 'Upcoming' });
        }
      }
    } catch (_) {}
  }

  const event = await SwarnaBindu.findByIdAndUpdate(targetId, req.body, {
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
