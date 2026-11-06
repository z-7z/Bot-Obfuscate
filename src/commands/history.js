const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const database = require('../database/index');
const privacyService = require('../services/privacy');
const { V2MessageBuilder, createButton, createV2Message } = require('../utils/componentsV2');

class HistoryCommand extends BaseCommand {
  constructor() {
    super('history', 'Display recent obfuscation operations', 5000);
  }

  async executeCommand(message, args) {
    const userId = message.author.id;
    const history = database.getUserHistory(userId);

    if (!history || history.length === 0) {
      const builder = new V2MessageBuilder();
      builder.addText(EMOTES.oops, 'You have no obfuscation history.');
      
      const v2Message = builder.build();
      
      // For guilds, send via DM
      if (message.guild) {
        const dmResult = await privacyService.sendDM(message.author, v2Message);

        if (dmResult.success) {
          if (privacyService.shouldDeleteOriginalMessage()) {
            await privacyService.tryDeleteOriginalMessage(message);
          }
          return `${EMOTES.accept} Your history has been sent to your DMs.`;
        } else {
          return privacyService.getDMFailureMessage(message.content);
        }
      }

      return message.reply(v2Message);
    }

    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'Your Obfuscation History');
    builder.addSeparator();
    
    history.forEach((op, index) => {
      const statusEmoji = op.status === 'success' ? EMOTES.accept : EMOTES.error;
      const languageEmoji = op.language === 'Luau' ? EMOTES.luau : EMOTES.lua;
      const date = new Date(op.timestamp * 1000).toLocaleDateString();
      const time = new Date(op.timestamp * 1000).toLocaleTimeString();
      const duration = op.duration || 0;
      
      builder.addText(statusEmoji, `${index + 1}. ${languageEmoji} **${op.filename}**`);
      builder.addText(null, `   Status: ${op.status}`);
      builder.addText(null, `   Language: ${op.language}`);
      builder.addText(null, `   Date: ${date} ${time}`);
      builder.addText(null, `   Duration: ${duration}ms`);
      builder.addSeparator();
    });
    
    builder.addActionRow([
      createButton(`history_refresh_${userId}`, 'Refresh', 'Primary', '🔄'),
      createButton(`history_clear_${userId}`, 'Clear History', 'Danger')
    ]);
    
    const v2Message = builder.build();

    // For guilds, send via DM
    if (message.guild) {
      const dmResult = await privacyService.sendDM(message.author, v2Message);

      if (dmResult.success) {
        if (privacyService.shouldDeleteOriginalMessage()) {
          await privacyService.tryDeleteOriginalMessage(message);
        }
        return `${EMOTES.accept} Your history has been sent to your DMs.`;
      } else {
        return privacyService.getDMFailureMessage(message.content);
      }
    }

    // For DMs, send directly
    return message.reply(v2Message);
  }

  async handleRefreshInteraction(interaction) {
    const userId = interaction.user.id;
    const history = database.getUserHistory(userId);

    if (!history || history.length === 0) {
      const builder = new V2MessageBuilder();
      builder.addText(EMOTES.oops, 'You have no obfuscation history.');
      builder.addActionRow([
        createButton('history_dismiss', 'OK', 'Secondary')
      ]);
      
      await interaction.update(builder.build());
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
      const duration = op.duration || 0;
      
      builder.addText(statusEmoji, `${index + 1}. ${languageEmoji} **${op.filename}**`);
      builder.addText(null, `   Status: ${op.status}`);
      builder.addText(null, `   Language: ${op.language}`);
      builder.addText(null, `   Date: ${date} ${time}`);
      builder.addText(null, `   Duration: ${duration}ms`);
      builder.addSeparator();
    });
    
    builder.addActionRow([
      createButton(`history_refresh_${userId}`, 'Refresh', 'Primary', '🔄'),
      createButton(`history_clear_${userId}`, 'Clear History', 'Danger')
    ]);
    
    await interaction.update(builder.build());
  }

  async handleClearInteraction(interaction) {
    const userId = interaction.user.id;
    
    // Delete all operations for this user
    database.db.prepare('DELETE FROM operations WHERE userId = ?').run(userId);

    const builder = new V2MessageBuilder();
    builder.addText(EMOTES.accept, 'Your history has been cleared.');
    builder.addActionRow([
      createButton('history_clear_confirm', 'OK', 'Success')
    ]);
    
    await interaction.update(builder.build());
  }
}

module.exports = new HistoryCommand();
