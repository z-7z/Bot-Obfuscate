require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const commandManager = require('./commands');
const database = require('./database');
const apiService = require('./services/api');
const obfuscationService = require('./services/obfuscation');
const { EMOTES } = require('./config/constants');

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildMessageTyping
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  }
});

// Bot ready event
client.on('ready', async () => {
  console.log(`[ForgeFuscator] Logged in as ${client.user.tag}!`);
  console.log(`[ForgeFuscator] Bot ID: ${client.user.id}`);
  console.log(`[ForgeFuscator] Servers: ${client.guilds.cache.size}`);
  
  // Check API connectivity
  const apiStatus = await apiService.checkHealth();
  if (apiStatus.available) {
    console.log(`[ForgeFuscator] API connected successfully (${apiStatus.responseTime}ms)`);
  } else {
    console.warn(`[ForgeFuscator] API connection failed: ${apiStatus.error}`);
  }

  // Set bot presence
  client.user.setPresence({
    activities: [{ name: 'Lua/Luau obfuscation', type: 0 }],
    status: 'online'
  });

  // Start cleanup interval
  setInterval(() => {
    obfuscationService.cleanupAllTempFiles();
  }, 3600000); // Every hour
});

// Message create event
client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Ignore messages without the prefix
  if (!message.content.startsWith(process.env.BOT_PREFIX || 'ff!')) return;

  // Handle command
  try {
    const handled = await commandManager.handleMessage(message);
    if (!handled) {
      // Unknown command
      await message.reply(`${EMOTES.error} Unknown command. Type "${process.env.BOT_PREFIX || 'ff!'}help" for available commands.`);
    }
  } catch (error) {
    console.error(`[ForgeFuscator] Error handling message:`, error);
    await message.reply(`${EMOTES.error} An error occurred while processing your request.`);
  }
});

// Interaction create event
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isSelectMenu()) return;

  try {
    const handled = await commandManager.handleInteraction(interaction);
    if (!handled) {
      console.log(`[ForgeFuscator] Unhandled interaction: ${interaction.customId}`);
    }
  } catch (error) {
    console.error(`[ForgeFuscator] Error handling interaction:`, error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `${EMOTES.error} An error occurred while processing your interaction.`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: `${EMOTES.error} An error occurred while processing your interaction.`,
        ephemeral: true
      });
    }
  }
});

// Error events
client.on('error', (error) => {
  console.error(`[ForgeFuscator] Discord client error:`, error);
});

process.on('uncaughtException', (error) => {
  console.error(`[ForgeFuscator] Uncaught exception:`, error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[ForgeFuscator] Unhandled rejection at:`, promise, `reason:`, reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log(`[ForgeFuscator] Shutting down...`);
  
  try {
    await client.destroy();
    database.close();
    console.log(`[ForgeFuscator] Clean shutdown complete.`);
    process.exit(0);
  } catch (error) {
    console.error(`[ForgeFuscator] Error during shutdown:`, error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log(`[ForgeFuscator] Received SIGTERM, shutting down...`);
  
  try {
    await client.destroy();
    database.close();
    console.log(`[ForgeFuscator] Clean shutdown complete.`);
    process.exit(0);
  } catch (error) {
    console.error(`[ForgeFuscator] Error during shutdown:`, error);
    process.exit(1);
  }
});

// Start the bot
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error(`[ForgeFuscator] DISCORD_TOKEN not found in environment variables.`);
  process.exit(1);
}

// Check required environment variables
const requiredVars = ['DISCORD_TOKEN', 'API_BASE_URL', 'API_KEY'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.warn(`[ForgeFuscator] Warning: ${varName} not set in environment variables.`);
  }
}

// Verify API is configured
if (!apiService.isConfigured()) {
  console.warn(`[ForgeFuscator] Warning: API is not properly configured. Obfuscation will not work.`);
}

console.log(`[ForgeFuscator] Starting bot...`);
client.login(token).catch((error) => {
  console.error(`[ForgeFuscator] Failed to login:`, error);
  process.exit(1);
});

// Export client for testing
module.exports = client;
