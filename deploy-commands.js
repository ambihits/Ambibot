const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a license key for access")
    .addStringOption(option =>
      option.setName("key")
        .setDescription("Your license key")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license")
]
  .map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⌛ Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered successfully.");
  } catch (error) {
    console.error("❌ Failed to register slash commands:", error);
  }
})();
