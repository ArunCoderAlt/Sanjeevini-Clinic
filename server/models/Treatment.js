const { createSupabaseModel } = require('../utils/supabaseModel');

const Treatment = createSupabaseModel('treatments');

module.exports = Treatment;
