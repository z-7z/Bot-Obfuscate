// Emoji to usage mapping for consistent usage
const EMOTES = require('./constants').EMOTES;

// Map usage contexts to appropriate emojis
const emojiMap = {
  // Settings and configuration
  settings: EMOTES.tools,
  config: EMOTES.tools,
  setup: EMOTES.tools,
  
  // Help and information
  help: EMOTES.question,
  info: EMOTES.question,
  about: EMOTES.question,
  status: EMOTES.question,
  
  // Success states
  success: EMOTES.accept,
  done: EMOTES.accept,
  enabled: EMOTES.accept,
  
  // Disabled/negative states
  disabled: EMOTES.false,
  off: EMOTES.false,
  
  // Errors and failures
  error: EMOTES.error,
  fail: EMOTES.error,
  failed: EMOTES.error,
  
  // File operations
  file: EMOTES.files,
  attachment: EMOTES.files,
  upload: EMOTES.files,
  
  // Language identification
  lua: EMOTES.lua,
  luau: EMOTES.luau,
  
  // Warnings and issues
  warning: EMOTES.oops,
  issue: EMOTES.oops,
  missing: EMOTES.oops,
  
  // Commands
  help: EMOTES.question,
  status: EMOTES.question,
  setup: EMOTES.tools,
  fuscate: EMOTES.files,
  profile: EMOTES.question,
  history: EMOTES.question,
  about: EMOTES.question
};

function getEmoji(context) {
  return emojiMap[context.toLowerCase()] || '';
}

module.exports = { EMOTES, getEmoji };
