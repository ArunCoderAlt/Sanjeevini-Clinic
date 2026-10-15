const { createSupabaseModel } = require('../utils/supabaseModel');

const SiteSettings = createSupabaseModel('site_settings');

module.exports = SiteSettings;
