const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleRouter", function () {
  // Define fixture for reusable test setup
  async function deployRouterFixture() {
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy TestToken contract
    const TestToken = await ethers.getContractFactory("TestToken");
    const token1 = await TestToken.deploy(
      "Token 1",    // name
      "TKN1",       // symbol
      18,           // decimals
      owner.address // initialOwner
    );
    
    const token2 = await TestToken.deploy(
      "Token 2",    // name
      "TKN2",       // symbol
      18,           // decimals
      owner.address // initialOwner
    );
    
    // Deploy SimpleRouter contract
    const SimpleRouter = await ethers.getContractFactory("SimpleRouter");
    const router = await SimpleRouter.deploy(owner.address);
    
    // Mint tokens
    const mintAmount = ethers.parseEther("1000000");
    await token1.mint(owner.address, mintAmount);
    await token2.mint(owner.address, mintAmount);
    
    // Add liquidity to router
    const liquidityAmount = ethers.parseEther("500000");
    await token1.approve(router.getAddress(), liquidityAmount);
    await token2.approve(router.getAddress(), liquidityAmount);
    await router.addLiquidity(await token1.getAddress(), liquidityAmount);
    await router.addLiquidity(await token2.getAddress(), liquidityAmount);
    
    return { router, token1, token2, owner, user1, user2, liquidityAmount };
  }
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { router, owner } = await deployRouterFixture();
      
      expect(await router.owner()).to.equal(owner.address);
    });
  });
  
  describe("Liquidity", function () {
    it("Should allow adding liquidity", async function () {
      const { router, token1, owner } = await deployRouterFixture();
      
      const token1Address = await token1.getAddress();
      const amount = ethers.parseEther("1000");
      
      // Add more liquidity
      await token1.approve(router.getAddress(), amount);
      await router.addLiquidity(token1Address, amount);
      
      // Check reserves
      const reserve = await router.getReserve(token1Address);
      const expectedReserve = ethers.parseEther("500000") + ethers.parseEther("1000");
      expect(reserve).to.equal(expectedReserve);
    });
    
    it("Should allow removing liquidity by owner", async function () {
      const { router, token1, owner, liquidityAmount } = await deployRouterFixture();
      
      const token1Address = await token1.getAddress();
      const amount = ethers.parseEther("1000");
      
      // Get initial balance
      const initialBalance = await token1.balanceOf(owner.address);
      
      // Remove liquidity
      await router.removeLiquidity(token1Address, amount);
      
      // Check reserves
      const reserve = await router.getReserve(token1Address);
      const expectedReserve = liquidityAmount - amount;
      expect(reserve).to.equal(expectedReserve);
      
      // Check balance increase
      const newBalance = await token1.balanceOf(owner.address);
      const expectedBalance = initialBalance + amount;
      expect(newBalance).to.equal(expectedBalance);
    });
    
    it("Should not allow non-owner to remove liquidity", async function () {
      const { router, token1, user1 } = await deployRouterFixture();
      
      const token1Address = await token1.getAddress();
      const amount = ethers.parseEther("1000");
      
      // Try to remove liquidity as non-owner
      await expect(
        router.connect(user1).removeLiquidity(token1Address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Swapping", function () {
    it("Should allow swapping tokens", async function () {
      const { router, token1, token2, user1 } = await deployRouterFixture();
      
      const token1Address = await token1.getAddress();
      const token2Address = await token2.getAddress();
      const swapAmount = ethers.parseEther("1000");
      
      // Transfer some tokens to user1
      await token1.transfer(user1.address, swapAmount);
      
      // Approve router to spend tokens
      await token1.connect(user1).approve(router.getAddress(), swapAmount);
      
      // Check initial balances
      const initialToken1Balance = await token1.balanceOf(user1.address);
      const initialToken2Balance = await token2.balanceOf(user1.address);
      
      // Swap tokens
      await router.connect(user1).swap(token1Address, token2Address, swapAmount);
      
      // Check final balances
      const finalToken1Balance = await token1.balanceOf(user1.address);
      const finalToken2Balance = await token2.balanceOf(user1.address);
      
      expect(finalToken1Balance).to.equal(0);
      expect(finalToken2Balance).to.be.gt(0);
    });
    
    it("Should not allow swapping with zero amount", async function () {
      const { router, token1, token2, user1 } = await deployRouterFixture();
      
      const token1Address = await token1.getAddress();
      const token2Address = await token2.getAddress();
      
      await expect(
        router.connect(user1).swap(token1Address, token2Address, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });
    
    it("Should not allow swapping same token", async function () {
      const { router, token1, user1 } = await deployRouterFixture();
      
      const token1Address = await token1.getAddress();
      const swapAmount = ethers.parseEther("1000");
      
      await expect(
        router.connect(user1).swap(token1Address, token1Address, swapAmount)
      ).to.be.revertedWith("Same tokens");
    });
  });
}); 