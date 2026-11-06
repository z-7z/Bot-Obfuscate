const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { DEFAULT_SETTINGS } = require('../config/constants');

class ForgeFuscatorDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.settingsFile = path.join(this.dataDir, 'settings.json');
    this.operationsFile = path.join(this.dataDir, 'operations.json');
    this.transactionsFile = path.join(this.dataDir, 'transactions.json');
    
    this.users = {};
    this.settings = {};
    this.operations = {};
    this.transactions = {};
    
    this.initialize();
  }

  initialize() {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Load or initialize data files
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.usersFile)) {
        const data = fs.readFileSync(this.usersFile, 'utf8');
        this.users = JSON.parse(data);
      }
    } catch (error) {
      console.error('[Database] Error loading users:', error.message);
      this.users = {};
    }

    try {
      if (fs.existsSync(this.settingsFile)) {
        const data = fs.readFileSync(this.settingsFile, 'utf8');
        this.settings = JSON.parse(data);
      }
    } catch (error) {
      console.error('[Database] Error loading settings:', error.message);
      this.settings = {};
    }

    try {
      if (fs.existsSync(this.operationsFile)) {
        const data = fs.readFileSync(this.operationsFile, 'utf8');
        this.operations = JSON.parse(data);
      }
    } catch (error) {
      console.error('[Database] Error loading operations:', error.message);
      this.operations = {};
    }

    try {
      if (fs.existsSync(this.transactionsFile)) {
        const data = fs.readFileSync(this.transactionsFile, 'utf8');
        this.transactions = JSON.parse(data);
      }
    } catch (error) {
      console.error('[Database] Error loading transactions:', error.message);
      this.transactions = {};
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2), 'utf8');
    } catch (error) {
      console.error('[Database] Error saving users:', error.message);
    }

    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(this.settings, null, 2), 'utf8');
    } catch (error) {
      console.error('[Database] Error saving settings:', error.message);
    }

    try {
      fs.writeFileSync(this.operationsFile, JSON.stringify(this.operations, null, 2), 'utf8');
    } catch (error) {
      console.error('[Database] Error saving operations:', error.message);
    }

    try {
      fs.writeFileSync(this.transactionsFile, JSON.stringify(this.transactions, null, 2), 'utf8');
    } catch (error) {
      console.error('[Database] Error saving transactions:', error.message);
    }
  }

  // User operations
  getUser(userId) {
    return this.users[userId];
  }

  createUser(userId, username) {
    this.users[userId] = {
      userId,
      username,
      credits: 10,
      registeredAt: Math.floor(Date.now() / 1000),
      successfulOperations: 0,
      failedOperations: 0
    };
    this.saveData();
    return this.users[userId];
  }

  updateUserCredits(userId, credits) {
    if (this.users[userId]) {
      this.users[userId].credits = credits;
      this.saveData();
    }
  }

  updateUserStats(userId, successfulOps, failedOps) {
    if (this.users[userId]) {
      this.users[userId].successfulOperations = successfulOps;
      this.users[userId].failedOperations = failedOps;
      this.saveData();
    }
  }

  incrementCredits(userId, amount) {
    if (this.users[userId]) {
      this.users[userId].credits += amount;
      this.saveData();
    }
  }

  decrementCredits(userId, amount) {
    if (this.users[userId]) {
      this.users[userId].credits -= amount;
      this.saveData();
    }
  }

  incrementSuccessfulOps(userId) {
    if (this.users[userId]) {
      this.users[userId].successfulOperations++;
      this.saveData();
    }
  }

  incrementFailedOps(userId) {
    if (this.users[userId]) {
      this.users[userId].failedOperations++;
      this.saveData();
    }
  }

  // Settings operations
  getSettings(userId) {
    return this.settings[userId];
  }

  createSettings(userId, settings) {
    this.settings[userId] = settings;
    this.saveData();
    return this.settings[userId];
  }

  updateSettings(userId, settings) {
    if (!this.settings[userId]) {
      this.settings[userId] = {};
    }
    this.settings[userId] = { ...this.settings[userId], ...settings };
    this.saveData();
  }

  resetSettingsToDefault(userId) {
    this.settings[userId] = { ...DEFAULT_SETTINGS };
    this.saveData();
  }

  // Operation operations
  createOperation(operation) {
    const operationId = uuidv4();
    this.operations[operationId] = {
      ...operation,
      operationId,
      timestamp: Math.floor(Date.now() / 1000)
    };
    this.saveData();
    return operationId;
  }

  getOperations(userId, limit = 10) {
    const userOps = Object.values(this.operations)
      .filter(op => op.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return userOps;
  }

  getOperation(operationId) {
    return this.operations[operationId];
  }

  updateOperationDeliveryStatus(operationId, status) {
    if (this.operations[operationId]) {
      this.operations[operationId].deliveryStatus = status;
      this.saveData();
    }
  }

  // Transaction operations
  createTransaction(transaction) {
    const transactionId = uuidv4();
    this.transactions[transactionId] = {
      ...transaction,
      transactionId,
      timestamp: Math.floor(Date.now() / 1000)
    };
    this.saveData();
    return transactionId;
  }

  getTransactions(userId, limit = 10) {
    const userTxs = Object.values(this.transactions)
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return userTxs;
  }

  // Utility methods
  getUserProfile(userId) {
    const user = this.getUser(userId);
    if (!user) return null;

    return {
      username: user.username,
      userId: user.userId,
      credits: user.credits,
      successfulOperations: user.successfulOperations,
      failedOperations: user.failedOperations,
      registeredAt: user.registeredAt
    };
  }

  getUserHistory(userId, limit = 10) {
    const operations = this.getOperations(userId, limit);
    return operations.map(op => ({
      filename: op.filename,
      language: op.language,
      timestamp: op.timestamp,
      status: op.status,
      duration: op.duration
    }));
  }

  close() {
    this.saveData();
  }

  // Direct database access for stats
  getTotalUsers() {
    return Object.keys(this.users).length;
  }

  getTotalOperations() {
    return Object.keys(this.operations).length;
  }
}

// Singleton instance
const database = new ForgeFuscatorDatabase();

module.exports = database;
