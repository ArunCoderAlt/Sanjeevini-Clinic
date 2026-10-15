const { createSupabaseModel } = require('../utils/supabaseModel');

const GroqUsageLog = createSupabaseModel('groq_usage_logs');

module.exports = GroqUsageLog;
