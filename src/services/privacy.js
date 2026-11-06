const { PRIVACY_CONFIG, EMOTES } = require('../config/constants');

class PrivacyService {
  constructor() {
    this.deleteOriginalMessage = PRIVACY_CONFIG.deleteOriginalMessage;
    this.useDMsForSensitiveCommands = PRIVACY_CONFIG.useDMsForSensitiveCommands;
    this.sensitiveCommands = ['ff!fuscate', 'ff!profile', 'ff!history', 'ff!setup'];
  }

  isSensitiveCommand(command) {
    if (!command) return false;
    return this.sensitiveCommands.some(cmd => command.startsWith(cmd));
  }

  shouldUseDMs(command) {
    return this.useDMsForSensitiveCommands && this.isSensitiveCommand(command);
  }

  shouldDeleteOriginalMessage() {
    return this.deleteOriginalMessage;
  }

  async handlePrivacy(message, command) {
    const isGuild = message.guild !== null;
    const isSensitive = this.isSensitiveCommand(command);
    
    if (!isGuild) {
      // DM - no privacy concerns
      return { useDM: false, deleteOriginal: false, reason: null };
    }
    
    if (!isSensitive) {
      // Not a sensitive command - can respond in channel
      return { useDM: false, deleteOriginal: false, reason: null };
    }
    
    // Sensitive command in a guild
    // Check if we should use DMs
    const useDM = this.shouldUseDMs();
    const deleteOriginal = this.shouldDeleteOriginalMessage();
    
    return { useDM, deleteOriginal, reason: 'sensitive_command_in_guild' };
  }

  async tryDeleteOriginalMessage(message) {
    try {
      // Check if bot has Manage Messages permission
      if (message.guild && message.channel) {
        const permissions = message.channel.permissionsFor(message.client.user);
        if (permissions && permissions.has('ManageMessages')) {
          await message.delete();
          return { success: true, deleted: true };
        }
      }
      return { success: true, deleted: false, reason: 'missing_permissions' };
    } catch (error) {
      return { success: false, deleted: false, error: error.message };
    }
  }

  async sendDM(user, content) {
    try {
      const dmChannel = await user.createDM();
      await dmChannel.send(content);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendDMWithFile(user, content, file) {
    try {
      const dmChannel = await user.createDM();
      await dmChannel.send({ content, files: [file] });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  canSendDM(user) {
    // Check if user can receive DMs
    // This is a best-effort check
    return user.bot === false; // Bots might not accept DMs
  }

  getPublicAcknowledgment(command) {
    if (command === 'ff!fuscate') {
      return `${EMOTES.accept} Your private obfuscation request has been received. Check your DMs for updates.`;
    }
    return null;
  }

  getDMFailureMessage(command) {
    if (command === 'ff!fuscate') {
      return `${EMOTES.error} I couldn't send you a DM. Please enable DMs from server members and try again.`;
    }
    return `${EMOTES.error} I couldn't send you a DM. Please enable DMs and try again.`;
  }

  getPrivacyWarning() {
    return `${EMOTES.oops} Note: Message deletion cannot guarantee removal of cached content.`;
  }
}

// Singleton instance
const privacyService = new PrivacyService();

module.exports = privacyService;
