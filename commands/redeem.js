const { SlashCommandBuilder } = require("discord.js");
const { getSupabaseClient } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem your license key")
    .addStringOption(option =>
      option.setName("key").setDescription("Your license key").setRequired(true)
    ),
  async execute(interaction) {
    const supabase = getSupabaseClient();
    const key = interaction.options.getString("key").trim();
    const discordId = interaction.user.id;

    // Fetch the key from Supabase
    const { data, error } = await supabase
      .from("valid_keys")
      .select("*")
      .eq("key", key)
      .single();

    if (error || !data) {
      return interaction.reply({ content: "❌ Invalid license key.", ephemeral: true });
    }

    if (data.used) {
      return interaction.reply({ content: "❌ This key has already been redeemed.", ephemeral: true });
    }

    const now = new Date();
    const expiresAt = new Date(
      data.type === "Trial"
        ? now.getTime() + 3 * 24 * 60 * 60 * 1000
        : now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const { error: updateError } = await supabase
      .from("valid_keys")
      .update({
        used: true,
        redeemed_by: discordId,
        redeemed_at: now.toISOString()
      })
      .eq("key", key);

    if (updateError) {
      return interaction.reply({ content: "❌ Error redeeming key. Try again later.", ephemeral: true });
    }

    await supabase
      .from("redemptions")
      .insert({
        key,
        discord_id: discordId,
        role: data.type,
        redeemed_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      });

    interaction.reply({
      content: `✅ Successfully redeemed **${data.type}** key. Expires <t:${Math.floor(expiresAt.getTime() / 1000)}:R>.`,
      ephemeral: true
    });
  }
};


