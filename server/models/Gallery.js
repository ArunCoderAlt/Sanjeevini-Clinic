const { createSupabaseModel } = require('../utils/supabaseModel');

const Gallery = createSupabaseModel('gallery');

module.exports = Gallery;
