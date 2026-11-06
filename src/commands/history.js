const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const database = require('../database');
const privacyService = require('../services/privacy');
const componentBuilder = require('../components');

class HistoryCommand extends BaseCommand {
  constructor() {
    super('history', 'Display recent obfuscation operations', 5000);
  }

  async executeCommand(message, args) {
    const userId = message.author.id;
    const history = database.getUserHistory(userId);

    if (!history || history.length === 0) {
      return message.reply(`${EMOTES.oops} You have no obfuscation history.`);
    }

    const historyMessage = this.buildHistoryMessage(history);
    const components = componentBuilder.buildHistoryComponents(userId);

    // For guilds, send via DM
    if (message.guild) {
      const dmResult = await privacyService.sendDM(message.author, {
        content: historyMessage,
        components
      });

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
    return message.reply({
      content: historyMessage,
      components
    });
  }

  buildHistoryMessage(history) {
    let message = `${EMOTES.question} **Your Obfuscation History**\n\n`;

    history.forEach((op, index) => {
      const statusEmoji = op.status === 'success' ? EMOTES.accept : EMOTES.error;
      const languageEmoji = op.language === 'Luau' ? EMOTES.luau : EMOTES.lua;
      const date = new Date(op.timestamp * 1000).toLocaleDateString();
      const time = new Date(op.timestamp * 1000).toLocaleTimeString();
      const duration = op.duration || 0;
      
      message += `${index + 1}. ${statusEmoji} ${languageEmoji} **${op.filename}**\n`;
      message += `   Status: ${op.status}\n`;
      message += `   Language: ${op.language}\n`;
      message += `   Date: ${date} ${time}\n`;
      message += `   Duration: ${duration}ms\n\n`;
    });

    return message;
  }

  async handleRefreshInteraction(interaction) {
    const userId = interaction.user.id;
    const history = database.getUserHistory(userId);

    if (!history || history.length === 0) {
      await interaction.reply({
        content: `${EMOTES.oops} You have no obfuscation history.`,
        ephemeral: true
      });
      return;
    }

    const historyMessage = this.buildHistoryMessage(history);
    const components = componentBuilder.buildHistoryComponents(userId);

    await interaction.update({
      content: historyMessage,
      components
    });
  }

  async handleClearInteraction(interaction) {
    const userId = interaction.user.id;
    
    // Delete all operations for this user
    database.db.prepare('DELETE FROM operations WHERE userId = ?').run(userId);

    await interaction.reply({
      content: `${EMOTES.accept} Your history has been cleared.`,
      ephemeral: true
    });

    // Refresh the history display
    const history = database.getUserHistory(userId);
    const historyMessage = history.length === 0 
      ? `${EMOTES.oops} You have no obfuscation history.`
      : this.buildHistoryMessage(history);
    const components = componentBuilder.buildHistoryComponents(userId);

    await interaction.followUp({
      content: historyMessage,
      components,
      ephemeral: true
    });
  }
}

module.exports = new HistoryCommand();
