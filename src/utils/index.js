// Utility functions

const { v4: uuidv4 } = require('uuid');

class Utils {
  constructor() {}

  // Generate unique IDs
  generateId() {
    return uuidv4();
  }

  generateShortId() {
    return uuidv4().substring(0, 8);
  }

  // Format dates
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date) {
    return new Date(date).toLocaleString();
  }

  formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }

  // Format numbers
  formatNumber(num) {
    return num.toLocaleString();
  }

  // Format file sizes
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Sanitize strings
  sanitizeString(str, maxLength = 100) {
    if (!str) return '';
    return String(str).substring(0, maxLength);
  }

  // Validate Discord IDs
  isValidDiscordId(id) {
    return /^\d{17,19}$/.test(id);
  }

  // Sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry function
  async retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await this.sleep(delay);
        }
      }
    }
    throw lastError;
  }

  // Check if running in production
  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  // Get bot version
  getVersion() {
    return process.env.BOT_VERSION || '1.0.0';
  }

  // Get bot prefix
  getPrefix() {
    return process.env.BOT_PREFIX || 'ff!';
  }
}

// Singleton instance
const utils = new Utils();

module.exports = utils;
