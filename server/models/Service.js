const { createSupabaseModel } = require('../utils/supabaseModel');

const Service = createSupabaseModel('services');

module.exports = Service;
