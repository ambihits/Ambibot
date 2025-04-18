// commands/extend.js

const { SlashCommandBuilder } = require("discord.js");
const { supabase } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Extend a user's license manually.")
    .addStringOption(option =>
      option.setName("user")
        .setDescription("The Discord user ID or mention")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("days")
        .setDescription("Number of days to extend")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userInput = interaction.options.getString("user");
    const days = interaction.options.getInteger("days");

    // Normalize Discord ID from mention or raw
    const discord_id = userInput.replace(/[<@!>]/g, "");

    console.log(`🔧 /extend called for Discord ID: ${discord_id} with days: ${days}`);

    const { data, error } = await supabase
      .from("redemptions")
      .update({
        expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq("discord_id", discord_id);

    if (error) {
      console.error("🔥 Supabase Update Error:", error);
      await interaction.reply({ content: "Failed to extend the license.", ephemeral: true });
    } else {
      await interaction.reply({ content: `✅ Extended license for <@${discord_id}> by ${days} days.`, ephemeral: true });
    }
  }
};
