const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const { V2MessageBuilder, createButton, createV2Message } = require('../utils/componentsV2');

class HelpCommand extends BaseCommand {
  constructor() {
    super('help', 'Display available commands', 3000);
  }

  async executeCommand(message, args) {
    const builder = new V2MessageBuilder();
    
    // Header
    builder.addHeading(EMOTES.question, 'ForgeFuscator Help');
    builder.addSeparator();
    
    // Commands section
    builder.addText(EMOTES.question, '**Available Commands:**');
    builder.addSeparator();
    
    // Command list
    const commands = [
      { emoji: EMOTES.question, name: 'ff!help', desc: 'Display this help message' },
      { emoji: EMOTES.question, name: 'ff!status', desc: 'Check bot and API status' },
      { emoji: EMOTES.tools, name: 'ff!setup', desc: 'Configure obfuscation settings' },
      { emoji: EMOTES.files, name: 'ff!fuscate', desc: 'Obfuscate Lua/Luau files' },
      { emoji: EMOTES.question, name: 'ff!profile', desc: 'View your profile and credits' },
      { emoji: EMOTES.question, name: 'ff!history', desc: 'View your obfuscation history' },
      { emoji: EMOTES.question, name: 'ff!about', desc: 'Display bot information' }
    ];
    
    commands.forEach(cmd => {
      builder.addText(cmd.emoji, `**${cmd.name}** - ${cmd.desc}`);
    });
    
    builder.addSeparator();
    
    // Usage notes
    builder.addText(EMOTES.oops, '**Usage Notes:**');
    builder.addText(null, '- All obfuscation is performed by an external API');
    builder.addText(null, '- Settings persist across bot restarts');
    builder.addText(null, '- Sensitive commands in servers will use DMs for privacy');
    builder.addText(null, '- File attachments: .lua, .luau, .txt');
    builder.addSeparator();
    
    // Navigation buttons
    const prefix = process.env.BOT_PREFIX || 'ff!';
    builder.addActionRow([
      createButton('help_commands', 'Commands', 'Primary', EMOTES.question),
      createButton('help_settings', 'Settings', 'Primary', EMOTES.tools),
      createButton('help_about', 'About', 'Primary', EMOTES.question)
    ]);
    
    const v2Message = builder.build();
    
    return message.reply(v2Message);
  }

  async handleCommandsInteraction(interaction) {
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'ForgeFuscator Commands');
    builder.addSeparator();
    
    const commands = [
      { emoji: EMOTES.question, name: 'ff!help', desc: 'Display help' },
      { emoji: EMOTES.question, name: 'ff!status', desc: 'Bot and API status' },
      { emoji: EMOTES.tools, name: 'ff!setup', desc: 'Configure settings' },
      { emoji: EMOTES.files, name: 'ff!fuscate', desc: 'Obfuscate files' },
      { emoji: EMOTES.question, name: 'ff!profile', desc: 'View profile' },
      { emoji: EMOTES.question, name: 'ff!history', desc: 'View history' },
      { emoji: EMOTES.question, name: 'ff!about', desc: 'Bot information' }
    ];
    
    commands.forEach(cmd => {
      builder.addText(cmd.emoji, `**${cmd.name}** - ${cmd.desc}`);
    });
    
    builder.addSeparator();
    builder.addActionRow([
      createButton('help_back', 'Back', 'Secondary')
    ]);
    
    await interaction.update(builder.build());
  }

  async handleSettingsInteraction(interaction) {
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.tools, 'ForgeFuscator Settings');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, 'Use **ff!setup** to configure:');
    builder.addText(null, '- Anti-Tamper');
    builder.addText(null, '- Anti-Hook');
    builder.addText(null, '- VM Renaming');
    builder.addText(null, '- Encrypted VM');
    builder.addText(null, '- Runtime State Chain');
    builder.addText(null, '- Control Flow');
    builder.addText(null, '- Lazy Regions');
    
    builder.addSeparator();
    builder.addActionRow([
      createButton('help_back', 'Back', 'Secondary')
    ]);
    
    await interaction.update(builder.build());
  }

  async handleAboutInteraction(interaction) {
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'About ForgeFuscator');
    builder.addSeparator();
    
    builder.addText(EMOTES.question, 'A professional Discord bot for Lua/Luau obfuscation.');
    builder.addText(null, 'All obfuscation is performed by an external API.');
    builder.addText(null, 'Version: 1.0.0');
    
    builder.addSeparator();
    builder.addActionRow([
      createButton('help_back', 'Back', 'Secondary')
    ]);
    
    await interaction.update(builder.build());
  }

  async handleBackInteraction(interaction) {
    // Go back to main help
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'ForgeFuscator Help');
    builder.addSeparator();
    
    builder.addText(EMOTES.question, '**Available Commands:**');
    builder.addSeparator();
    
    const commands = [
      { emoji: EMOTES.question, name: 'ff!help', desc: 'Display this help message' },
      { emoji: EMOTES.question, name: 'ff!status', desc: 'Check bot and API status' },
      { emoji: EMOTES.tools, name: 'ff!setup', desc: 'Configure obfuscation settings' },
      { emoji: EMOTES.files, name: 'ff!fuscate', desc: 'Obfuscate Lua/Luau files' },
      { emoji: EMOTES.question, name: 'ff!profile', desc: 'View your profile and credits' },
      { emoji: EMOTES.question, name: 'ff!history', desc: 'View your obfuscation history' },
      { emoji: EMOTES.question, name: 'ff!about', desc: 'Display bot information' }
    ];
    
    commands.forEach(cmd => {
      builder.addText(cmd.emoji, `**${cmd.name}** - ${cmd.desc}`);
    });
    
    builder.addSeparator();
    builder.addText(EMOTES.oops, '**Usage Notes:**');
    builder.addText(null, '- All obfuscation is performed by an external API');
    builder.addText(null, '- Settings persist across bot restarts');
    builder.addText(null, '- Sensitive commands in servers will use DMs for privacy');
    builder.addText(null, '- File attachments: .lua, .luau, .txt');
    builder.addSeparator();
    
    builder.addActionRow([
      createButton('help_commands', 'Commands', 'Primary', EMOTES.question),
      createButton('help_settings', 'Settings', 'Primary', EMOTES.tools),
      createButton('help_about', 'About', 'Primary', EMOTES.question)
    ]);
    
    await interaction.update(builder.build());
  }
}

module.exports = new HelpCommand();
