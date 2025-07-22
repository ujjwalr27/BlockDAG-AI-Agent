# BlockDAG AI Agent

A conversational and DeFi agent powered by Gemini, running on the BlockDAG Primordial Testnet.

## Features

- **Instant Confirmations**: < 2 seconds for all user-initiated transactions
- **Ultra-Low Fees**: Around $0.01 per transaction
- **Chain-Agnostic UX**: Interact purely via chat without worrying about network specifics
- **Gemini-Powered Intelligence**: Natural language understanding and transaction orchestration

## Applications

- **Conversational Wallet Assistant**: "Send 0.5 TEST to @Alice" with immediate confirmation
- **Rapid DeFi Strategy Execution**: "Allocate 100 TEST into the highest-yield pool module"
- **Automated Portfolio Rebalancer**: Continuously monitor and rebalance positions
- **Module Discovery Assistant**: "What new modules are available today?"
- **Notification & Reporting Bot**: Real-time P/L summaries, gas-spend analytics, and position health alerts

## Getting Started

### Prerequisites

- Node.js 16+
- npm/yarn
- Access to BlockDAG Primordial Testnet
- Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blockdag-agent.git
cd blockdag-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```
# BlockDAG Primordial Testnet Configuration
BLOCKDAG_RPC_URL=https://rpc.primordial.bdagscan.com
BLOCKDAG_CHAIN_ID=1043
BLOCKDAG_EXPLORER=https://primordial.bdagscan.com
BLOCKDAG_FAUCET=https://primordial.bdagscan.com/faucet

# Private Keys (DO NOT COMMIT ACTUAL KEYS)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Discord Bot
DISCORD_CLIENT_ID=your_application_id
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Deployment Configuration
PORT=3000
```

4. Obtain testnet tokens:
   - Visit the [BlockDAG Primordial Testnet Faucet](https://primordial.bdagscan.com/faucet)
   - Request tokens for your account

### Deployment

#### Smart Contracts

1. Deploy the smart contracts to the BlockDAG Primordial Testnet:
```bash
npx hardhat run scripts/deploy.js --network primordial
```
or 
```bash
npm run deploy
```


2. Note the deployed contract addresses and update your environment variables accordingly.

#### Discord Bot

1. Create a Discord bot on the [Discord Developer Portal](https://discord.com/developers/applications)
2. Add the bot to your server with appropriate permissions(Enable "Message Content Intent" in the bot tab)
3. Copy the bot token and application id to your `.env` file 
4. Go to the "OAuth2" → "URL Generator" tab
5.Select these scopes: bot and applications.commands
6.Bot permissions: Send Messages, Read Message History, Use Slash Commands (at minimum)
7.Copy the generated URL and paste it in your browser
8.Select your server and authorize the bot
9.Use the /chat command in your Discord server to test the integration

#### Start the Service

Run the service locally:
```bash
npm start
```

## Network Information

- **RPC Endpoint**: https://rpc.primordial.bdagscan.com
- **Chain ID**: 1043
- **Faucet**: https://primordial.bdagscan.com/faucet
- **Explorer**: https://primordial.bdagscan.com/

## Development

### Project Structure

- `/contracts`: Smart contracts for the BlockDAG network
  - `/interfaces`: Contract interfaces
  - `/tokens`: ERC-20 and other token contracts
  - `/dex`: DEX and router contracts
- `/agents`: Agent implementations
  - `/strategies`: DeFi strategy executors
- `/api`: API routes and endpoints
- `/config`: Configuration files
- `/utils`: Utility functions
- `/scripts`: Deployment and maintenance scripts
- `/test`: Test files

### Testing

Run tests using Hardhat:
```bash
npx hardhat test
```

## License

MIT

## Acknowledgements

- [BlockDAG](https://blockdag.network)
- [Hardhat](https://hardhat.org/)
- [Ethers.js](https://docs.ethers.org/)
