const { createSupabaseModel } = require('../utils/supabaseModel');

const GroqKeyPeriod = createSupabaseModel('groq_key_periods');

module.exports = GroqKeyPeriod;
