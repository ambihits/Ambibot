const { SlashCommandBuilder } = require("discord.js");
const { getSupabaseClient } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Extend a user's license")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to extend the license for")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("days")
        .setDescription("Number of days to extend the license")
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const extendDays = interaction.options.getInteger("days");
    const supabase = getSupabaseClient();

    console.log(`🔧 /extend called for Discord ID: ${targetUser.id} with days: ${extendDays}`);

    try {
      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("discord_id", targetUser.id);

      if (error) {
        console.error("❌ Supabase read error:", error);
        return interaction.reply({
          content: "There was an error fetching the user's license.",
          ephemeral: true
        });
      }

      if (!data || data.length === 0) {
        return interaction.reply({
          content: "No license found for this user.",
          ephemeral: true
        });
      }

      const currentLicense = data[0];
      const newExpiry = new Date(currentLicense.expires_at);
      newExpiry.setDate(newExpiry.getDate() + extendDays);

      const { error: updateError } = await supabase
        .from("redemptions")
        .update({ expires_at: newExpiry.toISOString() })
        .eq("discord_id", targetUser.id);

      if (updateError) {
        console.error("❌ Supabase update error:", updateError);
        return interaction.reply({
          content: "There was an error updating the license.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `✅ Successfully extended license for <@${targetUser.id}> by ${extendDays} days.`,
        ephemeral: false
      });

    } catch (err) {
      console.error("⚠️ Error executing command:", err);
      return interaction.reply({
        content: "An unexpected error occurred while trying to extend the license.",
        ephemeral: true
      });
    }
  }
};


