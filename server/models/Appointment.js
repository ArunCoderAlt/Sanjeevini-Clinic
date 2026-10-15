const { createSupabaseModel } = require('../utils/supabaseModel');

const Appointment = createSupabaseModel('appointments');

module.exports = Appointment;
