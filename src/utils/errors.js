const { EMOTES } = require('../config/constants');

/**
 * Error types for categorizing errors
 */
const ErrorType = {
  VALIDATION: 'validation',
  API: 'api',
  DATABASE: 'database',
  DISCORD: 'discord',
  PERMISSIONS: 'permissions',
  CONFIGURATION: 'configuration',
  UNKNOWN: 'unknown'
};

/**
 * Error messages mapped to user-friendly messages with appropriate emojis
 */
const ErrorMessages = {
  // Validation errors
  [ErrorType.VALIDATION]: {
    missingAttachment: `${EMOTES.oops} Please attach a Lua, Luau, or TXT file.`,
    invalidFile: `${EMOTES.error} Invalid file. Please upload a valid Lua or Luau source file.`,
    emptyFile: `${EMOTES.error} File is empty. Please upload a file with content.`,
    fileTooLarge: `${EMOTES.error} File is too large. Maximum size: 1MB.`,
    unsupportedExtension: `${EMOTES.error} Unsupported file extension. Use .lua, .luau, or .txt.`,
    invalidSettings: `${EMOTES.error} Invalid settings configuration.`
  },
  
  // API errors
  [ErrorType.API]: {
    apiUnavailable: `${EMOTES.error} Obfuscation API is currently unavailable. Please try again later.`,
    apiTimeout: `${EMOTES.error} API request timed out. Please try again.`,
    apiRejection: `${EMOTES.error} API rejected the request. Check your input and try again.`,
    insufficientCredits: `${EMOTES.error} You don't have enough credits. Use ff!profile to check your balance.`,
    invalidResponse: `${EMOTES.error} API returned an invalid response.`
  },
  
  // Database errors
  [ErrorType.DATABASE]: {
    saveFailed: `${EMOTES.error} Failed to save data. Please try again.`,
    loadFailed: `${EMOTES.error} Failed to load data. Please try again.`
  },
  
  // Discord errors
  [ErrorType.DISCORD]: {
    dmFailed: `${EMOTES.error} Failed to send DM. Please enable DMs from server members.`,
    messageDeleteFailed: `${EMOTES.oops} Could not delete the original message (missing permissions).`,
    uploadFailed: `${EMOTES.error} Failed to upload file. Please try again.`,
    rateLimited: `${EMOTES.oops} You're being rate limited. Please wait and try again.`
  },
  
  // Permissions errors
  [ErrorType.PERMISSIONS]: {
    missingManageMessages: `${EMOTES.oops} I need Manage Messages permission to delete your original message.`,
    insufficientPermissions: `${EMOTES.error} You don't have permission to use this command.`
  },
  
  // Configuration errors
  [ErrorType.CONFIGURATION]: {
    invalidToken: `${EMOTES.error} Invalid Discord token. Check your .env file.`,
    missingToken: `${EMOTES.error} Discord token not configured. Set DISCORD_TOKEN in .env.`,
    apiNotConfigured: `${EMOTES.error} API not configured. Set API_BASE_URL and API_KEY in .env.`
  },
  
  // Unknown errors
  [ErrorType.UNKNOWN]: {
    generic: `${EMOTES.error} An unexpected error occurred. Please try again.`
  }
};

/**
 * Class for handling and logging errors
 */
class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
  }

  /**
   * Log an error with full context
   * @param {Error} error - The error object
   * @param {string} commandName - Name of the command
   * @param {string} errorType - Type of error (from ErrorType)
   * @param {object} context - Additional context (userId, guildId, etc.)
   */
  logError(error, commandName, errorType = ErrorType.UNKNOWN, context = {}) {
    const timestamp = new Date().toISOString();
    const count = (this.errorCounts.get(commandName) || 0) + 1;
    this.errorCounts.set(commandName, count);

    // Sanitize context to avoid logging sensitive data
    const safeContext = this.sanitizeContext(context);

    // Log to console with full details
    console.error(`[ForgeFuscator Error] ${timestamp}`);
    console.error(`  Command: ${commandName}`);
    console.error(`  Type: ${errorType}`);
    console.error(`  Count: ${count}`);
    console.error(`  Context: ${JSON.stringify(safeContext)}`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    console.error('---');

    // Return user-friendly message
    return this.getUserMessage(error, commandName, errorType);
  }

  /**
   * Sanitize context to remove sensitive data
   */
  sanitizeContext(context) {
    const sanitized = { ...context };
    
    // Remove potentially sensitive fields
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.password;
    delete sanitized.secret;
    delete sanitized.source;
    delete sanitized.code;
    
    // Truncate long strings
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...';
      }
    }
    
    return sanitized;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error, commandName, errorType) {
    // Check for specific error patterns
    if (error.code === 'TokenInvalid') {
      return ErrorMessages[ErrorType.CONFIGURATION].invalidToken;
    }

    if (error.message.includes('disallowed intents')) {
      return `${EMOTES.error} Message Content Intent is not enabled. Enable it in Discord Developer Portal.`;
    }

    if (error.message.includes('Missing Permissions') || error.message.includes('missing permissions')) {
      return ErrorMessages[ErrorType.PERMISSIONS].insufficientPermissions;
    }

    if (error.message.includes('rate limit') || error.code === 429) {
      return ErrorMessages[ErrorType.DISCORD].rateLimited;
    }

    // Map error type to messages
    const messages = ErrorMessages[errorType];
    if (messages) {
      // Try to match specific error
      const lowerMessage = error.message.toLowerCase();
      
      if (lowerMessage.includes('no attachment') || lowerMessage.includes('attachment')) {
        return messages.missingAttachment || messages.generic;
      }
      if (lowerMessage.includes('invalid') || lowerMessage.includes('unsupported')) {
        return messages.invalidFile || messages.generic;
      }
      if (lowerMessage.includes('empty')) {
        return messages.emptyFile || messages.generic;
      }
      if (lowerMessage.includes('too large') || lowerMessage.includes('size')) {
        return messages.fileTooLarge || messages.generic;
      }
      if (lowerMessage.includes('credits') || lowerMessage.includes('insufficient')) {
        return messages.insufficientCredits || messages.generic;
      }
      if (lowerMessage.includes('timeout') || lowerMessage.includes('unavailable')) {
        return messages.apiUnavailable || messages.generic;
      }
      if (lowerMessage.includes('dm') || lowerMessage.includes('direct message')) {
        return messages.dmFailed || messages.generic;
      }
      if (lowerMessage.includes('delete') || lowerMessage.includes('manage messages')) {
        return messages.messageDeleteFailed || messages.generic;
      }
      
      return messages.generic || ErrorMessages[ErrorType.UNKNOWN].generic;
    }

    return ErrorMessages[ErrorType.UNKNOWN].generic;
  }

  /**
   * Create a detailed error report
   */
  createErrorReport(error, commandName, errorType, context) {
    return {
      timestamp: new Date().toISOString(),
      command: commandName,
      errorType,
      message: error.message,
      context: this.sanitizeContext(context),
      count: this.errorCounts.get(commandName) || 1
    };
  }

  /**
   * Get error statistics
   */
  getStats() {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Reset error counts
   */
  resetStats() {
    this.errorCounts.clear();
  }
}

module.exports = {
  ErrorHandler,
  ErrorType,
  ErrorMessages
};
