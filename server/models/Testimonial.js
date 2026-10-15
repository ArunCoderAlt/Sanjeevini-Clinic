const { createSupabaseModel } = require('../utils/supabaseModel');

const Testimonial = createSupabaseModel('testimonials');

module.exports = Testimonial;
