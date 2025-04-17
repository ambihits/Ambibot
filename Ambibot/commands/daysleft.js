const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license"),
  async execute(interaction) {
    // Placeholder — we can wire to a backend later
    interaction.reply({ content: "⏳ This feature is coming soon. Your key is active, but days remaining tracking will be added shortly.", ephemeral: true });
  }
};
