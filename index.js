require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load slash commands from /commands folder
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Set up Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Base route
app.get("/", (req, res) => {
  res.send("✅ AmbiBot is online.");
});

// Load the /check-license route
const checkLicenseRoute = require("./utils/checkLicense");
app.use("/", checkLicenseRoute);

// Start the Express server
app.listen(PORT, () => {
  console.log(`🌐 Webhook server running on port ${PORT}`);
});

// Handle slash command interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error("⚠️ Error executing command:", err);
    await interaction.reply({
      content: "There was an error executing this command.",
      ephemeral: true,
    });
  }
});

// Log when the bot is online
client.once("ready", () => {
  console.log(`✅ AmbiBot is online as ${client.user.tag}`);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
