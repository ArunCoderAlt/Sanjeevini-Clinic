const SwarnaBindu = require('../models/SwarnaBindu');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getSupabase } = require('../config/supabase');
const env = require('../config/environment');

const isSupabaseConfigured = () => {
  const url = env.supabaseUrl;
  const key = env.supabaseKey;
  return Boolean(url && key && !url.includes('your-project-id.supabase.co'));
};

exports.getEvents = asyncHandler(async (req, res) => {
  const filterActive = req.query.all !== 'true';
  let events = [];

  // Directly fetch from live Supabase database with zero fallback injection
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase();
      let query = client.from('swarna_bindu').select('*').order('order_index', { ascending: true });
      if (filterActive) {
        query = query.eq('is_active', true);
      }
      const { data, error: dbErr } = await query;
      if (!dbErr && Array.isArray(data)) {
        events = data.map((r) => {
          const isNext = r.notes && String(r.notes).includes('[SPOTLIGHT]');
          return {
            id: r.id,
            _id: r.id,
            month: r.month,
            date: r.date,
            day: r.day,
            nakshatra: r.nakshatra || 'Pushya (Poosam)',
            timings: r.timings || '5:00 PM – 9:30 PM',
            venue: r.venue || 'Sanjeevini Medical Centre, Karaikal',
            status: isNext ? 'Next Camp' : r.status,
            notes: String(r.notes || '').replace(/\s*\[SPOTLIGHT\]\s*/g, '').trim(),
            order: r.order_index,
            order_index: r.order_index,
            isActive: r.is_active,
            is_active: r.is_active,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          };
        });
      }
    } catch (_) {
      events = [];
    }
  }

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
