const { createSupabaseModel } = require('../utils/supabaseModel');

const Reel = createSupabaseModel('reels');

module.exports = Reel;
