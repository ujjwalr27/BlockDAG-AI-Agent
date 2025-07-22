const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

/**
 * BlockDAG network configuration
 */
const networkConfig = {
  rpcUrl: process.env.BLOCKDAG_RPC_URL || "https://rpc.primordial.bdagscan.com",
  chainId: parseInt(process.env.BLOCKDAG_CHAIN_ID || "1043"),
  explorer: process.env.BLOCKDAG_EXPLORER || "https://primordial.bdagscan.com",
  name: "BlockDAG Primordial Testnet"
};

/**
 * Get a JSON RPC provider for the BlockDAG network
 */
function getProvider() {
  return new ethers.JsonRpcProvider(networkConfig.rpcUrl);
}

/**
 * Create a signer from a private key
 * @param {string} privateKey - The private key
 * @returns {ethers.Wallet} The wallet instance
 */
function getSigner(privateKey) {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get contract instance
 * @param {string} address - Contract address
 * @param {Array} abi - Contract ABI
 * @param {ethers.Wallet} [signer=null] - Optional signer for write operations
 * @returns {ethers.Contract} The contract instance
 */
function getContract(address, abi, signer = null) {
  if (!address || !abi) {
    throw new Error("Contract address and ABI are required");
  }

  const provider = getProvider();
  if (signer) {
    return new ethers.Contract(address, abi, signer);
  }
  return new ethers.Contract(address, abi, provider);
}

/**
 * Format ethers to a human-readable string
 * @param {ethers.BigNumberish} value - The value to format
 * @returns {string} Formatted value
 */
function formatEther(value) {
  return ethers.formatEther(value);
}

/**
 * Parse ether from string to BigNumber
 * @param {string} value - The value to parse
 * @returns {ethers.BigNumber} Parsed value
 */
function parseEther(value) {
  return ethers.parseEther(value);
}

/**
 * Wait for a transaction to be confirmed
 * @param {string} txHash - Transaction hash
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt
 */
async function waitForTransaction(txHash) {
  const provider = getProvider();
  return provider.waitForTransaction(txHash);
}

/**
 * Check if an address is valid
 * @param {string} address - Ethereum address
 * @returns {boolean} Whether the address is valid
 */
function isValidAddress(address) {
  try {
    ethers.getAddress(address); // Will throw if invalid
    return true;
  } catch {
    return false;
  }
}

/**
 * Estimate gas for a transaction
 * @param {Object} txParams - Transaction parameters
 * @returns {Promise<ethers.BigNumber>} Estimated gas
 */
async function estimateGas(txParams) {
  const provider = getProvider();
  return await provider.estimateGas(txParams);
}

/**
 * Get current gas price
 * @returns {Promise<ethers.BigNumber>} Current gas price
 */
async function getGasPrice() {
  const provider = getProvider();
  return await provider.getFeeData();
}

module.exports = {
  networkConfig,
  getProvider,
  getSigner,
  getContract,
  formatEther,
  parseEther,
  waitForTransaction,
  isValidAddress,
  estimateGas,
  getGasPrice
}; 