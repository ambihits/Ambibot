const { REST, Routes } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !guildId || !token) {
  console.error("❌ Missing CLIENT_ID, GUILD_ID, or DISCORD_TOKEN in .env");
  process.exit(1);
}

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("⌛ Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log("✅ Successfully registered application commands.");
  } catch (error) {
    console.error("❌ Failed to register slash commands:", error);
  }
})();

