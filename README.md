# ForgeFuscator - Discord Bot for Lua/Luau Obfuscation

A professional, production-ready Discord bot that provides Lua and Luau obfuscation through an external API. All obfuscation is performed by the external API - the bot only handles Discord commands, file validation, user settings, and result delivery.

## Features

- **Lua and Luau Obfuscation** - Supports .lua, .luau, and .txt files
- **External API Integration** - All obfuscation is performed by an external service
- **Persistent Settings** - User settings are saved and persist across bot restarts
- **Credits System** - Users have credits that are deducted for each successful obfuscation
- **Privacy Protection** - Sensitive operations in servers use DMs for privacy
- **Discord Components V2** - Modern, interactive UI with buttons and select menus
- **Comprehensive Error Handling** - Graceful error handling with appropriate emojis

## Commands

| Command | Description |
|---------|-------------|
| `ff!help` | Display available commands |
| `ff!status` | Display bot and API status |
| `ff!setup` | Configure persistent obfuscation settings |
| `ff!fuscate` | Obfuscate Lua/Luau files using the API |
| `ff!profile` | Display user information and credits |
| `ff!history` | Display recent obfuscation operations |
| `ff!about` | Display ForgeFuscator information |

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- Discord Bot Token
- External Obfuscation API (compatible with the API used in the test repository)

### Installation

1. Clone the repository:
```bash
cd /workspace/github__z-7z__Bot-Obfuscate
git pull origin main
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env .env.local
# Edit .env.local with your settings
```

4. Start the bot:
```bash
npm start
# or for development with auto-restart
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Discord Bot Token
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE

# External Obfuscation API Configuration
API_BASE_URL=https://YOUR-OBFUSCATION-API.onrender.com
API_KEY=YOUR_OBFUSCATOR_API_KEY_HERE
API_TIMEOUT=30000

# Bot Configuration
BOT_PREFIX=ff!
BOT_VERSION=1.0.0

# Credits System
OPERATION_COST=1

# Rate Limiting
COMMAND_COOLDOWN=5000

# File Limits
MAX_FILE_SIZE=1048576
```

### Required Variables

- `DISCORD_TOKEN` - Your Discord bot token from the Discord Developer Portal
- `API_BASE_URL` - The base URL of your obfuscation API
- `API_KEY` - The API key for authenticating with the obfuscation API

### Optional Variables

- `BOT_PREFIX` - Custom command prefix (default: `ff!`)
- `BOT_VERSION` - Bot version (default: `1.0.0`)
- `OPERATION_COST` - Cost in credits per obfuscation (default: `1`)
- `COMMAND_COOLDOWN` - Cooldown between commands in milliseconds (default: `5000`)
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: `1048576` = 1MB)
- `API_TIMEOUT` - API request timeout in milliseconds (default: `30000`)

## Usage

### Basic Usage

1. **Invite the bot to your server** or use it in DMs
2. **Attach a Lua/Luau file** to your message
3. **Use the command** `ff!fuscate`

Example:
```
User: ff!fuscate
[attaches script.lua]
Bot: [sends obfuscated file via DM]
```

### Settings Configuration

Use `ff!setup` to configure your obfuscation settings. The bot will send you a private message with interactive buttons and menus to configure:

- **Anti-Tamper** - Enable/disable anti-tamper protection
- **Anti-Hook** - Enable/disable anti-hook protection
- **VM Renaming** - Enable/disable VM renaming
- **Encrypted VM** - Enable/disable VM encryption
- **Runtime State Chain** - Enable/disable runtime state chain
- **Control Flow** - Auto/On/Off for control flow obfuscation
- **Lazy Regions** - Auto/On/Off for lazy regions

### Viewing Profile

Use `ff!profile` to view your:
- Discord username and ID
- Available credits
- Total successful operations
- Total failed operations
- Registration date

### Viewing History

Use `ff!history` to view your recent obfuscation operations with:
- Original filename
- Detected language (Lua/Luau)
- Timestamp
- Operation status
- Processing duration

## Privacy Features

### In Direct Messages

- All commands work normally
- Files are processed and results are returned directly in the DM

### In Server Channels

- **ff!fuscate**: The original message with the source file is deleted (if permissions allow), and the obfuscated file is sent via DM
- **ff!profile**: Profile information is sent via DM
- **ff!history**: History information is sent via DM
- **ff!setup**: Setup interface is sent via DM
- **Other commands**: Respond in the channel

### Privacy Protection

- Source code is never exposed in public channels
- Obfuscated output is never exposed in public channels
- If DM delivery fails, the bot will not post sensitive information in the channel
- Message deletion is attempted but cannot guarantee removal of cached content

## Architecture

```
src/
├── index.js              # Main bot entry point
├── commands/             # Command handlers
│   ├── index.js         # Command manager
│   ├── base.js          # Base command class
│   ├── help.js          # Help command
│   ├── status.js        # Status command
│   ├── setup.js         # Setup command
│   ├── fuscate.js       # Obfuscation command
│   ├── profile.js       # Profile command
│   ├── history.js       # History command
│   └── about.js         # About command
├── components/           # Discord Components V2 builders
│   └── index.js         # Component builder
├── config/               # Configuration files
│   ├── constants.js     # Constants and emoji definitions
│   └── emojiMap.js      # Emoji usage mapping
├── database/             # Database module
│   └── index.js         # SQLite database
├── services/             # Service modules
│   ├── api.js           # API service
│   ├── validation.js    # File validation
│   ├── credits.js       # Credits system
│   ├── privacy.js       # Privacy handling
│   └── obfuscation.js   # Obfuscation service
└── utils/                # Utility functions
    └── index.js
```

## API Integration

The bot integrates with an external obfuscation API that must support:

- **POST /api/obfuscate** - Obfuscate Lua/Luau code
  - Headers: `Authorization: Bearer API_KEY`, `Content-Type: application/json`
  - Body: `{ source: string, options: object }`
  - Response: `{ code: string, signature?: string, manifest?: object }`

- **GET /health** - Health check
  - Response: `{ ok: boolean, service?: string, version?: string }`

### Supported Options

The API must support the following options (all boolean except where noted):

- `antiTamper` - Anti-tamper protection
- `antiHook` - Anti-hook protection
- `renameVM` - VM renaming
- `hideVM` - Hide/encrypt VM
- `controlFlow` - Control flow obfuscation
- `runtimeLease` - Runtime lease
- `runtimeStateChain` - Runtime state chain
- `lazyRegions` - Lazy regions
- `sensitiveProfiles` - Sensitive profiles
- `hybrid` - Hybrid mode

## Database Schema

The bot uses SQLite for persistent storage with the following tables:

### users
- `userId` (TEXT, PRIMARY KEY) - Discord user ID
- `username` (TEXT) - Discord username
- `credits` (INTEGER) - Available credits
- `registeredAt` (INTEGER) - Registration timestamp
- `successfulOperations` (INTEGER) - Count of successful operations
- `failedOperations` (INTEGER) - Count of failed operations

### settings
- `userId` (TEXT, PRIMARY KEY) - Discord user ID
- `antiTamper` (INTEGER) - Anti-tamper setting
- `antiHook` (INTEGER) - Anti-hook setting
- `renameVM` (INTEGER) - VM renaming setting
- `hideVM` (INTEGER) - Hide VM setting
- `controlFlow` (TEXT) - Control flow setting (Auto/On/Off)
- `runtimeLease` (INTEGER) - Runtime lease setting
- `runtimeStateChain` (INTEGER) - Runtime state chain setting
- `lazyRegions` (TEXT) - Lazy regions setting (Auto/On/Off)
- `sensitiveProfiles` (INTEGER) - Sensitive profiles setting
- `hybrid` (INTEGER) - Hybrid setting

### operations
- `operationId` (TEXT, PRIMARY KEY) - Operation ID
- `userId` (TEXT) - Discord user ID
- `filename` (TEXT) - Original filename
- `language` (TEXT) - Detected language
- `status` (TEXT) - Operation status
- `duration` (INTEGER) - Processing duration in ms
- `timestamp` (INTEGER) - Operation timestamp
- `deliveryStatus` (TEXT) - Delivery status

### transactions
- `transactionId` (TEXT, PRIMARY KEY) - Transaction ID
- `userId` (TEXT) - Discord user ID
- `amount` (INTEGER) - Transaction amount
- `reason` (TEXT) - Transaction reason
- `timestamp` (INTEGER) - Transaction timestamp

## Security Features

- **Environment Variables** - All sensitive data (API keys, tokens) are stored in environment variables
- **File Validation** - All uploaded files are validated for size, extension, and content
- **No Local Execution** - Uploaded scripts are never executed locally
- **Temporary File Cleanup** - Temporary files are automatically cleaned up
- **Rate Limiting** - Command cooldowns prevent abuse
- **Privacy Protection** - Sensitive data is never exposed in public channels
- **Error Handling** - Graceful error handling prevents information leakage

## Custom Emojis

The bot uses the following custom emojis:

| Emoji | ID | Usage |
|-------|----|-------|
| Tools | `<:tools:1568271019322642665>` | Settings, configuration, tools |
| Question | `<:question:1568270948065607730>` | Help, instructions, information |
| Accept | `<:accept:1568270862686228661>` | Successful operations, enabled settings |
| False | `<:false:1568271141456318547>` | Disabled settings, negative states |
| Error | `<:error:1568270912074162296>` | API errors, failed operations |
| Files | `<:files:1568271876709425162>` | Attachments, file information |
| Lua | `<:lua:1568272733505192037>` | Lua language identification |
| Luau | `<:luau:1568274963834605568>` | Luau language identification |
| Oops | `<:oops:1568271058149314630>` | Warnings, missing attachments, recoverable problems |

## Error Handling

The bot handles the following errors gracefully:

- Missing attachment
- Invalid file
- Unsupported language
- Empty file
- File too large
- Insufficient credits
- API unavailable
- API timeout
- API rejection
- Invalid API response
- DM delivery failure
- Missing Manage Messages permission
- Discord attachment upload failure

Each error displays the appropriate custom emoji and a user-friendly message.

## Testing

To test the bot:

1. Start the bot in development mode:
```bash
npm run dev
```

2. In Discord, send commands to the bot and verify:
   - All commands work correctly
   - Settings persist across restarts
   - Files are obfuscated correctly
   - Privacy features work as expected
   - Error handling is appropriate

## Deployment

### Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/index.js --name forge-fuscator
pm2 save
pm2 startup
```

### Docker Deployment

Create a Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t forge-fuscator .
docker run -d --env-file .env --name forge-fuscator forge-fuscator
```

## License

MIT License - See LICENSE file for details.

## Support

For support, issues, or contributions, please refer to the project repository.

---

**Note:** This bot is an API client only. All actual obfuscation is performed by an external API. The bot does not implement any obfuscation algorithms locally.
