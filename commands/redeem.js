const { SlashCommandBuilder } = require("discord.js");
const { storeRedemption } = require("../utils/supabase");
const { markKeyUsed, checkKeyUsed } = require("../utils/keyStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a license key.")
    .addStringOption(option =>
      option.setName("key").setDescription("Your license key").setRequired(true)
    ),

  async execute(interaction) {
    const key = interaction.options.getString("key");
    const discord_id = interaction.user.id;

    const isUsed = await checkKeyUsed(key);
    if (!isUsed.valid) {
      return interaction.reply({ content: isUsed.message, ephemeral: true });
    }

    const role = key.startsWith("TRIAL") ? "Trial" : "Premier User";
    const now = new Date();
    const expires_at = new Date(
      key.startsWith("TRIAL")
        ? now.getTime() + 3 * 24 * 60 * 60 * 1000
        : now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    await storeRedemption({
      key,
      discord_id,
      role,
      redeemed_at: now.toISOString(),
      expires_at: expires_at.toISOString()
    });

    await markKeyUsed(key);

    return interaction.reply({
      content: `✅ Successfully redeemed key! Your license expires <t:${Math.floor(expires_at.getTime() / 1000)}:R>.`,
      ephemeral: true
    });
  },
};



