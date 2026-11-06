// Command Manager
const helpCommand = require('./help');
const statusCommand = require('./status');
const setupCommand = require('./setup');
const fuscateCommand = require('./fuscate');
const profileCommand = require('./profile');
const historyCommand = require('./history');
const aboutCommand = require('./about');

const commands = {
  help: helpCommand,
  status: statusCommand,
  setup: setupCommand,
  fuscate: fuscateCommand,
  profile: profileCommand,
  history: historyCommand,
  about: aboutCommand
};

class CommandManager {
  constructor() {
    this.commands = commands;
    this.prefix = process.env.BOT_PREFIX || 'ff!';
  }

  getCommand(name) {
    return this.commands[name.toLowerCase()];
  }

  getAllCommands() {
    return Object.values(this.commands);
  }

  parseCommand(content) {
    if (!content.startsWith(this.prefix)) {
      return null;
    }

    const parts = content.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    return {
      name: commandName,
      args
    };
  }

  async handleMessage(message) {
    const parsed = this.parseCommand(message.content);
    
    if (!parsed) {
      return false; // Not a command
    }

    const command = this.getCommand(parsed.name);
    
    if (!command) {
      return false; // Unknown command
    }

    try {
      await command.execute(message, parsed.args);
      return true;
    } catch (error) {
      console.error(`Command ${parsed.name} failed:`, error);
      await message.reply(`<:error:1568270912074162296> An error occurred while executing that command.`);
      return true;
    }
  }

  async handleInteraction(interaction) {
    if (!interaction.isButton() && !interaction.isSelectMenu()) {
      return false;
    }

    const customId = interaction.customId;
    const userId = interaction.user.id;

    // Handle setup command interactions
    if (customId.startsWith('toggle_')) {
      const settingName = customId.replace('toggle_', '');
      await setupCommand.handleToggleInteraction(interaction, settingName);
      return true;
    }

    if (customId.startsWith('select_')) {
      const settingName = customId.replace('select_', '');
      const selectedValue = interaction.values[0];
      await setupCommand.handleSelectInteraction(interaction, settingName, selectedValue);
      return true;
    }

    if (customId === 'setup_save') {
      await setupCommand.handleSaveInteraction(interaction);
      return true;
    }

    if (customId === 'setup_reset') {
      await setupCommand.handleResetInteraction(interaction);
      return true;
    }

    if (customId === 'setup_close') {
      await setupCommand.handleCloseInteraction(interaction);
      return true;
    }

    // Handle profile command interactions
    if (customId.startsWith('profile_refresh_')) {
      await profileCommand.handleRefreshInteraction(interaction);
      return true;
    }

    if (customId.startsWith('profile_history_')) {
      await profileCommand.handleHistoryInteraction(interaction);
      return true;
    }

    // Handle history command interactions
    if (customId.startsWith('history_refresh_')) {
      await historyCommand.handleRefreshInteraction(interaction);
      return true;
    }

    if (customId.startsWith('history_clear_')) {
      await historyCommand.handleClearInteraction(interaction);
      return true;
    }

    // Handle about command interactions
    if (customId === 'about_info') {
      await aboutCommand.handleInfoInteraction(interaction);
      return true;
    }

    if (customId === 'about_stats') {
      await aboutCommand.handleStatsInteraction(interaction);
      return true;
    }

    // Handle status command interactions
    if (customId === 'status_refresh') {
      const status = await statusCommand.getStatus();
      const components = require('../components').buildStatusComponents();
      await interaction.update({
        content: status,
        components
      });
      return true;
    }

    // Handle error dismissal
    if (customId === 'error_dismiss' || customId === 'success_ok') {
      await interaction.reply({
        content: '<:accept:1568270862686228661> Dismissed.',
        ephemeral: true
      });
      return true;
    }

    return false;
  }
}

module.exports = new CommandManager();
