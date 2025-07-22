// Script to deploy contracts to the BlockDAG network
const hre = require("hardhat");

// Helper function for adding delays between transactions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make objects with BigInt values JSON-serializable
function toSerializable(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// Function to deploy a single contract
async function deployContract(contractName, args, overrides) {
  console.log(`\n📄 Deploying ${contractName} contract...`);
  const Factory = await hre.ethers.getContractFactory(contractName);
  
  // Get the latest nonce for the signer
  const signer = Factory.runner;
  const address = await signer.getAddress();
  const nonce = await hre.ethers.provider.getTransactionCount(address, "pending");
  console.log(`🔢 Using nonce: ${nonce} for address ${address}`);
  
  // Add nonce to overrides
  const txOverrides = { ...overrides, nonce };
  
  const contract = await Factory.deploy(...args, txOverrides);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`✅ ${contractName} deployed to: ${contractAddress}`);
  return { contract, address: contractAddress };
}

async function main() {
  console.log("\n🚀 Starting deployment to BlockDAG Primordial Testnet...");
  
  // Validate private key
  try {
    // This will throw if no private key is configured
    const [deployer] = await hre.ethers.getSigners();
    
    // Get the network
    const network = await hre.ethers.provider.getNetwork();
    console.log(`🔗 Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Get deployer account
    const deployerAddress = await deployer.getAddress();
    console.log(`👤 Deployer account: ${deployerAddress}`);
    
    // Get the current nonce
    const currentNonce = await hre.ethers.provider.getTransactionCount(deployerAddress, "pending");
    console.log(`🔢 Current account nonce: ${currentNonce}`);
    
    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployerAddress);
    const balanceInEther = parseFloat(hre.ethers.formatEther(balance));
    console.log(`💰 Account balance: ${balanceInEther} BDAG (${balance.toString()} wei)`);
    
    // In ethers v6, we check if balance is zero by comparing it directly
    if (balance == 0n) {
      console.error("❌ Deployer account has zero balance!");
      console.error("   Please fund your account from the faucet at:");
      console.error("   https://primordial.bdagscan.com/faucet");
      return;
    }
    
    // Get current fee data
    const feeData = await hre.ethers.provider.getFeeData();
    const currentGasPrice = hre.ethers.formatUnits(feeData.gasPrice || 0n, "gwei");
    console.log(`⛽ Current gas price: ${currentGasPrice} gwei`);
    
    // Calculate max fee for a typical deployment (approximately)
    const estimatedGasPerDeploy = 3000000n; // 3 million gas units
    const maxFeePerTransaction = estimatedGasPerDeploy * (feeData.gasPrice || 1000000000n);
    const maxFeeInEther = parseFloat(hre.ethers.formatEther(maxFeePerTransaction));
    
    console.log(`⚠️ Estimated max fee per contract: ~${maxFeeInEther.toFixed(4)} BDAG`);
    
    if (balanceInEther < (maxFeeInEther * 3)) {
      console.warn("⚠️  Warning: Low account balance. You may not have enough funds for deployment.");
      console.warn(`   You need at least ${(maxFeeInEther * 3).toFixed(4)} BDAG for the full deployment.`);
      console.warn("   Consider getting more tokens from the faucet.");
      // Ask for confirmation
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const confirmation = await new Promise(resolve => {
        readline.question('Continue with deployment anyway? (y/n): ', answer => {
          readline.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (!confirmation) {
        console.log("Deployment cancelled by user.");
        return;
      }
    }
    
    // Set ultra-low gas price - much lower than the network average
    // Using 0.1 gwei instead of the default
    const overrides = {
      gasPrice: hre.ethers.parseUnits("0.1", "gwei"),
      gasLimit: 5000000 // Extra high gas limit
    };
    
    console.log(`🔧 Using custom gas settings: ${hre.ethers.formatUnits(overrides.gasPrice, "gwei")} gwei`);
    
    // Deploy contracts one by one with interactive confirmation
    
    // 1. Deploy TestToken
    const { contract: testToken, address: testTokenAddress } = 
      await deployContract("TestToken", [
        "BlockDAG Test Token", // name
        "TEST",                // symbol
        18,                    // decimals
        deployerAddress        // initialOwner
      ], overrides);
    
    // Wait between deployments to allow the network to process the transaction
    console.log("\n⏳ Waiting 10 seconds for transaction to be confirmed...");
    await delay(10000);
    
    // Check balance again before next deployment
    const balanceAfterToken = await hre.ethers.provider.getBalance(deployerAddress);
    console.log(`💰 Remaining balance: ${hre.ethers.formatEther(balanceAfterToken)} BDAG`);
    
    // Ask for confirmation before proceeding
    const continueDeployment = await new Promise(resolve => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question('\n👉 Continue with SimpleRouter deployment? (y/n): ', answer => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!continueDeployment) {
      console.log("Deployment of SimpleRouter cancelled.");
      console.log("\n===== 🎉 Partial Deployment Summary =====");
      console.log(`Network: BlockDAG Primordial Testnet (ChainID: ${network.chainId})`);
      console.log(`TestToken: ${testTokenAddress}`);
      console.log("======================================");
      return;
    }
    
    // 2. Deploy SimpleRouter
    const { contract: simpleRouter, address: simpleRouterAddress } = 
      await deployContract("SimpleRouter", [
        deployerAddress        // initialOwner
      ], overrides);
    
    console.log("\n⏳ Waiting 10 seconds for transaction to be confirmed...");
    await delay(10000);
    
    // Ask for confirmation before proceeding with token operations
    const continueTokenOps = await new Promise(resolve => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question('\n👉 Continue with token minting and liquidity? (y/n): ', answer => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!continueTokenOps) {
      console.log("Token operations cancelled.");
      console.log("\n===== 🎉 Deployment Summary =====");
      console.log(`Network: BlockDAG Primordial Testnet (ChainID: ${network.chainId})`);
      console.log(`TestToken: ${testTokenAddress}`);
      console.log(`SimpleRouter: ${simpleRouterAddress}`);
      console.log("================================");
      return;
    }
    
    // Get the latest nonce before mint transaction
    const mintNonce = await hre.ethers.provider.getTransactionCount(deployerAddress, "pending");
    
    // 3. Mint tokens
    console.log("\n💸 Minting test tokens...");
    const mintAmount = hre.ethers.parseEther("1000000"); // 1 million tokens
    const mintTx = await testToken.mint(deployerAddress, mintAmount, { ...overrides, nonce: mintNonce });
    await mintTx.wait();
    console.log(`✅ Minted ${hre.ethers.formatEther(mintAmount)} TEST tokens to ${deployerAddress}`);
    
    console.log("\n⏳ Waiting 5 seconds...");
    await delay(5000);
    
    // Get the latest nonce before approve transaction
    const approveNonce = await hre.ethers.provider.getTransactionCount(deployerAddress, "pending");
    
    // 4. Approve tokens
    console.log("\n💦 Setting up liquidity...");
    const approveTx = await testToken.approve(simpleRouterAddress, mintAmount, { ...overrides, nonce: approveNonce });
    await approveTx.wait();
    console.log("✅ Approved SimpleRouter to spend TEST tokens");
    
    console.log("\n⏳ Waiting 5 seconds...");
    await delay(5000);
    
    // Get the latest nonce before liquidity transaction
    const liquidityNonce = await hre.ethers.provider.getTransactionCount(deployerAddress, "pending");
    
    // 5. Add liquidity
    const liquidityAmount = hre.ethers.parseEther("500000"); // 500k tokens as liquidity
    const addLiquidityTx = await simpleRouter.addLiquidity(testTokenAddress, liquidityAmount, { ...overrides, nonce: liquidityNonce });
    await addLiquidityTx.wait();
    console.log(`✅ Added ${hre.ethers.formatEther(liquidityAmount)} TEST tokens as liquidity`);
    
    console.log("\n===== 🎉 Deployment Summary =====");
    console.log(`Network: BlockDAG Primordial Testnet (ChainID: ${network.chainId})`);
    console.log(`TestToken: ${testTokenAddress}`);
    console.log(`SimpleRouter: ${simpleRouterAddress}`);
    console.log("================================");
    
    // Next steps
    console.log("\n📝 Next steps:");
    console.log("1. Verify contracts on the BlockDAG explorer if supported");
    console.log("2. Update the .env file with the deployed contract addresses");
    console.log("3. Start your application with 'npm start'");
    
    // Save deployed addresses to a file - convert chainId to string for JSON serialization
    const fs = require('fs');
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId), // Convert BigInt to Number
      testToken: testTokenAddress,
      simpleRouter: simpleRouterAddress,
      deploymentTime: new Date().toISOString()
    };
    
    fs.writeFileSync(
      './deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n📋 Deployment information saved to deployment-info.json");
    
  } catch (error) {
    // Handle specific errors
    if (error.message && error.message.includes("nonce")) {
      console.error("\n❌ ERROR: Nonce issue detected!");
      console.error("The account nonce is out of sync with the network.");
      console.error("This can happen if you have pending transactions or recently sent transactions.");
      console.error("\nPossible solutions:");
      console.error("1. Wait for any pending transactions to be mined");
      console.error("2. Reset your account nonce in MetaMask (Settings > Advanced > Reset Account)");
      console.error("3. Try using a different account");
    } else if (error.message && error.message.includes("insufficient funds")) {
      console.error("\n❌ ERROR: Insufficient funds for deployment!");
      console.error("Your account doesn't have enough BDAG tokens to pay for gas.");
      console.error("Please get more tokens from the faucet at: https://primordial.bdagscan.com/faucet");
      console.error("You might need to wait a few minutes after receiving tokens for them to be usable.");
    } else if (error.message && error.message.includes("private key")) {
      console.error("\n❌ ERROR: Missing or invalid private key!");
      console.error("Please check your .env file and make sure you've added your MetaMask private key:");
      console.error("DEPLOYER_PRIVATE_KEY=0x...");
      console.error("\nTo get your private key from MetaMask:");
      console.error("1. Open MetaMask and click on the account icon");
      console.error("2. Go to Account Details > Show Private Key (enter your password)");
      console.error("3. Copy the private key and paste it in your .env file");
    } else if (error.message && error.message.includes("network")) {
      console.error("\n❌ ERROR: Cannot connect to BlockDAG Primordial Testnet!");
      console.error("Please check your internet connection and make sure the RPC URL is correct in your .env file.");
    } else {
      // Generic error
      console.error("\n❌ Deployment failed with error:");
      console.error(error);
    }
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  }); 