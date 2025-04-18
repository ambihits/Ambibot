const { SlashCommandBuilder } = require("discord.js");
const { supabase } = require("../utils/supabase");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Extend a user's license by days")
    .addStringOption(option =>
      option
        .setName("user")
        .setDescription("Discord ID of the user")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("days")
        .setDescription("Number of days to extend")
        .setRequired(true)
    ),

  async execute(interaction) {
    const discord_id = interaction.options.getString("user");
    const days = interaction.options.getInteger("days");

    console.log(`🔧 /extend called for Discord ID: ${discord_id} with days: ${days}`);

    if (!discord_id || !days) {
      await interaction.reply({
        content: "❌ Please provide both a user ID and number of days.",
        ephemeral: true,
      });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("❌ Supabase client is undefined.");
      await interaction.reply({
        content: "❌ Internal error — Supabase not connected.",
        ephemeral: true,
      });
      return;
    }

    const now = new Date();
    const expires_at = new Date(now);
    expires_at.setDate(now.getDate() + days);

    const { error } = await supabase
      .from("redemptions")
      .update({ expires_at })
      .eq("discord_id", discord_id);

    if (error) {
      console.error("🔥 Supabase Extend Error:", error);
      await interaction.reply({
        content: "❌ Failed to extend license. Check logs for details.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `✅ Successfully extended license for <@${discord_id}> by ${days} days.`,
        ephemeral: false,
      });
    }
  },
};


