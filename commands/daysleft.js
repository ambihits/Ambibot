const { SlashCommandBuilder } = require("discord.js");
const { getDaysLeft } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license"),
  async execute(interaction) {
    const userId = interaction.user.id;
    const daysLeft = await getDaysLeft(userId);

    if (daysLeft === null) {
      return interaction.reply({ content: "❌ You haven’t redeemed a license key yet.", ephemeral: true });
    }

    return interaction.reply({
      content: `🧾 You have **${daysLeft} day${daysLeft === 1 ? "" : "s"}** remaining on your license.`,
      ephemeral: true
    });
  }
};
