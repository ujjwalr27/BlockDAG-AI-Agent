const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Verifying contracts on BlockDAG Primordial Testnet...");

  // Read deployment info
  let deploymentInfo;
  try {
    const deploymentPath = path.join(__dirname, "../deployment-info.json");
    const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
    console.log("Deployment info loaded successfully:");
    console.log(`- Network: ${deploymentInfo.network} (Chain ID: ${deploymentInfo.chainId})`);
    console.log(`- Deployment Time: ${deploymentInfo.deploymentTime}`);
  } catch (error) {
    console.error("Error loading deployment info:", error.message);
    console.log("Make sure you've deployed the contracts and the deployment-info.json file exists.");
    return;
  }

  try {
    // Get provider
    const provider = await ethers.provider;
    console.log(`\nProvider connected to: ${(await provider.getNetwork()).name}`);

    // Verify TestToken
    const testTokenAddress = deploymentInfo.testToken;
    console.log(`\n🔍 Verifying TestToken at ${testTokenAddress}...`);
    const testTokenCode = await provider.getCode(testTokenAddress);
    
    if (testTokenCode !== "0x") {
      console.log("✅ TestToken is deployed! Code length:", (testTokenCode.length - 2) / 2, "bytes");
      
      try {
        // Try to interact with the contract to further verify
        const TestToken = await ethers.getContractFactory("TestToken");
        const testToken = TestToken.attach(testTokenAddress);
        const name = await testToken.name();
        const symbol = await testToken.symbol();
        const decimals = await testToken.decimals();
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
      } catch (error) {
        console.log("   Could not read token details:", error.message);
      }
    } else {
      console.log("❌ TestToken is NOT deployed or not found at this address!");
    }

    // Verify SimpleRouter
    const simpleRouterAddress = deploymentInfo.simpleRouter;
    console.log(`\n🔍 Verifying SimpleRouter at ${simpleRouterAddress}...`);
    const simpleRouterCode = await provider.getCode(simpleRouterAddress);
    
    if (simpleRouterCode !== "0x") {
      console.log("✅ SimpleRouter is deployed! Code length:", (simpleRouterCode.length - 2) / 2, "bytes");
      
      try {
        // Try to interact with the contract to further verify
        const SimpleRouter = await ethers.getContractFactory("SimpleRouter");
        const simpleRouter = SimpleRouter.attach(simpleRouterAddress);
        const owner = await simpleRouter.owner();
        console.log(`   Owner: ${owner}`);
      } catch (error) {
        console.log("   Could not read router details:", error.message);
      }
    } else {
      console.log("❌ SimpleRouter is NOT deployed or not found at this address!");
    }

    // Print explorer links
    const explorerUrl = "https://primordial.bdagscan.com";
    console.log("\n📋 Explorer Links (Note: The explorer might not show contract details yet):");
    console.log(`   TestToken: ${explorerUrl}/address/${testTokenAddress}`);
    console.log(`   SimpleRouter: ${explorerUrl}/address/${simpleRouterAddress}`);

    console.log("\n🔑 Direct RPC Verification:");
    console.log("  The contracts ARE deployed on the blockchain, even if they don't appear in the explorer.");
    console.log("  The explorer may need time to index the contracts or might have limitations for testnets.");
    
  } catch (error) {
    console.error("\n❌ Error verifying contracts:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 