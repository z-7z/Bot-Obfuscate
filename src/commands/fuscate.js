const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const obfuscationService = require('../services/obfuscation');
const database = require('../database/index');
const privacyService = require('../services/privacy');
const componentBuilder = require('../components');

class FuscateCommand extends BaseCommand {
  constructor() {
    super('fuscate', 'Obfuscate Lua/Luau files using the API', 10000);
  }

  async executeCommand(message, args) {
    // Check for attachment
    if (message.attachments.size === 0) {
      return message.reply(`${EMOTES.oops} No file attached. Please attach a .lua, .luau, or .txt file.`);
    }

    const attachment = message.attachments.first();
    const userId = message.author.id;

    // Get user settings
    let settings = database.getSettings(userId);
    if (!settings) {
      const { DEFAULT_SETTINGS } = require('../config/constants');
      settings = DEFAULT_SETTINGS;
      database.createSettings(userId, settings);
    }

    // Convert settings to proper format
    const userSettings = this.convertSettings(settings);

    // Process the file
    const result = await obfuscationService.obfuscateFile(attachment, userId, userSettings);

    // Handle result
    if (!result.success) {
      // Clean up temp files
      if (result.operationId) {
        await obfuscationService.cleanupOperationFiles(result.operationId);
      }

      // For guilds, send error via DM if possible
      if (message.guild) {
        const dmResult = await privacyService.sendDM(message.author, {
          content: `${EMOTES.error} Obfuscation failed: ${result.error}`
        });

        if (!dmResult.success) {
          return privacyService.getDMFailureMessage(message.content);
        }

        if (privacyService.shouldDeleteOriginalMessage()) {
          await privacyService.tryDeleteOriginalMessage(message);
        }

        return `${EMOTES.accept} Your private obfuscation request has been received. Check your DMs for updates.`;
      }

      return message.reply(`${EMOTES.error} Obfuscation failed: ${result.error}`);
    }

    // Success - send the obfuscated file
    try {
      // For guilds, send via DM
      if (message.guild) {
        const dmResult = await privacyService.sendDMWithFile(
          message.author,
          `${EMOTES.accept} Your file has been obfuscated successfully!\n\n**Original:** ${result.originalFilename}\n**Language:** ${result.language}\n**Duration:** ${result.duration}ms\n**Remaining Credits:** ${result.newBalance}`,
          result.outputPath
        );

        if (dmResult.success) {
          if (privacyService.shouldDeleteOriginalMessage()) {
            await privacyService.tryDeleteOriginalMessage(message);
          }

          // Update delivery status
          database.updateOperationDeliveryStatus(result.operationId, 'delivered');

          // Clean up temp files after a delay
          setTimeout(() => {
            obfuscationService.cleanupOperationFiles(result.operationId);
          }, 30000);

          return `${EMOTES.accept} Your private obfuscation request has been received. Check your DMs for updates.`;
        } else {
          // DM failed - clean up and notify
          obfuscationService.cleanupOperationFiles(result.operationId);
          return privacyService.getDMFailureMessage(message.content);
        }
      }

      // For DMs, send directly
      const response = await message.reply({
        content: `${EMOTES.accept} Your file has been obfuscated successfully!\n\n**Original:** ${result.originalFilename}\n**Language:** ${result.language}\n**Duration:** ${result.duration}ms\n**Remaining Credits:** ${result.newBalance}`,
        files: [result.outputPath]
      });

      // Update delivery status
      database.updateOperationDeliveryStatus(result.operationId, 'delivered');

      // Clean up temp files after a delay
      setTimeout(() => {
        obfuscationService.cleanupOperationFiles(result.operationId);
      }, 30000);

      return response;
    } catch (error) {
      // Handle upload failure
      obfuscationService.cleanupOperationFiles(result.operationId);
      
      if (message.guild) {
        const dmResult = await privacyService.sendDM(message.author, {
          content: `${EMOTES.error} Failed to deliver obfuscated file: ${error.message}`
        });

        if (!dmResult.success) {
          return privacyService.getDMFailureMessage(message.content);
        }

        return `${EMOTES.error} Failed to deliver your file. Check your DMs for details.`;
      }

      return message.reply(`${EMOTES.error} Failed to deliver obfuscated file: ${error.message}`);
    }
  }

  convertSettings(dbSettings) {
    return {
      antiTamper: Boolean(dbSettings.antiTamper),
      antiHook: Boolean(dbSettings.antiHook),
      renameVM: Boolean(dbSettings.renameVM),
      hideVM: Boolean(dbSettings.hideVM),
      controlFlow: dbSettings.controlFlow === 'On' || dbSettings.controlFlow === true,
      runtimeLease: Boolean(dbSettings.runtimeLease),
      runtimeStateChain: Boolean(dbSettings.runtimeStateChain),
      lazyRegions: dbSettings.lazyRegions === 'On' || dbSettings.lazyRegions === true,
      sensitiveProfiles: Boolean(dbSettings.sensitiveProfiles),
      hybrid: Boolean(dbSettings.hybrid)
    };
  }
}

module.exports = new FuscateCommand();
