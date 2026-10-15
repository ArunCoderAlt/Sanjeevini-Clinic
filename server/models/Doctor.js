const { createSupabaseModel } = require('../utils/supabaseModel');

const Doctor = createSupabaseModel('doctors');

module.exports = Doctor;
