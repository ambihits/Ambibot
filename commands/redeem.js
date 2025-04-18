const { SlashCommandBuilder } = require("discord.js");
const { getSupabaseClient } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem your license key")
    .addStringOption(option =>
      option.setName("key")
        .setDescription("Your license key")
        .setRequired(true)
    ),

  async execute(interaction) {
    const supabase = getSupabaseClient();

    const key = interaction.options.getString("key");
    const discord_id = interaction.user.id;

    console.log(`🔑 /redeem called by Discord ID: ${discord_id} with key: ${key}`);

    // Check if key is already redeemed
    const { data: existing, error: fetchError } = await supabase
      .from("redemptions")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Supabase fetch error:", fetchError);
      return interaction.reply({ content: "Error checking the key.", ephemeral: true });
    }

    if (existing) {
      return interaction.reply({ content: "This key has already been used.", ephemeral: true });
    }

    const now = new Date();
    let expires_at;
    let role;

    if (key.startsWith("TRIAL")) {
      role = "Trial";
      expires_at = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    } else {
      role = "Premier User";
      expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    const { error: insertError } = await supabase
      .from("redemptions")
      .insert([{
        key,
        discord_id,
        role,
        redeemed_at: now.toISOString(),
        expires_at: expires_at.toISOString()
      }]);

    if (insertError) {
      console.error("🔥 Supabase insert error:", insertError);
      return interaction.reply({ content: "Failed to redeem key.", ephemeral: true });
    }

    await interaction.reply({ content: `✅ License redeemed! Role: **${role}** | Expires: <t:${Math.floor(expires_at.getTime() / 1000)}:R>`, ephemeral: true });
  },
};



