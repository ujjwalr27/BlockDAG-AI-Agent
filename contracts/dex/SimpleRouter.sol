// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SimpleRouter
 * @dev A simplified DEX router for demonstrating token swaps
 */
contract SimpleRouter is Ownable, ReentrancyGuard {
    // Mapping of token addresses to their reserves
    mapping(address => uint256) public reserves;
    
    // Fee percentage (in basis points, e.g., 30 = 0.3%)
    uint16 public constant FEE_BASIS_POINTS = 30;
    
    // Events
    event TokenSwapped(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut, address indexed user);
    event LiquidityAdded(address indexed token, uint256 amount, address indexed provider);
    event LiquidityRemoved(address indexed token, uint256 amount, address indexed provider);
    
    constructor(address initialOwner) Ownable() {
        _transferOwnership(initialOwner);
    }
    
    /**
     * @dev Add liquidity for a token
     * @param token The token address
     * @param amount The amount to add
     */
    function addLiquidity(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        reserves[token] += amount;
        
        emit LiquidityAdded(token, amount, msg.sender);
    }
    
    /**
     * @dev Remove liquidity for a token (owner only)
     * @param token The token address
     * @param amount The amount to remove
     */
    function removeLiquidity(address token, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(reserves[token] >= amount, "Insufficient reserves");
        
        reserves[token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        
        emit LiquidityRemoved(token, amount, msg.sender);
    }
    
    /**
     * @dev Swap tokens
     * @param fromToken Source token
     * @param toToken Target token
     * @param amountIn Amount to swap
     * @return amountOut Amount received
     */
    function swap(address fromToken, address toToken, uint256 amountIn) 
        external 
        nonReentrant 
        returns (uint256 amountOut) 
    {
        require(fromToken != toToken, "Same tokens");
        require(amountIn > 0, "Amount must be greater than zero");
        require(reserves[toToken] > 0, "No liquidity for target token");
        
        // Calculate amount out with a simple pricing formula
        // In a real DEX this would use a pricing curve like x*y=k
        uint256 fromReserve = reserves[fromToken] + amountIn;
        uint256 toReserve = reserves[toToken];
        
        // Simple pricing: amountOut = amountIn * (toReserve / fromReserve) * (1 - fee)
        amountOut = (amountIn * toReserve) / fromReserve;
        
        // Apply fee
        uint256 fee = (amountOut * FEE_BASIS_POINTS) / 10000;
        amountOut = amountOut - fee;
        
        require(amountOut > 0, "Zero output amount");
        require(amountOut <= reserves[toToken], "Insufficient output reserves");
        
        // Transfer tokens
        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);
        reserves[fromToken] += amountIn;
        
        reserves[toToken] -= amountOut;
        IERC20(toToken).transfer(msg.sender, amountOut);
        
        emit TokenSwapped(fromToken, toToken, amountIn, amountOut, msg.sender);
        return amountOut;
    }
    
    /**
     * @dev Get reserves for a token
     */
    function getReserve(address token) external view returns (uint256) {
        return reserves[token];
    }
} 