const { createClient } = require('@supabase/supabase-js');
const env = require('./environment');
const logger = require('../utils/logger');

let supabase = null;

const initSupabase = () => {
  if (supabase) return supabase;

  const url = env.supabaseUrl;
  const key = env.supabaseKey;

  if (!url || !key) {
    logger.warn('Supabase URL or Key is missing in environment variables (.env).');
    return null;
  }

  try {
    supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabase;
  } catch (err) {
    logger.error(`Failed to initialize Supabase client: ${err.message}`);
    return null;
  }
};

// Eager initialize if env vars are present
initSupabase();

const getSupabase = () => {
  if (!supabase) {
    const client = initSupabase();
    if (!client) {
      throw new Error(
        'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY in your server/.env file.'
      );
    }
    return client;
  }
  return supabase;
};

const testSupabaseConnection = async () => {
  const url = env.supabaseUrl;
  if (!url || !env.supabaseKey || url.includes('your-project-id.supabase.co')) {
    return { connected: false, error: 'Placeholder credentials or missing environment variables' };
  }

  try {
    const client = getSupabase();
    // Query site_settings or any table to verify connection
    const { data, error } = await client.from('site_settings').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { connected: false, error: error.message };
    }
    return { connected: true, data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};

module.exports = {
  supabase,
  getSupabase,
  testSupabaseConnection,
};
