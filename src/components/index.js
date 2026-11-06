const { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('discord.js');
const { EMOTES, DEFAULT_SETTINGS, CONTROL_FLOW_OPTIONS, LAZY_REGIONS_OPTIONS } = require('../config/constants');

class ComponentBuilder {
  constructor() {}

  // Help command components
  buildHelpComponents() {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_page_1')
            .setLabel('Commands')
            .setStyle('Primary')
            .setEmoji('📋'),
          new ButtonBuilder()
            .setCustomId('help_page_2')
            .setLabel('Settings')
            .setStyle('Primary')
            .setEmoji('⚙️'),
          new ButtonBuilder()
            .setCustomId('help_page_3')
            .setLabel('About')
            .setStyle('Primary')
            .setEmoji('ℹ️')
        )
    ];
  }

  // Setup command components
  buildSetupComponents(currentSettings) {
    const settings = currentSettings || DEFAULT_SETTINGS;
    
    // Boolean toggle buttons
    const antiTamperButton = new ButtonBuilder()
      .setCustomId('toggle_antiTamper')
      .setLabel('Anti-Tamper')
      .setStyle(settings.antiTamper ? 'Success' : 'Danger')
      .setEmoji(settings.antiTamper ? EMOTES.accept : EMOTES.false);

    const antiHookButton = new ButtonBuilder()
      .setCustomId('toggle_antiHook')
      .setLabel('Anti-Hook')
      .setStyle(settings.antiHook ? 'Success' : 'Danger')
      .setEmoji(settings.antiHook ? EMOTES.accept : EMOTES.false);

    const vmRenameButton = new ButtonBuilder()
      .setCustomId('toggle_renameVM')
      .setLabel('VM Renaming')
      .setStyle(settings.renameVM ? 'Success' : 'Danger')
      .setEmoji(settings.renameVM ? EMOTES.accept : EMOTES.false);

    const encryptedVMButton = new ButtonBuilder()
      .setCustomId('toggle_hideVM')
      .setLabel('Encrypted VM')
      .setStyle(settings.hideVM ? 'Success' : 'Danger')
      .setEmoji(settings.hideVM ? EMOTES.accept : EMOTES.false);

    const runtimeChainButton = new ButtonBuilder()
      .setCustomId('toggle_runtimeStateChain')
      .setLabel('Runtime State Chain')
      .setStyle(settings.runtimeStateChain ? 'Success' : 'Danger')
      .setEmoji(settings.runtimeStateChain ? EMOTES.accept : EMOTES.false);

    const row1 = new ActionRowBuilder()
      .addComponents(antiTamperButton, antiHookButton, vmRenameButton);

    const row2 = new ActionRowBuilder()
      .addComponents(encryptedVMButton, runtimeChainButton);

    // Select menus for control flow and lazy regions
    const controlFlowMenu = new SelectMenuBuilder()
      .setCustomId('select_controlFlow')
      .setPlaceholder('Control Flow')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        CONTROL_FLOW_OPTIONS.map(option => ({
          label: option,
          value: option,
          default: settings.controlFlow === option
        }))
      );

    const lazyRegionsMenu = new SelectMenuBuilder()
      .setCustomId('select_lazyRegions')
      .setPlaceholder('Lazy Regions')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        LAZY_REGIONS_OPTIONS.map(option => ({
          label: option,
          value: option,
          default: settings.lazyRegions === option
        }))
      );

    const row3 = new ActionRowBuilder()
      .addComponents(controlFlowMenu);

    const row4 = new ActionRowBuilder()
      .addComponents(lazyRegionsMenu);

    // Action buttons
    const saveButton = new ButtonBuilder()
      .setCustomId('setup_save')
      .setLabel('Save Changes')
      .setStyle('Success')
      .setEmoji(EMOTES.accept);

    const resetButton = new ButtonBuilder()
      .setCustomId('setup_reset')
      .setLabel('Reset Defaults')
      .setStyle('Secondary')
      .setEmoji(EMOTES.tools);

    const closeButton = new ButtonBuilder()
      .setCustomId('setup_close')
      .setLabel('Close')
      .setStyle('Danger')
      .setEmoji(EMOTES.false);

    const row5 = new ActionRowBuilder()
      .addComponents(saveButton, resetButton, closeButton);

    return [row1, row2, row3, row4, row5];
  }

  // Status command components
  buildStatusComponents() {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('status_refresh')
            .setLabel('Refresh')
            .setStyle('Primary')
            .setEmoji('🔄')
        )
    ];
  }

  // Profile command components
  buildProfileComponents(userId) {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`profile_refresh_${userId}`)
            .setLabel('Refresh')
            .setStyle('Primary')
            .setEmoji('🔄'),
          new ButtonBuilder()
            .setCustomId(`profile_history_${userId}`)
            .setLabel('View History')
            .setStyle('Secondary')
            .setEmoji('📜')
        )
    ];
  }

  // History command components
  buildHistoryComponents(userId) {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`history_refresh_${userId}`)
            .setLabel('Refresh')
            .setStyle('Primary')
            .setEmoji('🔄'),
          new ButtonBuilder()
            .setCustomId(`history_clear_${userId}`)
            .setLabel('Clear History')
            .setStyle('Danger')
            .setEmoji('🗑️')
        )
    ];
  }

  // About command components
  buildAboutComponents() {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('about_info')
            .setLabel('Information')
            .setStyle('Primary')
            .setEmoji(EMOTES.question),
          new ButtonBuilder()
            .setCustomId('about_stats')
            .setLabel('Statistics')
            .setStyle('Secondary')
            .setEmoji('📊')
        )
    ];
  }

  // Fuscate command components
  buildFuscateComponents() {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fuscate_settings')
            .setLabel('Change Settings')
            .setStyle('Secondary')
            .setEmoji(EMOTES.tools),
          new ButtonBuilder()
            .setCustomId('fuscate_help')
            .setLabel('Help')
            .setStyle('Secondary')
            .setEmoji(EMOTES.question)
        )
    ];
  }

  // Error handling components
  buildErrorComponents() {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('error_dismiss')
            .setLabel('Dismiss')
            .setStyle('Danger')
            .setEmoji(EMOTES.error)
        )
    ];
  }

  // Success components
  buildSuccessComponents() {
    return [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('success_ok')
            .setLabel('OK')
            .setStyle('Success')
            .setEmoji(EMOTES.accept)
        )
    ];
  }
}

// Singleton instance
const componentBuilder = new ComponentBuilder();

module.exports = componentBuilder;
