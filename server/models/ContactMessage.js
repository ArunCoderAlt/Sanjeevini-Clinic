const { createSupabaseModel } = require('../utils/supabaseModel');

const ContactMessage = createSupabaseModel('contact_messages');

module.exports = ContactMessage;
