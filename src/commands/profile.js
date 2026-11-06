const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const database = require('../database/index');
const privacyService = require('../services/privacy');
const { V2MessageBuilder, createButton, createV2Message } = require('../utils/componentsV2');

class ProfileCommand extends BaseCommand {
  constructor() {
    super('profile', 'Display user information and credits', 5000);
  }

  async executeCommand(message, args) {
    const userId = message.author.id;
    const user = database.getUser(userId);

    if (!user) {
      return message.reply(`${EMOTES.error} You are not registered. Use any command to register.`);
    }

    const profile = database.getUserProfile(userId);
    const builder = new V2MessageBuilder();
    
    // Header
    builder.addHeading(EMOTES.question, 'ForgeFuscator Profile');
    builder.addSeparator();
    
    // User Information
    builder.addText(EMOTES.files, '**User Information:**');
    builder.addText(null, `Username: ${profile.username}`);
    builder.addText(null, `User ID: ${profile.userId}`);
    builder.addSeparator();
    
    // Statistics
    builder.addText(EMOTES.lua, '**Statistics:**');
    builder.addText(null, `Credits: ${profile.credits}`);
    builder.addText(null, `Successful Operations: ${profile.successfulOperations}`);
    builder.addText(null, `Failed Operations: ${profile.failedOperations}`);
    builder.addText(null, `Registered: ${new Date(profile.registeredAt * 1000).toLocaleDateString()}`);
    builder.addSeparator();
    
    // Action buttons
    builder.addActionRow([
      createButton(`profile_refresh_${userId}`, 'Refresh', 'Primary', '🔄'),
      createButton(`profile_history_${userId}`, 'View History', 'Secondary')
    ]);
    
    const v2Message = builder.build();

    // For guilds, send via DM
    if (message.guild) {
      const dmResult = await privacyService.sendDM(message.author, v2Message);

      if (dmResult.success) {
        if (privacyService.shouldDeleteOriginalMessage()) {
          await privacyService.tryDeleteOriginalMessage(message);
        }
        return `${EMOTES.accept} Your profile information has been sent to your DMs.`;
      } else {
        return privacyService.getDMFailureMessage(message.content);
      }
    }

    // For DMs, send directly
    return message.reply(v2Message);
  }

  async handleRefreshInteraction(interaction) {
    const userId = interaction.user.id;
    const profile = database.getUserProfile(userId);
    
    if (!profile) {
      await interaction.reply({
        content: `${EMOTES.error} Profile not found.`,
        ephemeral: true
      });
      return;
    }

    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'ForgeFuscator Profile');
    builder.addSeparator();
    
    builder.addText(EMOTES.files, '**User Information:**');
    builder.addText(null, `Username: ${profile.username}`);
    builder.addText(null, `User ID: ${profile.userId}`);
    builder.addSeparator();
    
    builder.addText(EMOTES.lua, '**Statistics:**');
    builder.addText(null, `Credits: ${profile.credits}`);
    builder.addText(null, `Successful Operations: ${profile.successfulOperations}`);
    builder.addText(null, `Failed Operations: ${profile.failedOperations}`);
    builder.addText(null, `Registered: ${new Date(profile.registeredAt * 1000).toLocaleDateString()}`);
    builder.addSeparator();
    
    builder.addActionRow([
      createButton(`profile_refresh_${userId}`, 'Refresh', 'Primary', '🔄'),
      createButton(`profile_history_${userId}`, 'View History', 'Secondary')
    ]);
    
    await interaction.update(builder.build());
  }

  async handleHistoryInteraction(interaction) {
    const userId = interaction.user.id;
    const history = database.getUserHistory(userId);
    
    if (!history || history.length === 0) {
      const builder = new V2MessageBuilder();
      builder.addText(EMOTES.oops, 'You have no obfuscation history.');
      builder.addActionRow([
        createButton('history_dismiss', 'OK', 'Secondary')
      ]);
      
      await interaction.reply({ 
        ...builder.build(),
        ephemeral: true 
      });
      return;
    }

    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'Your Obfuscation History');
    builder.addSeparator();
    
    history.forEach((op, index) => {
      const statusEmoji = op.status === 'success' ? EMOTES.accept : EMOTES.error;
      const languageEmoji = op.language === 'Luau' ? EMOTES.luau : EMOTES.lua;
      const date = new Date(op.timestamp * 1000).toLocaleDateString();
      const time = new Date(op.timestamp * 1000).toLocaleTimeString();
      
      builder.addText(statusEmoji, `${index + 1}. ${languageEmoji} **${op.filename}** - ${date} ${time}`);
      builder.addText(null, `   Status: ${op.status}, Duration: ${op.duration}ms`);
    });
    
    builder.addSeparator();
    builder.addActionRow([
      createButton('profile_back', 'Back to Profile', 'Secondary')
    ]);
    
    await interaction.reply({ 
      ...builder.build(),
      ephemeral: true 
    });
  }
}

module.exports = new ProfileCommand();
