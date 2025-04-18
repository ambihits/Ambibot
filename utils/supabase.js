const { createClient } = require('@supabase/supabase-js');

console.log('🔍 LIVE ENV CHECK');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[FOUND]' : '[MISSING]');

// Create and export a single shared Supabase client instance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;




