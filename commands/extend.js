const { SlashCommandBuilder } = require("discord.js");
const { updateExpiration, extendAllUsers } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Extend a user's license or all users")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to extend (leave empty for all users)")
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("days")
        .setDescription("Number of days to extend")
        .setRequired(true)),

  async execute(interaction) {
    const adminId = "YOUR_DISCORD_ID"; // Replace with your own Discord ID

    if (interaction.user.id !== adminId) {
      return await interaction.reply({ content: "🚫 You are not authorized to use this command.", ephemeral: true });
    }

    const user = interaction.options.getUser("user");
    const days = interaction.options.getInteger("days");

    if (user) {
      const result = await updateExpiration(user.id, days);

      if (result.success) {
        await interaction.reply(`✅ License for <@${user.id}> extended by ${days} day(s). New expiration: ${result.newDate}`);
      } else {
        await interaction.reply(`❌ Failed to extend license for <@${user.id}>.`);
      }
    } else {
      const result = await extendAllUsers(days);
      if (result.success) {
        await interaction.reply(`✅ All users extended by ${days} day(s).`);
      } else {
        await interaction.reply("❌ Failed to extend licenses globally.");
      }
    }
  }
};
