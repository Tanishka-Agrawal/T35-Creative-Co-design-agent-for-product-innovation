let supabaseInstance = null;
let adminInstance = null;

async function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const { createClient } = await import('@supabase/supabase-js');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured; SUPABASE_URL or SUPABASE_ANON_KEY missing from environment');
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  }

  console.log('Supabase configured:', { supabaseUrl, anonKeySnippet: supabaseKey?.slice(0, 8) + '...' });
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
}

module.exports = getSupabase;

async function getAdminSupabase() {
  if (adminInstance) return adminInstance;
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  }
  adminInstance = createClient(supabaseUrl, supabaseKey);
  return adminInstance;
}

module.exports = getSupabase;
module.exports.getAdminSupabase = getAdminSupabase;
