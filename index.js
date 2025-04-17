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

// Load slash commands from /commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Setup Express Web API
const app = express();

// Root test
app.get("/", (req, res) => {
  res.send("✅ AmbiBot is online");
});

// AIMsharp license check endpoint
app.get("/license-status/:discord_id", async (req, res) => {
  const { discord_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("discord_id", discord_id)
      .order("redeemed_at", { ascending: false })
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ valid: false, message: "License not found." });
    }

    const now = new Date();
    const expires = new Date(data.expires_at);
    const msLeft = expires - now;
    const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));

    return res.json({
      valid: expires > now,
      role: data.role,
      daysLeft,
      expiresAt: data.expires_at
    });

  } catch (err) {
    console.error("License check error:", err);
    return res.status(500).json({ valid: false, message: "Server error." });
  }
});

// Start webhook server (use Railway's assigned port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webhook server running on port ${PORT}`);
});

// Discord event handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error("Command execution error:", err);
    await interaction.reply({
      content: "There was an error executing this command.",
      ephemeral: true
    });
  }
});

// Bot ready message
client.once("ready", () => {
  console.log(`✅ AmbiBot is online as ${client.user.tag}`);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
