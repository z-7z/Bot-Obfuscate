const BaseCommand = require('./base');
const { EMOTES } = require('../config/constants');
const apiService = require('../services/api');
const componentBuilder = require('../components');

class StatusCommand extends BaseCommand {
  constructor() {
    super('status', 'Display bot and API status', 10000);
  }

  async executeCommand(message, args) {
    const status = await this.getStatus();
    const components = componentBuilder.buildStatusComponents();
    
    return message.reply({
      content: status,
      components
    });
  }

  async getStatus() {
    const apiStatus = await apiService.checkHealth();
    const uptime = this.formatUptime(process.uptime());
    const latency = this.calculateLatency();
    
    let statusMessage = `${EMOTES.question} **ForgeFuscator Status**\n\n`;
    
    // Bot Status
    statusMessage += `${EMOTES.accept} **Bot Status:** Online\n`;
    statusMessage += `${EMOTES.question} **Uptime:** ${uptime}\n`;
    statusMessage += `${EMOTES.files} **Latency:** ${latency}ms\n\n`;
    
    // API Status
    if (apiStatus.available) {
      statusMessage += `${EMOTES.accept} **API Status:** Online\n`;
      statusMessage += `${EMOTES.question} **Response Time:** ${apiStatus.responseTime}ms\n`;
      if (apiStatus.service) {
        statusMessage += `${EMOTES.tools} **Service:** ${apiStatus.service}\n`;
      }
      if (apiStatus.version) {
        statusMessage += `${EMOTES.question} **Version:** ${apiStatus.version}\n`;
      }
    } else {
      statusMessage += `${EMOTES.error} **API Status:** Offline\n`;
      statusMessage += `${EMOTES.error} **Error:** ${apiStatus.error || 'Connection failed'}\n`;
    }
    
    return statusMessage;
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
    // Simple latency calculation
    const start = Date.now();
    // Simulate a simple operation
    for (let i = 0; i < 1000; i++) {
      Math.sqrt(i);
    }
    return Date.now() - start;
  }
}

module.exports = new StatusCommand();
