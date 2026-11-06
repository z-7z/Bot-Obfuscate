const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const componentBuilder = require('../components');

class HelpCommand extends BaseCommand {
  constructor() {
    super('help', 'Display available commands', 3000);
  }

  async executeCommand(message, args) {
    const helpMessage = this.buildHelpMessage();
    const components = componentBuilder.buildHelpComponents();
    
    return message.reply({
      content: helpMessage,
      components
    });
  }

  buildHelpMessage() {
    return `${EMOTES.question} **ForgeFuscator Help**

**Available Commands:**

${EMOTES.question} **ff!help** - Display this help message
${EMOTES.question} **ff!status** - Check bot and API status
${EMOTES.tools} **ff!setup** - Configure obfuscation settings
${EMOTES.files} **ff!fuscate** - Obfuscate Lua/Luau files
${EMOTES.question} **ff!profile** - View your profile and credits
${EMOTES.question} **ff!history** - View your obfuscation history
${EMOTES.question} **ff!about** - Display bot information

**Usage Notes:**
- All obfuscation is performed by an external API
- Settings persist across bot restarts
- Sensitive commands in servers will use DMs for privacy
- File attachments: .lua, .luau, .txt

Type "` + process.env.BOT_PREFIX + `help" followed by a command name for more details.`;
  }
}

module.exports = new HelpCommand();
