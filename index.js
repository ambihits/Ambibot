const express = require("express");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const { validateKey } = require("./utils/keyStore");

const app = express();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

const redeem = require("./commands/redeem");
const daysleft = require("./commands/daysleft");
client.commands.set("redeem", redeem);
client.commands.set("daysleft", daysleft);

client.once("ready", () => {
  console.log(`✅ AmbiBot is online as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) {
    await command.execute(interaction, client);
  }
});

// Webhook for Sell.app
app.use(express.json());
app.post("/sellapp", async (req, res) => {
  const { license, metadata } = req.body;
  const key = license?.key;
  const discordId = metadata?.discord_id;

  if (!key || !discordId) return res.sendStatus(400);

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const member = await guild.members.fetch(discordId).catch(() => null);

  if (member) {
    const roleName = key.startsWith("TRIAL") ? process.env.ROLE_TRIAL : process.env.ROLE_ALL_ACCESS;
    const role = guild.roles.cache.get(roleName);
    if (role) await member.roles.add(role);
    console.log(`✅ Assigned ${role.name} to ${member.user.username}`);
  }

  res.sendStatus(200);
});

client.login(process.env.DISCORD_TOKEN);
app.listen(process.env.PORT || 3000, () => console.log("🌐 Webhook server running"));
