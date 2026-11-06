const BaseCommand = require('./base');
const { EMOTES, DEFAULT_SETTINGS, CONTROL_FLOW_OPTIONS, LAZY_REGIONS_OPTIONS } = require('../config/constants');
const database = require('../database/index');
const privacyService = require('../services/privacy');
const { V2MessageBuilder, createButton, createSelectMenu, createToggleButton, createV2Message, createActionRow } = require('../utils/componentsV2');

class SetupCommand extends BaseCommand {
  constructor() {
    super('setup', 'Configure persistent obfuscation settings', 5000);
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
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.tools, 'ForgeFuscator Setup');
    builder.addSeparator();
    
    builder.addText(null, 'Configure your obfuscation settings below. These settings will be saved and used automatically for all future obfuscation operations.');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, '**Current Settings:**');
    builder.addSeparator();
    
    // Boolean settings
    builder.addText(null, `${this.formatSetting('Anti-Tamper', settings.antiTamper)}`);
    builder.addText(null, `${this.formatSetting('Anti-Hook', settings.antiHook)}`);
    builder.addText(null, `${this.formatSetting('VM Renaming', settings.renameVM)}`);
    builder.addText(null, `${this.formatSetting('Encrypted VM', settings.hideVM)}`);
    builder.addText(null, `${this.formatSetting('Runtime State Chain', settings.runtimeStateChain)}`);
    builder.addSeparator();
    
    // Selectable settings
    builder.addText(null, `**Control Flow:** ${settings.controlFlow}`);
    builder.addText(null, `**Lazy Regions:** ${settings.lazyRegions}`);
    builder.addSeparator();
    
    builder.addText(null, 'Use the buttons below to toggle settings or change options.');
    builder.addSeparator();
    
    // Boolean toggle buttons
    const row1 = createActionRow([
      createToggleButton('toggle_antiTamper', 'Anti-Tamper', settings.antiTamper),
      createToggleButton('toggle_antiHook', 'Anti-Hook', settings.antiHook),
      createToggleButton('toggle_renameVM', 'VM Renaming', settings.renameVM)
    ]);
    
    const row2 = createActionRow([
      createToggleButton('toggle_hideVM', 'Encrypted VM', settings.hideVM),
      createToggleButton('toggle_runtimeStateChain', 'Runtime State Chain', settings.runtimeStateChain)
    ]);
    
    // Select menus
    const row3 = createActionRow([
      createSelectMenu('select_controlFlow', 'Control Flow', 
        CONTROL_FLOW_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.controlFlow === opt }))
      )
    ]);
    
    const row4 = createActionRow([
      createSelectMenu('select_lazyRegions', 'Lazy Regions',
        LAZY_REGIONS_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.lazyRegions === opt }))
      )
    ]);
    
    // Action buttons
    const row5 = createActionRow([
      createButton('setup_save', 'Save Changes', 'Success', EMOTES.accept),
      createButton('setup_reset', 'Reset Defaults', 'Secondary', EMOTES.tools),
      createButton('setup_close', 'Close', 'Danger', EMOTES.false)
    ]);
    
    builder.addActionRow(row1);
    builder.addActionRow(row2);
    builder.addActionRow(row3);
    builder.addActionRow(row4);
    builder.addActionRow(row5);
    
    const v2Message = builder.build();

    // For guilds, send via DM
    if (message.guild) {
      const dmResult = await privacyService.sendDM(message.author, v2Message);
      
      if (dmResult.success) {
        if (privacyService.shouldDeleteOriginalMessage()) {
          await privacyService.tryDeleteOriginalMessage(message);
        }
        return `${EMOTES.accept} Your setup interface has been sent to your DMs.`;
      } else {
        return privacyService.getDMFailureMessage(message.content);
      }
    }

    // For DMs, send directly
    return message.reply(v2Message);
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

    // Update message with new settings
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.tools, 'ForgeFuscator Setup');
    builder.addSeparator();
    
    builder.addText(null, 'Configure your obfuscation settings below.');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, '**Current Settings:**');
    builder.addSeparator();
    
    builder.addText(null, `${this.formatSetting('Anti-Tamper', settings.antiTamper)}`);
    builder.addText(null, `${this.formatSetting('Anti-Hook', settings.antiHook)}`);
    builder.addText(null, `${this.formatSetting('VM Renaming', settings.renameVM)}`);
    builder.addText(null, `${this.formatSetting('Encrypted VM', settings.hideVM)}`);
    builder.addText(null, `${this.formatSetting('Runtime State Chain', settings.runtimeStateChain)}`);
    builder.addSeparator();
    
    builder.addText(null, `**Control Flow:** ${settings.controlFlow}`);
    builder.addText(null, `**Lazy Regions:** ${settings.lazyRegions}`);
    builder.addSeparator();
    
    builder.addText(null, 'Use the buttons below to toggle settings or change options.');
    builder.addSeparator();
    
    // Rebuild action rows with updated settings
    const row1 = createActionRow([
      createToggleButton('toggle_antiTamper', 'Anti-Tamper', settings.antiTamper),
      createToggleButton('toggle_antiHook', 'Anti-Hook', settings.antiHook),
      createToggleButton('toggle_renameVM', 'VM Renaming', settings.renameVM)
    ]);
    
    const row2 = createActionRow([
      createToggleButton('toggle_hideVM', 'Encrypted VM', settings.hideVM),
      createToggleButton('toggle_runtimeStateChain', 'Runtime State Chain', settings.runtimeStateChain)
    ]);
    
    const row3 = createActionRow([
      createSelectMenu('select_controlFlow', 'Control Flow',
        CONTROL_FLOW_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.controlFlow === opt }))
      )
    ]);
    
    const row4 = createActionRow([
      createSelectMenu('select_lazyRegions', 'Lazy Regions',
        LAZY_REGIONS_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.lazyRegions === opt }))
      )
    ]);
    
    const row5 = createActionRow([
      createButton('setup_save', 'Save Changes', 'Success', EMOTES.accept),
      createButton('setup_reset', 'Reset Defaults', 'Secondary', EMOTES.tools),
      createButton('setup_close', 'Close', 'Danger', EMOTES.false)
    ]);
    
    builder.addActionRow(row1);
    builder.addActionRow(row2);
    builder.addActionRow(row3);
    builder.addActionRow(row4);
    builder.addActionRow(row5);
    
    await interaction.update(builder.build());
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
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.tools, 'ForgeFuscator Setup');
    builder.addSeparator();
    
    builder.addText(null, 'Configure your obfuscation settings below.');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, '**Current Settings:**');
    builder.addSeparator();
    
    builder.addText(null, `${this.formatSetting('Anti-Tamper', settings.antiTamper)}`);
    builder.addText(null, `${this.formatSetting('Anti-Hook', settings.antiHook)}`);
    builder.addText(null, `${this.formatSetting('VM Renaming', settings.renameVM)}`);
    builder.addText(null, `${this.formatSetting('Encrypted VM', settings.hideVM)}`);
    builder.addText(null, `${this.formatSetting('Runtime State Chain', settings.runtimeStateChain)}`);
    builder.addSeparator();
    
    builder.addText(null, `**Control Flow:** ${settings.controlFlow}`);
    builder.addText(null, `**Lazy Regions:** ${settings.lazyRegions}`);
    builder.addSeparator();
    
    builder.addText(null, 'Use the buttons below to toggle settings or change options.');
    builder.addSeparator();
    
    // Rebuild action rows
    const row1 = createActionRow([
      createToggleButton('toggle_antiTamper', 'Anti-Tamper', settings.antiTamper),
      createToggleButton('toggle_antiHook', 'Anti-Hook', settings.antiHook),
      createToggleButton('toggle_renameVM', 'VM Renaming', settings.renameVM)
    ]);
    
    const row2 = createActionRow([
      createToggleButton('toggle_hideVM', 'Encrypted VM', settings.hideVM),
      createToggleButton('toggle_runtimeStateChain', 'Runtime State Chain', settings.runtimeStateChain)
    ]);
    
    const row3 = createActionRow([
      createSelectMenu('select_controlFlow', 'Control Flow',
        CONTROL_FLOW_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.controlFlow === opt }))
      )
    ]);
    
    const row4 = createActionRow([
      createSelectMenu('select_lazyRegions', 'Lazy Regions',
        LAZY_REGIONS_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.lazyRegions === opt }))
      )
    ]);
    
    const row5 = createActionRow([
      createButton('setup_save', 'Save Changes', 'Success', EMOTES.accept),
      createButton('setup_reset', 'Reset Defaults', 'Secondary', EMOTES.tools),
      createButton('setup_close', 'Close', 'Danger', EMOTES.false)
    ]);
    
    builder.addActionRow(row1);
    builder.addActionRow(row2);
    builder.addActionRow(row3);
    builder.addActionRow(row4);
    builder.addActionRow(row5);
    
    await interaction.update(builder.build());
  }

  async handleSaveInteraction(interaction) {
    const userId = interaction.user.id;
    const settings = database.getSettings(userId);
    
    if (settings) {
      const builder = new V2MessageBuilder();
      builder.addText(EMOTES.accept, 'Your settings have been saved!');
      await interaction.reply({ ...builder.build(), ephemeral: true });
    } else {
      const builder = new V2MessageBuilder();
      builder.addText(EMOTES.error, 'No settings to save.');
      await interaction.reply({ ...builder.build(), ephemeral: true });
    }
  }

  async handleResetInteraction(interaction) {
    const userId = interaction.user.id;
    
    // Reset to defaults
    database.resetSettingsToDefault(userId);

    const settings = this.convertFromDatabase(DEFAULT_SETTINGS);
    
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.tools, 'ForgeFuscator Setup');
    builder.addSeparator();
    
    builder.addText(null, 'Configure your obfuscation settings below.');
    builder.addSeparator();
    
    builder.addText(EMOTES.tools, '**Current Settings:**');
    builder.addSeparator();
    
    builder.addText(null, `${this.formatSetting('Anti-Tamper', settings.antiTamper)}`);
    builder.addText(null, `${this.formatSetting('Anti-Hook', settings.antiHook)}`);
    builder.addText(null, `${this.formatSetting('VM Renaming', settings.renameVM)}`);
    builder.addText(null, `${this.formatSetting('Encrypted VM', settings.hideVM)}`);
    builder.addText(null, `${this.formatSetting('Runtime State Chain', settings.runtimeStateChain)}`);
    builder.addSeparator();
    
    builder.addText(null, `**Control Flow:** ${settings.controlFlow}`);
    builder.addText(null, `**Lazy Regions:** ${settings.lazyRegions}`);
    builder.addSeparator();
    
    builder.addText(null, 'Use the buttons below to toggle settings or change options.');
    builder.addSeparator();
    
    // Rebuild with defaults
    const row1 = createActionRow([
      createToggleButton('toggle_antiTamper', 'Anti-Tamper', settings.antiTamper),
      createToggleButton('toggle_antiHook', 'Anti-Hook', settings.antiHook),
      createToggleButton('toggle_renameVM', 'VM Renaming', settings.renameVM)
    ]);
    
    const row2 = createActionRow([
      createToggleButton('toggle_hideVM', 'Encrypted VM', settings.hideVM),
      createToggleButton('toggle_runtimeStateChain', 'Runtime State Chain', settings.runtimeStateChain)
    ]);
    
    const row3 = createActionRow([
      createSelectMenu('select_controlFlow', 'Control Flow',
        CONTROL_FLOW_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.controlFlow === opt }))
      )
    ]);
    
    const row4 = createActionRow([
      createSelectMenu('select_lazyRegions', 'Lazy Regions',
        LAZY_REGIONS_OPTIONS.map(opt => ({ label: opt, value: opt, default: settings.lazyRegions === opt }))
      )
    ]);
    
    const row5 = createActionRow([
      createButton('setup_save', 'Save Changes', 'Success', EMOTES.accept),
      createButton('setup_reset', 'Reset Defaults', 'Secondary', EMOTES.tools),
      createButton('setup_close', 'Close', 'Danger', EMOTES.false)
    ]);
    
    builder.addActionRow(row1);
    builder.addActionRow(row2);
    builder.addActionRow(row3);
    builder.addActionRow(row4);
    builder.addActionRow(row5);
    
    await interaction.update(builder.build());

    const confirmBuilder = new V2MessageBuilder();
    confirmBuilder.addText(EMOTES.accept, 'Settings have been reset to defaults.');
    await interaction.followUp({ ...confirmBuilder.build(), ephemeral: true });
  }

  async handleCloseInteraction(interaction) {
    const builder = new V2MessageBuilder();
    builder.addText(EMOTES.accept, 'Setup closed.');
    await interaction.reply({ ...builder.build(), ephemeral: true });
  }
}

module.exports = new SetupCommand();
