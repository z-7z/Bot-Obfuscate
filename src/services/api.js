const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { API_CONFIG } = require('../config/constants');

class APIService {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.obfuscator.example.com';
    this.apiKey = process.env.API_KEY || '';
    this.timeout = parseInt(process.env.API_TIMEOUT) || 30000;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  async checkHealth() {
    try {
      const startTime = Date.now();
      const response = await this.client.get('/health', {
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200 && response.data && response.data.ok) {
        return {
          available: true,
          responseTime,
          service: response.data.service || 'unknown',
          version: response.data.version || null
        };
      }
      
      return {
        available: false,
        responseTime,
        error: 'Invalid response format'
      };
    } catch (error) {
      return {
        available: false,
        responseTime: 0,
        error: this.getErrorMessage(error)
      };
    }
  }

  async obfuscate(source, options = {}) {
    const requestId = uuidv4();
    
    try {
      const startTime = Date.now();
      const response = await this.client.post('/api/obfuscate', {
        source: source,
        options: this.normalizeOptions(options)
      });
      
      const duration = Date.now() - startTime;
      
      if (response.status === 200 && response.data && response.data.code) {
        return {
          success: true,
          code: response.data.code,
          signature: response.data.signature || null,
          manifest: response.data.manifest || null,
          duration,
          requestId
        };
      }
      
      return {
        success: false,
        error: 'Invalid API response',
        duration,
        requestId
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: this.getErrorMessage(error),
        duration,
        requestId
      };
    }
  }

  async issueLease(buildId, artifactHash) {
    try {
      const response = await this.client.post('/api/lease', {
        buildId: buildId,
        artifactHash: artifactHash
      });
      
      if (response.status === 200) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: 'Failed to issue lease'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  normalizeOptions(options) {
    // Map user-friendly setting names to API options
    const mappedOptions = {};
    
    if (options.antiTamper !== undefined) mappedOptions.antiTamper = options.antiTamper;
    if (options.antiHook !== undefined) mappedOptions.antiHook = options.antiHook;
    if (options.renameVM !== undefined) mappedOptions.renameVM = options.renameVM;
    if (options.hideVM !== undefined) mappedOptions.hideVM = options.hideVM;
    if (options.controlFlow !== undefined) {
      // Map Auto/On/Off to boolean
      if (options.controlFlow === 'On' || options.controlFlow === true) {
        mappedOptions.controlFlow = true;
      } else if (options.controlFlow === 'Off' || options.controlFlow === false) {
        mappedOptions.controlFlow = false;
      } else {
        mappedOptions.controlFlow = false; // Auto defaults to false
      }
    }
    if (options.runtimeLease !== undefined) mappedOptions.runtimeLease = options.runtimeLease;
    if (options.runtimeStateChain !== undefined) mappedOptions.runtimeStateChain = options.runtimeStateChain;
    if (options.lazyRegions !== undefined) {
      // Map Auto/On/Off to boolean
      if (options.lazyRegions === 'On' || options.lazyRegions === true) {
        mappedOptions.lazyRegions = true;
      } else if (options.lazyRegions === 'Off' || options.lazyRegions === false) {
        mappedOptions.lazyRegions = false;
      } else {
        mappedOptions.lazyRegions = true; // Auto defaults to true
      }
    }
    if (options.sensitiveProfiles !== undefined) mappedOptions.sensitiveProfiles = options.sensitiveProfiles;
    if (options.hybrid !== undefined) mappedOptions.hybrid = options.hybrid;
    
    return mappedOptions;
  }

  getErrorMessage(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.error) {
        return error.response.data.error;
      }
      return `API Error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      return 'API Timeout: No response received';
    } else {
      // Something happened in setting up the request
      return `Request Error: ${error.message}`;
    }
  }

  isConfigured() {
    return this.apiKey && this.baseURL;
  }
}

// Singleton instance
const apiService = new APIService();

module.exports = apiService;
