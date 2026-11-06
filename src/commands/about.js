const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const componentBuilder = require('../components');

class AboutCommand extends BaseCommand {
  constructor() {
    super('about', 'Display ForgeFuscator information', 5000);
  }

  async executeCommand(message, args) {
    const aboutMessage = this.buildAboutMessage();
    const components = componentBuilder.buildAboutComponents();

    return message.reply({
      content: aboutMessage,
      components
    });
  }

  buildAboutMessage() {
    return `${EMOTES.question} **About ForgeFuscator**

**Description:**
ForgeFuscator is a professional Discord bot dedicated to Lua and Luau obfuscation. All obfuscation is performed by an external API, ensuring security and reliability.

**Features:**
${EMOTES.lua} Lua and Luau support
${EMOTES.files} File attachment processing
${EMOTES.tools} Persistent user settings
${EMOTES.accept} Credits system
${EMOTES.question} Operation history
${EMOTES.tools} Privacy protection

**Architecture:**
- API-based obfuscation (no local processing)
- Discord.js with Components V2
- SQLite for persistent storage
- Secure file handling
- Privacy-first design

**Supported Files:**
- .lua files
- .luau files
- .txt files
- Files without extensions (validated as Lua/Luau)

**Version:** 1.0.0
**Developer:** ForgeFuscator Team

**Privacy Notice:**
All sensitive operations (obfuscation, profile, history) are handled privately via DMs in servers to protect your source code and data.`;
  }

  buildStatsMessage() {
    return `${EMOTES.question} **ForgeFuscator Statistics**

**Bot Information:**
- Version: 1.0.0
- Uptime: ${this.formatUptime(process.uptime())}
- Total Users: ${this.getTotalUsers()}
- Total Operations: ${this.getTotalOperations()}

**Supported Languages:**
- Lua
- Luau

**API Features:**
- Anti-Tamper
- Anti-Hook
- VM Renaming
- Encrypted VM
- Control Flow Obfuscation
- Runtime State Chain
- Lazy Regions
- Sensitive Profiles`;
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  getTotalUsers() {
    // This would query the database
    const database = require('../database/index');
    return database.getTotalUsers();
  }

  getTotalOperations() {
    const database = require('../database/index');
    return database.getTotalOperations();
  }

  async handleInfoInteraction(interaction) {
    const aboutMessage = this.buildAboutMessage();
    const components = componentBuilder.buildAboutComponents();

    await interaction.update({
      content: aboutMessage,
      components
    });
  }

  async handleStatsInteraction(interaction) {
    const statsMessage = this.buildStatsMessage();
    const components = componentBuilder.buildAboutComponents();

    await interaction.update({
      content: statsMessage,
      components
    });
  }
}

module.exports = new AboutCommand();
