const { createSupabaseModel } = require('../utils/supabaseModel');

const Newsletter = createSupabaseModel('newsletters');

module.exports = Newsletter;
