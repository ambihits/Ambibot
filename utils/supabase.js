// utils/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Log environment values for debugging
console.log("\n🔍 LIVE ENV CHECK");
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_ANON_KEY:", supabaseKey ? "[FOUND]" : "undefined");

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;





