require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

console.log("🔍 LIVE ENV CHECK");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL || "undefined");
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "[FOUND]" : "undefined");
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "[FOUND]" : "undefined");
console.log("CLIENT_ID:", process.env.CLIENT_ID || "undefined");
console.log("GUILD_ID:", process.env.GUILD_ID || "undefined");

const commands = [

  // ✅ /redeem
  new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem your license key.")
    .addStringOption(option =>
      option.setName("key")
        .setDescription("Your license key")
        .setRequired(true)
    ),

  // ✅ /daysleft
  new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license."),

  // ✅ /extend (admin only)
  new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Admin command to extend a user’s license.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The Discord user to extend")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("days")
        .setDescription("Number of days to extend")
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⌛ Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered successfully.");
  } catch (error) {
    console.error("❌ Failed to register slash commands:", error);
  }
})();


