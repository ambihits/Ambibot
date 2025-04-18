require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");

// ⛔ ENV Checks
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error("❌ Missing required environment variables.");
  console.log("✅ Please confirm the following are in your .env:");
  console.log("DISCORD_TOKEN=...");
  console.log("CLIENT_ID=...");
  console.log("GUILD_ID=...");
  process.exit(1);
}

// 📁 Commands folder scan
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ Skipping ${file}: missing "data" or "execute".`);
  }
}

// 🚀 Register Commands
const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`⌛ Registering ${commands.length} slash commands...`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log("✅ Slash commands registered successfully.");
  } catch (error) {
    console.error("❌ Failed to register slash commands:");
    console.error(error);
  }
})();
