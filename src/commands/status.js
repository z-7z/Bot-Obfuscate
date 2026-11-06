const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const apiService = require('../services/api');
const { V2MessageBuilder, createButton, createV2Message } = require('../utils/componentsV2');

class StatusCommand extends BaseCommand {
  constructor() {
    super('status', 'Display bot and API status', 10000);
  }

  async executeCommand(message, args) {
    const status = await this.getStatus();
    const builder = new V2MessageBuilder();
    
    // Header
    builder.addHeading(EMOTES.question, 'ForgeFuscator Status');
    builder.addSeparator();
    
    // Bot Status
    builder.addText(EMOTES.accept, '**Bot Status:** Online');
    builder.addText(EMOTES.question, `**Uptime:** ${this.formatUptime(process.uptime())}`);
    builder.addText(EMOTES.files, `**Latency:** ${this.calculateLatency()}ms`);
    builder.addSeparator();
    
    // API Status
    if (status.apiAvailable) {
      builder.addText(EMOTES.accept, '**API Status:** Online');
      builder.addText(EMOTES.question, `**Response Time:** ${status.apiResponseTime}ms`);
      if (status.apiService) {
        builder.addText(EMOTES.tools, `**Service:** ${status.apiService}`);
      }
      if (status.apiVersion) {
        builder.addText(EMOTES.question, `**Version:** ${status.apiVersion}`);
      }
    } else {
      builder.addText(EMOTES.error, '**API Status:** Offline');
      builder.addText(EMOTES.error, `**Error:** ${status.apiError || 'Connection failed'}`);
    }
    
    builder.addSeparator();
    
    // Action button
    builder.addActionRow([
      createButton('status_refresh', 'Refresh', 'Primary', '🔄')
    ]);
    
    const v2Message = builder.build();
    
    return message.reply(v2Message);
  }

  async getStatus() {
    const apiStatus = await apiService.checkHealth();
    
    return {
      apiAvailable: apiStatus.available,
      apiResponseTime: apiStatus.responseTime,
      apiService: apiStatus.service,
      apiVersion: apiStatus.version,
      apiError: apiStatus.error
    };
  }

  async handleRefreshInteraction(interaction) {
    const status = await this.getStatus();
    const builder = new V2MessageBuilder();
    
    builder.addHeading(EMOTES.question, 'ForgeFuscator Status');
    builder.addSeparator();
    
    builder.addText(EMOTES.accept, '**Bot Status:** Online');
    builder.addText(EMOTES.question, `**Uptime:** ${this.formatUptime(process.uptime())}`);
    builder.addText(EMOTES.files, `**Latency:** ${this.calculateLatency()}ms`);
    builder.addSeparator();
    
    if (status.apiAvailable) {
      builder.addText(EMOTES.accept, '**API Status:** Online');
      builder.addText(EMOTES.question, `**Response Time:** ${status.apiResponseTime}ms`);
      if (status.apiService) {
        builder.addText(EMOTES.tools, `**Service:** ${status.apiService}`);
      }
      if (status.apiVersion) {
        builder.addText(EMOTES.question, `**Version:** ${status.apiVersion}`);
      }
    } else {
      builder.addText(EMOTES.error, '**API Status:** Offline');
      builder.addText(EMOTES.error, `**Error:** ${status.apiError || 'Connection failed'}`);
    }
    
    builder.addSeparator();
    builder.addActionRow([
      createButton('status_refresh', 'Refresh', 'Primary', '🔄')
    ]);
    
    await interaction.update(builder.build());
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }

  calculateLatency() {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      Math.sqrt(i);
    }
    return Date.now() - start;
  }
}

module.exports = new StatusCommand();
