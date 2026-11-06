const BaseCommand = require('./base');
const { EMOTES, DEFAULT_SETTINGS } = require('../config/constants');
const database = require('../database/index');
const componentBuilder = require('../components');
const privacyService = require('../services/privacy');

class SetupCommand extends BaseCommand {
  constructor() {
    super('setup', 'Configure persistent obfuscation settings', 5000);
    this.setupSessions = new Map();
  }

  async executeCommand(message, args) {
    // Get user settings
    const userId = message.author.id;
    let settings = database.getSettings(userId);
    
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
      database.createSettings(userId, settings);
    } else {
      // Convert from database format
      settings = this.convertFromDatabase(settings);
    }

    // Build setup message with current settings
    const setupMessage = this.buildSetupMessage(settings);
    const components = componentBuilder.buildSetupComponents(settings);

    // For guilds, send via DM
    if (message.guild) {
      const dmResult = await privacyService.sendDM(message.author, {
        content: setupMessage,
        components
      });
      
      if (dmResult.success) {
        if (privacyService.shouldDeleteOriginalMessage()) {
          await privacyService.tryDeleteOriginalMessage(message);
        }
        return `${EMOTES.accept} Your setup interface has been sent to your DMs.`;
      } else {
        return `${EMOTES.error} I couldn't send you a DM. Please enable DMs and try again.`;
      }
    }

    // For DMs, send directly
    return message.reply({
      content: setupMessage,
      components
    });
  }

  convertFromDatabase(dbSettings) {
    return {
      antiTamper: Boolean(dbSettings.antiTamper),
      antiHook: Boolean(dbSettings.antiHook),
      renameVM: Boolean(dbSettings.renameVM),
      hideVM: Boolean(dbSettings.hideVM),
      controlFlow: dbSettings.controlFlow || 'Auto',
      runtimeLease: Boolean(dbSettings.runtimeLease),
      runtimeStateChain: Boolean(dbSettings.runtimeStateChain),
      lazyRegions: dbSettings.lazyRegions || 'Auto',
      sensitiveProfiles: Boolean(dbSettings.sensitiveProfiles),
      hybrid: Boolean(dbSettings.hybrid)
    };
  }

  convertToDatabase(settings) {
    return {
      antiTamper: settings.antiTamper ? 1 : 0,
      antiHook: settings.antiHook ? 1 : 0,
      renameVM: settings.renameVM ? 1 : 0,
      hideVM: settings.hideVM ? 1 : 0,
      controlFlow: settings.controlFlow,
      runtimeLease: settings.runtimeLease ? 1 : 0,
      runtimeStateChain: settings.runtimeStateChain ? 1 : 0,
      lazyRegions: settings.lazyRegions,
      sensitiveProfiles: settings.sensitiveProfiles ? 1 : 0,
      hybrid: settings.hybrid ? 1 : 0
    };
  }

  buildSetupMessage(settings) {
    return `${EMOTES.tools} **ForgeFuscator Setup**

Configure your obfuscation settings below. These settings will be saved and used automatically for all future obfuscation operations.

**Current Settings:**

${this.formatSetting('Anti-Tamper', settings.antiTamper)}
${this.formatSetting('Anti-Hook', settings.antiHook)}
${this.formatSetting('VM Renaming', settings.renameVM)}
${this.formatSetting('Encrypted VM', settings.hideVM)}
${this.formatSetting('Runtime State Chain', settings.runtimeStateChain)}

**Control Flow:** ${settings.controlFlow}
**Lazy Regions:** ${settings.lazyRegions}

Use the buttons below to toggle settings or change options.`;
  }

  formatSetting(name, value) {
    const emoji = value ? EMOTES.accept : EMOTES.false;
    return `${emoji} **${name}:** ${value ? 'On' : 'Off'}`;
  }

  // Handle component interactions
  async handleToggleInteraction(interaction, settingName) {
    const userId = interaction.user.id;
    let settings = database.getSettings(userId);
    
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
    } else {
      settings = this.convertFromDatabase(settings);
    }

    // Toggle the setting
    settings[settingName] = !settings[settingName];

    // Update database
    database.updateSettings(userId, this.convertToDatabase(settings));

    // Update message
    const setupMessage = this.buildSetupMessage(settings);
    const components = componentBuilder.buildSetupComponents(settings);

    await interaction.update({
      content: setupMessage,
      components
    });
  }

  async handleSelectInteraction(interaction, settingName, selectedValue) {
    const userId = interaction.user.id;
    let settings = database.getSettings(userId);
    
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
    } else {
      settings = this.convertFromDatabase(settings);
    }

    // Update the setting
    settings[settingName] = selectedValue;

    // Update database
    database.updateSettings(userId, this.convertToDatabase(settings));

    // Update message
    const setupMessage = this.buildSetupMessage(settings);
    const components = componentBuilder.buildSetupComponents(settings);

    await interaction.update({
      content: setupMessage,
      components
    });
  }

  async handleSaveInteraction(interaction) {
    const userId = interaction.user.id;
    const settings = database.getSettings(userId);
    
    if (settings) {
      await interaction.reply({
        content: `${EMOTES.accept} Your settings have been saved!`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: `${EMOTES.error} No settings to save.`,
        ephemeral: true
      });
    }
  }

  async handleResetInteraction(interaction) {
    const userId = interaction.user.id;
    
    // Reset to defaults
    database.resetSettingsToDefault(userId);

    const settings = this.convertFromDatabase(DEFAULT_SETTINGS);
    const setupMessage = this.buildSetupMessage(settings);
    const components = componentBuilder.buildSetupComponents(settings);

    await interaction.update({
      content: setupMessage,
      components
    });

    await interaction.followUp({
      content: `${EMOTES.accept} Settings have been reset to defaults.`,
      ephemeral: true
    });
  }

  async handleCloseInteraction(interaction) {
    await interaction.reply({
      content: `${EMOTES.accept} Setup closed.`,
      ephemeral: true
    });
  }
}

module.exports = new SetupCommand();
