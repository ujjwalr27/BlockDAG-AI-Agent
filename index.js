const express = require('express');
const dotenv = require('dotenv');
const { DiscordBot } = require('./agents/discord-bot');
const blockchain = require('./utils/blockchain');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: blockchain.networkConfig.name,
    chainId: blockchain.networkConfig.chainId
  });
});

// Initialize Discord bot if token is provided
let discordBot = null;
if (process.env.DISCORD_BOT_TOKEN) {
  discordBot = new DiscordBot();
  discordBot.start();
  console.log('Discord bot initialized');
} else {
  console.log('No Discord bot token found in environment. Discord bot not started.');
}

// Start server
app.listen(port, () => {
  console.log(`BlockDAG agent server running on port ${port}`);
  console.log(`Connected to ${blockchain.networkConfig.name} (Chain ID: ${blockchain.networkConfig.chainId})`);
  console.log(`RPC URL: ${blockchain.networkConfig.rpcUrl}`);
  console.log(`Explorer: ${blockchain.networkConfig.explorer}`);
}); 