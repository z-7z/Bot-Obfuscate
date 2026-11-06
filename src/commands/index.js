// Command Manager
const { ErrorHandler, ErrorType } = require('../utils/errors');
const errorHandler = new ErrorHandler();

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
      // Use error handler for detailed logging and user-friendly messages
      const errorMessage = errorHandler.logError(
        error,
        parsed.name,
        ErrorType.UNKNOWN,
        {
          userId: message.author.id,
          guildId: message.guild?.id,
          channelId: message.channel.id,
          command: parsed.name,
          args: parsed.args
        }
      );

      try {
        await message.reply(errorMessage);
      } catch (replyError) {
        console.error(`[ForgeFuscator] Failed to send error reply:`, replyError);
      }
      return true;
    }
  }

  async handleInteraction(interaction) {
    try {
      if (!interaction.isButton() && !interaction.isSelectMenu()) {
        return false;
      }

      const customId = interaction.customId;

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
        await statusCommand.handleRefreshInteraction(interaction);
        return true;
      }

      // Handle help command interactions
      if (customId === 'help_commands') {
        await helpCommand.handleCommandsInteraction(interaction);
        return true;
      }
      if (customId === 'help_settings') {
        await helpCommand.handleSettingsInteraction(interaction);
        return true;
      }
      if (customId === 'help_about') {
        await helpCommand.handleAboutInteraction(interaction);
        return true;
      }
      if (customId === 'help_back') {
        await helpCommand.handleBackInteraction(interaction);
        return true;
      }

      // Handle profile back
      if (customId === 'profile_back') {
        await profileCommand.handleRefreshInteraction(interaction);
        return true;
      }

      // Handle error dismissal
      if (customId === 'error_dismiss' || customId === 'success_ok') {
        const { V2MessageBuilder } = require('../utils/componentsV2');
        const builder = new V2MessageBuilder();
        builder.addText(EMOTES.accept, 'Dismissed.');
        await interaction.reply({ ...builder.build(), ephemeral: true });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = errorHandler.logError(
        error,
        'interaction_handler',
        ErrorType.UNKNOWN,
        { userId: interaction.user.id }
      );

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error(`[ForgeFuscator] Failed to send interaction error reply:`, replyError);
      }
      return false;
    }
  }
}

module.exports = new CommandManager();
