// Custom Emoji IDs
const EMOTES = {
  tools: '<:tools:1568271019322642665>',
  question: '<:question:1568270948065607730>',
  accept: '<:accept:1568270862686228661>',
  false: '<:false:1568271141456318547>',
  error: '<:error:1568270912074162296>',
  files: '<:files:1568271876709425162>',
  lua: '<:lua:1568272733505192037>',
  luau: '<:luau:1568274963834605568>',
  oops: '<:oops:1568271058149314630>'
};

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.lua', '.luau', '.txt', ''];

// Default settings for obfuscation
const DEFAULT_SETTINGS = {
  antiTamper: true,
  antiHook: true,
  renameVM: true,
  hideVM: true,
  controlFlow: false,
  runtimeLease: false,
  runtimeStateChain: true,
  lazyRegions: true,
  sensitiveProfiles: false,
  hybrid: false
};

// Control Flow options
const CONTROL_FLOW_OPTIONS = ['Auto', 'On', 'Off'];

// Lazy Regions options
const LAZY_REGIONS_OPTIONS = ['Auto', 'On', 'Off'];

// API Configuration
const API_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000
};

// File Configuration
const FILE_CONFIG = {
  maxSize: 1048576, // 1MB
  tempDir: './temp'
};

// Credits Configuration
const CREDITS_CONFIG = {
  operationCost: 1,
  initialCredits: 10
};

// Privacy Configuration
const PRIVACY_CONFIG = {
  deleteOriginalMessage: true,
  useDMsForSensitiveCommands: true
};

// Command Configuration
const COMMAND_CONFIG = {
  prefix: 'ff!',
  cooldown: 5000
};

module.exports = {
  EMOTES,
  SUPPORTED_EXTENSIONS,
  DEFAULT_SETTINGS,
  CONTROL_FLOW_OPTIONS,
  LAZY_REGIONS_OPTIONS,
  API_CONFIG,
  FILE_CONFIG,
  CREDITS_CONFIG,
  PRIVACY_CONFIG,
  COMMAND_CONFIG
};
