const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const apiService = require('./api');
const validationService = require('./validation');
const creditsService = require('./credits');
const database = require('../database/index');
const { FILE_CONFIG, EMOTES } = require('../config/constants');

class ObfuscationService {
  constructor() {
    this.tempDir = FILE_CONFIG.tempDir;
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async obfuscateFile(attachment, userId, settings) {
    const operationId = uuidv4();
    const startTime = Date.now();
    
    try {
      // Validate file
      const validation = validationService.validateAttachment(attachment);
      if (!validation.valid) {
        await database.createOperation({
          operationId,
          userId,
          filename: attachment.name,
          language: 'Unknown',
          status: 'failed',
          duration: Date.now() - startTime
        });
        
        return {
          success: false,
          error: validation.errors[0],
          operationId
        };
      }

      // Download and validate file content
      const tempFilePath = path.join(this.tempDir, `${operationId}_${attachment.name}`);
      await this.downloadAttachment(attachment, tempFilePath);
      
      const contentValidation = await validationService.validateFileContent(tempFilePath);
      if (!contentValidation.valid) {
        this.cleanupFile(tempFilePath);
        
        await database.createOperation({
          operationId,
          userId,
          filename: attachment.name,
          language: 'Unknown',
          status: 'failed',
          duration: Date.now() - startTime
        });
        
        return {
          success: false,
          error: contentValidation.error,
          operationId
        };
      }

      // Check credits
      const cost = creditsService.getOperationCost();
      const hasCredits = await creditsService.hasSufficientCredits(userId, cost);
      
      if (!hasCredits) {
        this.cleanupFile(tempFilePath);
        
        await database.createOperation({
          operationId,
          userId,
          filename: attachment.name,
          language: contentValidation.language,
          status: 'failed',
          duration: Date.now() - startTime
        });
        
        return {
          success: false,
          error: 'Insufficient credits',
          operationId
        };
      }

      // Prepare options for API
      const options = this.prepareOptions(settings);
      
      // Call external API
      const apiResult = await apiService.obfuscate(contentValidation.content, options);
      
      if (!apiResult.success) {
        this.cleanupFile(tempFilePath);
        
        await database.createOperation({
          operationId,
          userId,
          filename: attachment.name,
          language: contentValidation.language,
          status: 'failed',
          duration: Date.now() - startTime
        });
        
        creditsService.incrementFailedOps(userId);
        
        return {
          success: false,
          error: apiResult.error,
          operationId
        };
      }

      // Deduct credits (only after successful API call)
      const creditsResult = await creditsService.deductCredits(userId, cost, 'obfuscation');
      if (!creditsResult.success) {
        // This should not happen if we checked credits before
        // But handle it just in case
        this.cleanupFile(tempFilePath);
        
        await database.createOperation({
          operationId,
          userId,
          filename: attachment.name,
          language: contentValidation.language,
          status: 'failed',
          duration: Date.now() - startTime
        });
        
        return {
          success: false,
          error: creditsResult.error,
          operationId
        };
      }

      // Create obfuscated file
      const outputFilename = this.generateOutputFilename(attachment.name);
      const outputPath = path.join(this.tempDir, `${operationId}_${outputFilename}`);
      
      await fs.promises.writeFile(outputPath, apiResult.code, 'utf8');
      
      // Record successful operation
      const duration = Date.now() - startTime;
      await database.createOperation({
        operationId,
        userId,
        filename: attachment.name,
        language: contentValidation.language,
        status: 'success',
        duration
      });
      
      creditsService.incrementSuccessfulOps(userId);
      
      return {
        success: true,
        operationId,
        originalFilename: attachment.name,
        outputFilename,
        outputPath,
        language: contentValidation.language,
        duration,
        newBalance: creditsResult.newBalance
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await database.createOperation({
        operationId,
        userId,
        filename: attachment.name,
        language: 'Unknown',
        status: 'failed',
        duration
      });
      
      creditsService.incrementFailedOps(userId);
      
      return {
        success: false,
        error: error.message,
        operationId
      };
    }
  }

  prepareOptions(settings) {
    // Map database settings to API options
    const options = {};
    
    if (settings.antiTamper !== undefined) options.antiTamper = Boolean(settings.antiTamper);
    if (settings.antiHook !== undefined) options.antiHook = Boolean(settings.antiHook);
    if (settings.renameVM !== undefined) options.renameVM = Boolean(settings.renameVM);
    if (settings.hideVM !== undefined) options.hideVM = Boolean(settings.hideVM);
    if (settings.controlFlow !== undefined) {
      options.controlFlow = settings.controlFlow === 'On' || settings.controlFlow === true;
    }
    if (settings.runtimeLease !== undefined) options.runtimeLease = Boolean(settings.runtimeLease);
    if (settings.runtimeStateChain !== undefined) options.runtimeStateChain = Boolean(settings.runtimeStateChain);
    if (settings.lazyRegions !== undefined) {
      options.lazyRegions = settings.lazyRegions === 'On' || settings.lazyRegions === true;
    }
    if (settings.sensitiveProfiles !== undefined) options.sensitiveProfiles = Boolean(settings.sensitiveProfiles);
    if (settings.hybrid !== undefined) options.hybrid = Boolean(settings.hybrid);
    
    return options;
  }

  generateOutputFilename(originalFilename) {
    const extension = path.extname(originalFilename);
    const basename = path.basename(originalFilename, extension);
    return `${basename}_obfuscated.lua`;
  }

  async downloadAttachment(attachment, destinationPath) {
    const response = await fetch(attachment.url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(destinationPath, buffer);
  }

  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error.message);
    }
  }

  async cleanupOperationFiles(operationId) {
    try {
      const files = fs.readdirSync(this.tempDir);
      const operationFiles = files.filter(file => file.startsWith(`${operationId}_`));
      
      for (const file of operationFiles) {
        const filePath = path.join(this.tempDir, file);
        this.cleanupFile(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup operation files for ${operationId}:`, error.message);
    }
  }

  async cleanupAllTempFiles() {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const oneHourAgo = now - 3600000; // 1 hour
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stat = await fs.promises.stat(filePath);
        
        // Delete files older than 1 hour
        if (stat.mtimeMs < oneHourAgo) {
          this.cleanupFile(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error.message);
    }
  }
}

// Singleton instance
const obfuscationService = new ObfuscationService();

module.exports = obfuscationService;
