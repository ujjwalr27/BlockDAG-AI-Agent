require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Get private key from environment
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

// Add 0x prefix if not present
const formattedPrivateKey = DEPLOYER_PRIVATE_KEY.startsWith('0x') 
  ? DEPLOYER_PRIVATE_KEY 
  : `0x${DEPLOYER_PRIVATE_KEY}`;

if (!DEPLOYER_PRIVATE_KEY) {
  console.warn("\n⚠️  WARNING: No private key found in .env file! ⚠️");
  console.warn("Please add your MetaMask private key to the .env file.");
  console.warn("DEPLOYER_PRIVATE_KEY=0x...\n");
}

const BLOCKDAG_RPC_URL = process.env.BLOCKDAG_RPC_URL || "https://rpc.primordial.bdagscan.com";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    primordial: {
      url: BLOCKDAG_RPC_URL,
      chainId: 1043,
      accounts: DEPLOYER_PRIVATE_KEY ? [formattedPrivateKey] : [],
      gas: 5000000,             // Very high gas limit (5 million)
      gasPrice: 100000000,      // 0.1 gwei (ultra-low)
      gasMultiplier: 1.5,       // Add 50% buffer to gas estimation
      timeout: 120000,          // 2 minutes timeout for transactions
      httpHeaders: {
        "Content-Type": "application/json"
      },
      // Confirmation settings
      confirmations: 1,         // Wait for just 1 confirmation
      timeoutBlocks: 200,       // Longer timeout in blocks
      pollingInterval: 1000,    // Poll every 1 second
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: {
      primordial: "no-api-key-required"
    },
    customChains: [
      {
        network: "primordial",
        chainId: 1043,
        urls: {
          apiURL: "https://primordial.bdagscan.com/api",
          browserURL: "https://primordial.bdagscan.com"
        }
      }
    ]
  },
  // Set default gas reporter settings
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPriceApi: process.env.GAS_PRICE_API,
    showTimeSpent: true,
  },
  // Add mocha settings for longer test timeout
  mocha: {
    timeout: 120000 // 2 minutes
  }
};
