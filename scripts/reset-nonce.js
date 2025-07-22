// Script to fix nonce issues by sending empty transactions
const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Starting nonce reset utility...");
  
  try {
    // Get the signer
    const [signer] = await hre.ethers.getSigners();
    const address = await signer.getAddress();
    
    // Get current nonce
    const currentNonce = await hre.ethers.provider.getTransactionCount(address, "pending");
    console.log(`👤 Account: ${address}`);
    console.log(`🔢 Current nonce: ${currentNonce}`);
    
    // Ask for target nonce
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const targetNonceInput = await new Promise(resolve => {
      readline.question(`Enter target nonce to reach (greater than ${currentNonce}): `, answer => {
        resolve(answer);
      });
    });
    
    const targetNonce = parseInt(targetNonceInput);
    
    if (isNaN(targetNonce) || targetNonce <= currentNonce) {
      console.error(`❌ Invalid target nonce. Must be a number greater than ${currentNonce}`);
      readline.close();
      return;
    }
    
    console.log(`🎯 Will send ${targetNonce - currentNonce} empty transactions to reach nonce ${targetNonce}`);
    
    const confirmation = await new Promise(resolve => {
      readline.question('Continue? (y/n): ', answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    readline.close();
    
    if (!confirmation) {
      console.log("Operation cancelled.");
      return;
    }
    
    // Send empty transactions with incrementing nonces
    for (let nonce = currentNonce; nonce < targetNonce; nonce++) {
      console.log(`\n📤 Sending empty transaction with nonce ${nonce}...`);
      
      // Transaction parameters - send to self with minimal gas
      const tx = {
        to: address,
        value: 0,
        nonce: nonce,
        gasLimit: 21000,
        gasPrice: hre.ethers.parseUnits("0.1", "gwei") // Very low gas price
      };
      
      try {
        // Send transaction
        const txResponse = await signer.sendTransaction(tx);
        console.log(`✅ Transaction sent: ${txResponse.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        const receipt = await txResponse.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      } catch (error) {
        console.error(`❌ Failed to send transaction with nonce ${nonce}:`, error.message);
        console.log("Stopping the process.");
        break;
      }
    }
    
    // Check final nonce
    const newNonce = await hre.ethers.provider.getTransactionCount(address, "pending");
    console.log(`\n🔢 New nonce: ${newNonce}`);
    console.log("Done!");
    
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 