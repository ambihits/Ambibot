require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

function getSupabaseClient() {
  console.log("🔍 LIVE ENV CHECK");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
  console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "[FOUND]" : "[MISSING]");

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

module.exports = { getSupabaseClient };






