const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const obfuscationService = require('../services/obfuscation');
const database = require('../database/index');
const privacyService = require('../services/privacy');
const { V2MessageBuilder, createButton, createV2Message } = require('../utils/componentsV2');
const { ErrorHandler, ErrorType } = require('../utils/errors');
const errorHandler = new ErrorHandler();

class FuscateCommand extends BaseCommand {
  constructor() {
    super('fuscate', 'Obfuscate Lua/Luau files using the API', 10000);
  }

  async executeCommand(message, args) {
    // Check for attachment
    if (message.attachments.size === 0) {
      const builder = new V2MessageBuilder();
      builder.addText(EMOTES.oops, 'No file attached. Please attach a .lua, .luau, or .txt file.');
      const v2Message = builder.build();
      return message.reply(v2Message);
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

    // Show processing message
    const processingBuilder = new V2MessageBuilder();
    processingBuilder.addText(EMOTES.tools, 'Processing your file...');
    processingBuilder.addText(EMOTES.files, `File: ${attachment.name}`);
    processingBuilder.addText(EMOTES.question, 'Please wait...');
    
    try {
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
          const errorBuilder = new V2MessageBuilder();
          errorBuilder.addText(EMOTES.error, `Obfuscation failed: ${result.error}`);
          
          const dmResult = await privacyService.sendDM(message.author, errorBuilder.build());

          if (!dmResult.success) {
            return privacyService.getDMFailureMessage(message.content);
          }

          if (privacyService.shouldDeleteOriginalMessage()) {
            await privacyService.tryDeleteOriginalMessage(message);
          }

          return `${EMOTES.accept} Your private obfuscation request has been received. Check your DMs for updates.`;
        }

        const errorBuilder = new V2MessageBuilder();
        errorBuilder.addText(EMOTES.error, `Obfuscation failed: ${result.error}`);
        return message.reply(errorBuilder.build());
      }

      // Success - send the obfuscated file
      try {
        // For guilds, send via DM
        if (message.guild) {
          const successBuilder = new V2MessageBuilder();
          successBuilder.addText(EMOTES.accept, 'Your file has been obfuscated successfully!');
          successBuilder.addSeparator();
          successBuilder.addText(EMOTES.files, `Original: ${result.originalFilename}`);
          successBuilder.addText(EMOTES.lua, `Language: ${result.language}`);
          successBuilder.addText(EMOTES.question, `Duration: ${result.duration}ms`);
          successBuilder.addText(EMOTES.lua, `Remaining Credits: ${result.newBalance}`);
          
          const dmResult = await privacyService.sendDMWithFile(
            message.author,
            successBuilder.build(),
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
        const successBuilder = new V2MessageBuilder();
        successBuilder.addText(EMOTES.accept, 'Your file has been obfuscated successfully!');
        successBuilder.addSeparator();
        successBuilder.addText(EMOTES.files, `Original: ${result.originalFilename}`);
        successBuilder.addText(EMOTES.lua, `Language: ${result.language}`);
        successBuilder.addText(EMOTES.question, `Duration: ${result.duration}ms`);
        successBuilder.addText(EMOTES.lua, `Remaining Credits: ${result.newBalance}`);
        
        const response = await message.reply({
          ...successBuilder.build(),
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
          const errorBuilder = new V2MessageBuilder();
          errorBuilder.addText(EMOTES.error, `Failed to deliver obfuscated file: ${error.message}`);
          
          const dmResult = await privacyService.sendDM(message.author, errorBuilder.build());

          if (!dmResult.success) {
            return privacyService.getDMFailureMessage(message.content);
          }

          return `${EMOTES.error} Failed to deliver your file. Check your DMs for details.`;
        }

        const errorBuilder = new V2MessageBuilder();
        errorBuilder.addText(EMOTES.error, `Failed to deliver obfuscated file: ${error.message}`);
        return message.reply(errorBuilder.build());
      }
    } catch (error) {
      // Log the error with details
      const errorMessage = errorHandler.logError(
        error,
        'fuscate',
        ErrorType.UNKNOWN,
        {
          userId: message.author.id,
          guildId: message.guild?.id,
          filename: attachment.name,
          filesize: attachment.size
        }
      );
      
      const errorBuilder = new V2MessageBuilder();
      errorBuilder.addText(EMOTES.error, errorMessage);
      
      if (message.guild) {
        const dmResult = await privacyService.sendDM(message.author, errorBuilder.build());
        if (!dmResult.success) {
          return privacyService.getDMFailureMessage(message.content);
        }
        return `${EMOTES.accept} Your private obfuscation request has been received. Check your DMs for updates.`;
      }
      
      return message.reply(errorBuilder.build());
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
