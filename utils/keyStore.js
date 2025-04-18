// utils/keyStore.js
const { getSupabaseClient } = require('./supabase');

async function checkKeyExists(key) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('valid_keys')
    .select('*')
    .eq('key', key)
    .single();

  if (error) {
    console.error("❌ Supabase error checking key:", error);
    return null;
  }

  return data;
}

async function markKeyUsed(key, discord_id, role, redeemed_at, expires_at) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('valid_keys')
    .update({
      used: true,
      discord_id,
      role,
      redeemed_at,
      expires_at
    })
    .eq('key', key);

  if (error) {
    console.error("❌ Supabase error marking key used:", error);
    return false;
  }

  return true;
}

async function extendLicense(discord_id, extraDays) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('valid_keys')
    .select('*')
    .eq('discord_id', discord_id)
    .single();

  if (error || !data) {
    console.error("❌ Supabase error fetching license for extend:", error);
    return false;
  }

  const newExpiration = new Date(data.expires_at);
  newExpiration.setDate(newExpiration.getDate() + extraDays);

  const { error: updateError } = await supabase
    .from('valid_keys')
    .update({ expires_at: newExpiration.toISOString() })
    .eq('discord_id', discord_id);

  return !updateError;
}

async function getDaysLeft(discord_id) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('valid_keys')
    .select('expires_at')
    .eq('discord_id', discord_id)
    .single();

  if (error || !data) return null;

  const now = new Date();
  const expires = new Date(data.expires_at);
  const msDiff = expires - now;
  const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));

  return {
    daysLeft,
    expires_at: expires
  };
}

module.exports = {
  checkKeyExists,
  markKeyUsed,
  extendLicense,
  getDaysLeft
};
