const database = require('../database/index');
const { CREDITS_CONFIG } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

class CreditsService {
  constructor() {
    this.operationCost = CREDITS_CONFIG.operationCost;
    this.initialCredits = CREDITS_CONFIG.initialCredits;
  }

  async getBalance(userId) {
    const user = database.getUser(userId);
    return user ? user.credits : 0;
  }

  async hasSufficientCredits(userId, cost = null) {
    const actualCost = cost !== null ? cost : this.operationCost;
    const balance = await this.getBalance(userId);
    return balance >= actualCost;
  }

  async deductCredits(userId, amount, reason = 'obfuscation') {
    const balance = await this.getBalance(userId);
    
    if (balance < amount) {
      return { success: false, error: 'Insufficient credits' };
    }
    
    try {
      // Use transaction for atomic operation
      database.db.exec('BEGIN TRANSACTION');
      
      database.decrementCredits(userId, amount);
      
      // Record transaction
      const transactionId = uuidv4();
      database.createTransaction({
        transactionId,
        userId,
        amount: -amount,
        reason
      });
      
      database.db.exec('COMMIT');
      
      return { success: true, newBalance: balance - amount };
    } catch (error) {
      database.db.exec('ROLLBACK');
      return { success: false, error: error.message };
    }
  }

  async addCredits(userId, amount, reason = 'initial') {
    try {
      database.db.exec('BEGIN TRANSACTION');
      
      database.incrementCredits(userId, amount);
      
      // Record transaction
      const transactionId = uuidv4();
      database.createTransaction({
        transactionId,
        userId,
        amount,
        reason
      });
      
      database.db.exec('COMMIT');
      
      return { success: true, newBalance: await this.getBalance(userId) };
    } catch (error) {
      database.db.exec('ROLLBACK');
      return { success: false, error: error.message };
    }
  }

  async initializeUser(userId, username) {
    const user = database.getUser(userId);
    
    if (!user) {
      database.createUser(userId, username);
      
      // Add initial credits
      await this.addCredits(userId, this.initialCredits, 'initial credits');
      
      // Create default settings
      const { DEFAULT_SETTINGS } = require('../config/constants');
      database.createSettings(userId, DEFAULT_SETTINGS);
      
      return { success: true, initialCredits: this.initialCredits };
    }
    
    return { success: true, initialCredits: user.credits };
  }

  getOperationCost() {
    return this.operationCost;
  }

  setOperationCost(cost) {
    this.operationCost = cost;
  }
}

// Singleton instance
const creditsService = new CreditsService();

module.exports = creditsService;
