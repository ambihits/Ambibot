const { SlashCommandBuilder } = require("discord.js");
const { checkKeyUsed } = require("../utils/keyStore");
const { storeRedemption } = require("../utils/supabase");
const { getSupabaseClient } = require("../utils/supabase");
const supabase = require('../utils/supabase');



module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a license key")
    .addStringOption(option =>
      option
        .setName("key")
        .setDescription("Enter your license key (xxxx-xxxx-xxxx format)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const key = interaction.options.getString("key").toUpperCase();
    const discord_id = interaction.user.id;

    const isValid = !checkKeyUsed(key);
    if (!isValid) {
      await interaction.reply({
        content: "❌ This key is invalid or already used.",
        ephemeral: true,
      });
      return;
    }

    const role = key.startsWith("TRIAL") ? "Trial" : "Premier User";
    const duration = key.startsWith("TRIAL") ? 3 : 30;

    const now = new Date();
    const expires_at = new Date(now);
    expires_at.setDate(now.getDate() + duration);

    const result = await storeRedemption({
      key,
      discord_id,
      role,
      redeemed_at: now.toISOString(),
      expires_at: expires_at.toISOString(),
    });

    if (result.error) {
      console.error("❌ Failed to store redemption:", result.error);
      await interaction.reply({
        content: "❌ There was a problem saving your key.",
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    const member = await guild.members.fetch(discord_id);
    const discordRole = guild.roles.cache.find(r => r.name === role);

    if (discordRole) {
      await member.roles.add(discordRole);
    }

    await interaction.reply({
      content: `✅ Your ${role} license has been activated!`,
      ephemeral: true,
    });
  },
};
