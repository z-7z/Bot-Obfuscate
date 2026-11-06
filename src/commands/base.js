const { EMOTES } = require('../config/constants');
const privacyService = require('../services/privacy');
const creditsService = require('../services/credits');

class BaseCommand {
  constructor(name, description, cooldown = 5000) {
    this.name = name;
    this.description = description;
    this.cooldown = cooldown;
    this.cooldowns = new Map();
  }

  isOnCooldown(userId) {
    const now = Date.now();
    const lastUsed = this.cooldowns.get(userId) || 0;
    return now - lastUsed < this.cooldown;
  }

  setCooldown(userId) {
    this.cooldowns.set(userId, Date.now());
    setTimeout(() => this.cooldowns.delete(userId), this.cooldown);
  }

  async execute(message, args) {
    // Check cooldown
    if (this.isOnCooldown(message.author.id)) {
      return this.replyCooldown(message);
    }

    // Initialize user if not exists
    await creditsService.initializeUser(message.author.id, message.author.username);

    // Handle privacy - pass the command name, not message.content
    const commandName = message.content.split(/\s+/)[0] || '';
    const privacy = await privacyService.handlePrivacy(message, commandName);
    
    if (privacy.useDM) {
      // For sensitive commands in guilds, respond privately
      const response = await this.executeCommand(message, args);
      
      if (privacy.deleteOriginal) {
        await privacyService.tryDeleteOriginalMessage(message);
      }
      
      if (privacy.useDM) {
        const dmResult = await privacyService.sendDM(message.author, response);
        if (!dmResult.success) {
          await message.channel.send(privacyService.getDMFailureMessage(commandName));
        }
        return;
      }
      
      return response;
    }

    // Normal execution
    this.setCooldown(message.author.id);
    return this.executeCommand(message, args);
  }

  async executeCommand(message, args) {
    throw new Error('executeCommand must be implemented by subclass');
  }

  async replyCooldown(message) {
    await message.reply(`${EMOTES.oops} Please wait a moment before using this command again.`);
  }

  async replyError(message, error) {
    await message.reply(`${EMOTES.error} Error: ${error}`);
  }

  async replySuccess(message, content) {
    await message.reply(content);
  }

  formatMessage(content) {
    return content;
  }
}

module.exports = BaseCommand;
