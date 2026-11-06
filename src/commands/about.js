const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const { V2MessageBuilder, createButton, createV2Message } = require('../utils/componentsV2');

class AboutCommand extends BaseCommand {
  constructor() {
    super('about', 'Display ForgeFuscator information', 5000);
  }

  async executeCommand(message, args) {
    const builder = new V2MessageBuilder();
    
    // Header
    builder.addHeading(EMOTES.question, 'About ForgeFuscator');
    builder.addSeparator();
    
    // Description
    builder.addText(EMOTES.question, '**Description:**');
    builder.addText(null, 'ForgeFuscator is a professional Discord bot dedicated to Lua and Luau obfuscation. All obfuscation is performed by an external API, ensuring security and reliability.');
    builder.addSeparator();
    
    // Features
    builder.addText(EMOTES.lua, '**Features:**');
    builder.addText(null, '- Lua and Luau support');
    builder.addText(null, '- File attachment processing');
    builder.addText(null, '- Persistent user settings');
    builder.addText(null, '- Credits system');
    builder.addText(null, '- Operation history');
    builder.addText(null, '- Privacy protection');
    builder.addSeparator();
    
    // Architecture
    builder.addText(EMOTES.tools, '**Architecture:**');
    builder.addText(null, '- API-based obfuscation (no local processing)');
    builder.addText(null, '- Discord.js with Components V2');
    builder.addText(null, '- JSON file storage');
    builder.addText(null, '- Secure file handling');
    builder.addText(null, '- Privacy-first design');
    builder.addSeparator();
    
    // Supported Files
    builder.addText(EMOTES.files, '**Supported Files:**');
    builder.addText(null, '- .lua files');
    builder.addText(null, '- .luau files');
    builder.addText(null, '- .txt files');
    builder.addText(null, '- Files without extensions (validated as Lua/Luau)');
    builder.addSeparator();
    
    // Version
    builder.addText(EMOTES.question, `**Version:** ${process.env.BOT_VERSION || '1.0.0'}`);
    builder.addSeparator();
    
    // Privacy Notice
    builder.addText(EMOTES.oops, '**Privacy Notice:**');
    builder.addText(null, 'All sensitive operations (obfuscation, profile, history) are handled privately via DMs in servers to protect your source code and data.');
    builder.addSeparator();
    
    // Action buttons
    builder.addActionRow([
      createButton('about_info', 'Information', 'Primary', EMOTES.question),
      createButton('about_stats', 'Statistics', 'Secondary')
    ]);
    
    const v2Message = builder.build();
    
    return message.reply(v2Message);
  }

  buildStatsMessage() {
    const database = require('../database/index');
    const totalUsers = database.getTotalUsers();
    const totalOperations = database.getTotalOperations();
    
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'ForgeFuscator Statistics');
    builder.addSeparator();
    
    builder.addText(EMOTES.question, '**Bot Information:**');
    builder.addText(null, `- Version: ${process.env.BOT_VERSION || '1.0.0'}`);
    builder.addText(null, `- Uptime: ${this.formatUptime(process.uptime())}`);
    builder.addText(null, `- Total Users: ${totalUsers}`);
    builder.addText(null, `- Total Operations: ${totalOperations}`);
    builder.addSeparator();
    
    builder.addText(EMOTES.lua, '**Supported Languages:**');
    builder.addText(null, '- Lua');
    builder.addText(null, '- Luau');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, '**API Features:**');
    builder.addText(null, '- Anti-Tamper');
    builder.addText(null, '- Anti-Hook');
    builder.addText(null, '- VM Renaming');
    builder.addText(null, '- Encrypted VM');
    builder.addText(null, '- Control Flow Obfuscation');
    builder.addText(null, '- Runtime State Chain');
    builder.addText(null, '- Lazy Regions');
    builder.addText(null, '- Sensitive Profiles');
    builder.addSeparator();
    
    builder.addActionRow([
      createButton('about_info', 'Back to Info', 'Secondary')
    ]);
    
    return builder.build();
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

  async handleInfoInteraction(interaction) {
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'About ForgeFuscator');
    builder.addSeparator();
    
    builder.addText(EMOTES.question, '**Description:**');
    builder.addText(null, 'ForgeFuscator is a professional Discord bot dedicated to Lua and Luau obfuscation. All obfuscation is performed by an external API, ensuring security and reliability.');
    builder.addSeparator();
    
    builder.addText(EMOTES.lua, '**Features:**');
    builder.addText(null, '- Lua and Luau support');
    builder.addText(null, '- File attachment processing');
    builder.addText(null, '- Persistent user settings');
    builder.addText(null, '- Credits system');
    builder.addText(null, '- Operation history');
    builder.addText(null, '- Privacy protection');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, '**Architecture:**');
    builder.addText(null, '- API-based obfuscation (no local processing)');
    builder.addText(null, '- Discord.js with Components V2');
    builder.addText(null, '- JSON file storage');
    builder.addText(null, '- Secure file handling');
    builder.addText(null, '- Privacy-first design');
    builder.addSeparator();
    
    builder.addText(EMOTES.files, '**Supported Files:**');
    builder.addText(null, '- .lua files');
    builder.addText(null, '- .luau files');
    builder.addText(null, '- .txt files');
    builder.addText(null, '- Files without extensions (validated as Lua/Luau)');
    builder.addSeparator();
    
    builder.addText(EMOTES.question, `**Version:** ${process.env.BOT_VERSION || '1.0.0'}`);
    builder.addSeparator();
    
    builder.addText(EMOTES.oops, '**Privacy Notice:**');
    builder.addText(null, 'All sensitive operations (obfuscation, profile, history) are handled privately via DMs in servers to protect your source code and data.');
    builder.addSeparator();
    
    builder.addActionRow([
      createButton('about_info', 'Information', 'Primary', EMOTES.question),
      createButton('about_stats', 'Statistics', 'Secondary')
    ]);
    
    await interaction.update(builder.build());
  }

  async handleStatsInteraction(interaction) {
    await interaction.update(this.buildStatsMessage());
  }
}

module.exports = new AboutCommand();
