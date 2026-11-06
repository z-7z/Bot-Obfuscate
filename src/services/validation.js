const fs = require('fs');
const path = require('path');
const { SUPPORTED_EXTENSIONS, FILE_CONFIG } = require('../config/constants');

class ValidationService {
  constructor() {
    this.maxFileSize = FILE_CONFIG.maxSize;
    this.supportedExtensions = SUPPORTED_EXTENSIONS;
  }

  validateAttachment(attachment) {
    const errors = [];
    
    // Check if attachment exists
    if (!attachment) {
      errors.push('No attachment provided');
      return { valid: false, errors };
    }

    // Check file size
    if (attachment.size > this.maxFileSize) {
      errors.push(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
      return { valid: false, errors };
    }

    // Check file extension
    const extension = path.extname(attachment.name).toLowerCase();
    if (!this.supportedExtensions.includes(extension)) {
      errors.push(`Unsupported file extension: ${extension}`);
      return { valid: false, errors };
    }

    return { valid: true, errors };
  }

  async validateFileContent(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      
      // Check if file is empty
      if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Empty file' };
      }

      // Check if content is valid Lua/Luau
      const isValid = this.isValidLua(content);
      
      if (!isValid) {
        return { valid: false, error: 'Invalid Lua/Luau source code' };
      }

      return { valid: true, content, language: this.detectLanguage(content, filePath) };
    } catch (error) {
      return { valid: false, error: `Failed to read file: ${error.message}` };
    }
  }

  isValidLua(content) {
    // Basic validation for Lua/Luau syntax
    // This is a simple check and doesn't guarantee the code is valid
    // but helps filter out obviously non-Lua files
    
    const trimmed = content.trim();
    
    // Check for common Lua patterns
    const luaPatterns = [
      /^\s*--/,
      /\bfunction\b/,
      /\blocal\b/,
      /\bend\b/,
      /\bthen\b/,
      /\bdo\b/,
      /\bif\b/,
      /\bfor\b/,
      /\bwhile\b/,
      /\breturn\b/,
      /\bprint\b/
    ];
    
    // Check if any Lua pattern exists
    const hasLuaPattern = luaPatterns.some(pattern => pattern.test(trimmed));
    
    // Check for invalid characters that would break Lua
    const invalidPatterns = [
      /<\?php/,
      /<\?=/,
      /\bimport\b.*\bfrom\b/,
      /\bclass\b.*\{/,
      /\bpublic\b.*\bstatic\b/,
      /\bfunction\s*\(/ // This might be too strict
    ];
    
    const hasInvalidPattern = invalidPatterns.some(pattern => pattern.test(trimmed));
    
    return hasLuaPattern || !hasInvalidPattern;
  }

  detectLanguage(content, filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    if (extension === '.luau') {
      return 'Luau';
    } else if (extension === '.lua') {
      return 'Lua';
    }
    
    // Try to detect from content
    const trimmed = content.trim();
    
    // Luau-specific patterns
    const luauPatterns = [
      /--!/,
      /type\s+\w+\s*=/,
      /\bexport\b/,
      /\bnamespace\b/,
      /\binterface\b/,
      /\bclass\b/,
      /\bextends\b/,
      /\bimplements\b/
    ];
    
    const isLuau = luauPatterns.some(pattern => pattern.test(trimmed));
    
    return isLuau ? 'Luau' : 'Lua';
  }

  validateSettings(settings) {
    const errors = [];
    
    // Boolean settings
    const booleanSettings = ['antiTamper', 'antiHook', 'renameVM', 'hideVM', 'runtimeLease', 'runtimeStateChain', 'sensitiveProfiles', 'hybrid'];
    
    for (const setting of booleanSettings) {
      if (settings[setting] !== undefined && typeof settings[setting] !== 'boolean') {
        errors.push(`${setting} must be a boolean`);
      }
    }
    
    // Selectable settings
    const selectableSettings = ['controlFlow', 'lazyRegions'];
    const validOptions = ['Auto', 'On', 'Off'];
    
    for (const setting of selectableSettings) {
      if (settings[setting] !== undefined && !validOptions.includes(settings[setting])) {
        errors.push(`${setting} must be one of: ${validOptions.join(', ')}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateCredits(user, cost) {
    if (user.credits < cost) {
      return { valid: false, error: 'Insufficient credits' };
    }
    return { valid: true };
  }

  sanitizeFilename(filename) {
    // Remove path information and special characters
    const basename = path.basename(filename);
    // Remove potentially dangerous characters
    return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}

// Singleton instance
const validationService = new ValidationService();

module.exports = validationService;
