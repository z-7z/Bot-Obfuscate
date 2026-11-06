const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const database = require('../database');
const privacyService = require('../services/privacy');
const componentBuilder = require('../components');

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
    const profileMessage = this.buildProfileMessage(profile);
    const components = componentBuilder.buildProfileComponents(userId);

    // For guilds, send via DM
    if (message.guild) {
      const dmResult = await privacyService.sendDM(message.author, {
        content: profileMessage,
        components
      });

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
    return message.reply({
      content: profileMessage,
      components
    });
  }

  buildProfileMessage(profile) {
    const registeredAt = new Date(profile.registeredAt * 1000).toLocaleDateString();

    return `${EMOTES.question} **ForgeFuscator Profile**

**User Information:**
${EMOTES.files} **Username:** ${profile.username}
${EMOTES.files} **User ID:** ${profile.userId}

**Statistics:**
${EMOTES.lua} **Credits:** ${profile.credits}
${EMOTES.accept} **Successful Operations:** ${profile.successfulOperations}
${EMOTES.error} **Failed Operations:** ${profile.failedOperations}
${EMOTES.question} **Registered:** ${registeredAt}`;
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

    const profileMessage = this.buildProfileMessage(profile);
    const components = componentBuilder.buildProfileComponents(userId);

    await interaction.update({
      content: profileMessage,
      components
    });
  }

  async handleHistoryInteraction(interaction) {
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

    await interaction.reply({
      content: historyMessage,
      components,
      ephemeral: true
    });
  }

  buildHistoryMessage(history) {
    let message = `${EMOTES.question} **Your Obfuscation History**\n\n`;

    history.forEach((op, index) => {
      const statusEmoji = op.status === 'success' ? EMOTES.accept : EMOTES.error;
      const date = new Date(op.timestamp * 1000).toLocaleDateString();
      const time = new Date(op.timestamp * 1000).toLocaleTimeString();
      
      message += `${index + 1}. ${statusEmoji} **${op.filename}** (${op.language}) - ${date} ${time}\n`;
    });

    return message;
  }
}

module.exports = new ProfileCommand();
