const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestToken", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployTestTokenFixture() {
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy the TestToken contract
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy(
      "BlockDAG Test Token", // name
      "TEST",                // symbol
      18,                    // decimals
      owner.address          // initialOwner
    );
    
    return { testToken, owner, user1, user2 };
  }
  
  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { testToken } = await deployTestTokenFixture();
      
      expect(await testToken.name()).to.equal("BlockDAG Test Token");
      expect(await testToken.symbol()).to.equal("TEST");
    });
    
    it("Should set the right decimals", async function () {
      const { testToken } = await deployTestTokenFixture();
      
      expect(await testToken.decimals()).to.equal(18);
    });
    
    it("Should set the right owner", async function () {
      const { testToken, owner } = await deployTestTokenFixture();
      
      expect(await testToken.owner()).to.equal(owner.address);
    });
    
    it("Should have zero initial supply", async function () {
      const { testToken } = await deployTestTokenFixture();
      
      expect(await testToken.totalSupply()).to.equal(0);
    });
  });
  
  describe("Minting", function () {
    it("Should allow the owner to mint tokens", async function () {
      const { testToken, owner, user1 } = await deployTestTokenFixture();
      
      const mintAmount = ethers.parseEther("1000");
      await testToken.mint(user1.address, mintAmount);
      
      expect(await testToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await testToken.totalSupply()).to.equal(mintAmount);
    });
    
    it("Should not allow non-owner to mint tokens", async function () {
      const { testToken, user1, user2 } = await deployTestTokenFixture();
      
      const mintAmount = ethers.parseEther("1000");
      await expect(
        testToken.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Transfers", function () {
    it("Should allow users to transfer tokens", async function () {
      const { testToken, owner, user1, user2 } = await deployTestTokenFixture();
      
      // Mint some tokens to user1
      const mintAmount = ethers.parseEther("1000");
      await testToken.mint(user1.address, mintAmount);
      
      // Transfer from user1 to user2
      const transferAmount = ethers.parseEther("500");
      await testToken.connect(user1).transfer(user2.address, transferAmount);
      
      // Check balances
      expect(await testToken.balanceOf(user1.address)).to.equal(mintAmount - transferAmount);
      expect(await testToken.balanceOf(user2.address)).to.equal(transferAmount);
    });
  });
}); 