const { Client, GatewayIntentBits, Events, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const { processMessage } = require('./gemini');
const blockchain = require('../utils/blockchain');
dotenv.config();

// Function handlers
const functionHandlers = {
  transferTokens: async (params) => {
    try {
      const { to, amount, token } = params;
      
      // Validate parameters
      if (!blockchain.isValidAddress(to)) {
        return { success: false, message: `Invalid recipient address: ${to}` };
      }
      
      // For demo purposes, we're simulating the transfer here
      // In a real implementation, we would use the blockchain utility to execute the transfer
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate blockchain interaction
      
      return {
        success: true,
        message: `Successfully transferred ${amount} ${token === 'native' ? 'BDAG' : 'tokens'} to ${to}`,
        txHash: `0x${Math.random().toString(16).substring(2, 42)}` // Mock transaction hash
      };
    } catch (error) {
      console.error('Error in transferTokens:', error);
      return { success: false, message: `Failed to transfer tokens: ${error.message}` };
    }
  },
  
  swapTokens: async (params) => {
    try {
      const { fromToken, toToken, amount } = params;
      
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate mock output amount
      const outputAmount = parseFloat(amount) * 0.98; // Simulating 2% slippage
      
      return {
        success: true,
        message: `Successfully swapped ${amount} ${fromToken === 'native' ? 'BDAG' : fromToken} for ${outputAmount.toFixed(4)} ${toToken === 'native' ? 'BDAG' : toToken}`,
        txHash: `0x${Math.random().toString(16).substring(2, 42)}` // Mock transaction hash
      };
    } catch (error) {
      console.error('Error in swapTokens:', error);
      return { success: false, message: `Failed to swap tokens: ${error.message}` };
    }
  },
  
  checkBalance: async (params) => {
    try {
      const { address, token } = params;
      
      // Validate parameters
      if (!blockchain.isValidAddress(address)) {
        return { success: false, message: `Invalid address: ${address}` };
      }
      
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock balance
      const balance = (Math.random() * 100).toFixed(4);
      
      return {
        success: true,
        message: `Balance for ${address}: ${balance} ${token === 'native' ? 'BDAG' : token}`,
        balance
      };
    } catch (error) {
      console.error('Error in checkBalance:', error);
      return { success: false, message: `Failed to check balance: ${error.message}` };
    }
  },
  
  provideLiquidity: async (params) => {
    try {
      const { token, amount } = params;
      
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        success: true,
        message: `Successfully provided ${amount} ${token === 'native' ? 'BDAG' : token} as liquidity`,
        txHash: `0x${Math.random().toString(16).substring(2, 42)}` // Mock transaction hash
      };
    } catch (error) {
      console.error('Error in provideLiquidity:', error);
      return { success: false, message: `Failed to provide liquidity: ${error.message}` };
    }
  },
  
  discoverModules: async (params) => {
    try {
      const { filter } = params || {};
      
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock modules
      const modules = [
        { name: 'TokenSwap', description: 'Basic token swap functionality' },
        { name: 'LiquidityPool', description: 'Liquidity pool for token pairs' },
        { name: 'YieldFarming', description: 'Stake tokens to earn rewards' },
        { name: 'Bridge', description: 'Cross-chain bridge for token transfers' },
        { name: 'NFTMarket', description: 'Marketplace for NFT trading' }
      ];
      
      // Apply filter if provided
      const filteredModules = filter 
        ? modules.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()) || 
                         m.description.toLowerCase().includes(filter.toLowerCase()))
        : modules;
      
      return {
        success: true,
        message: `Found ${filteredModules.length} modules`,
        modules: filteredModules
      };
    } catch (error) {
      console.error('Error in discoverModules:', error);
      return { success: false, message: `Failed to discover modules: ${error.message}` };
    }
  }
};

/**
 * Discord Bot class for BlockDAG interactions
 */
class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        // Reduced intents to only what's essential and commonly allowed by default
        GatewayIntentBits.Guilds
        // MessageContent intent requires privileged status and must be enabled in Discord Developer Portal
      ]
    });
    
    this.chatHistory = {};
    this.setupEventHandlers();
  }
  
  /**
   * Set up Discord event handlers
   */
  setupEventHandlers() {
    this.client.on(Events.ClientReady, () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });
    
    // Using an event that doesn't require MessageContent intent
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;
      
      // Handle slash commands
      const command = interaction.commandName;
      if (command === 'chat') {
        const content = interaction.options.getString('message');
        await this.handleInteraction(interaction, content);
      }
    });
  }
  
  /**
   * Handle incoming Discord interaction
   * @param {Interaction} interaction - Discord interaction
   * @param {string} content - User message content
   */
  async handleInteraction(interaction, content) {
    try {
      // Get or initialize chat history for this user
      const userId = interaction.user.id;
      if (!this.chatHistory[userId]) {
        this.chatHistory[userId] = [];
      }
      
      // Defer reply to show thinking state
      await interaction.deferReply();
      
      // Create fallback response in case Gemini fails
      let responseText = "I apologize, but I'm having trouble accessing my AI capabilities right now. Please check the Gemini API key configuration.";
      
      try {
        // Process message with Gemini
        const response = await processMessage(content, this.chatHistory[userId]);
        
        // Update chat history
        this.chatHistory[userId].push({ role: 'user', content });
        this.chatHistory[userId].push({ role: 'assistant', content: response.text });
        
        // Limit chat history
        if (this.chatHistory[userId].length > 20) {
          this.chatHistory[userId] = this.chatHistory[userId].slice(-20);
        }
        
        // Get response text
        responseText = response.text;
      } catch (aiError) {
        console.error('Error with AI service:', aiError);
        // Continue with fallback response
      }
      
      // Send the response - either from AI or fallback message
      await interaction.editReply({
        content: responseText
      });
    } catch (error) {
      console.error('Error handling interaction:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('Sorry, I encountered an error while processing your request.');
      } else {
        await interaction.reply({ content: 'Sorry, I encountered an error while processing your request.', ephemeral: true });
      }
    }
  }
  
  /**
   * Start the Discord bot
   */
  start() {
    console.log("Attempting to connect to Discord...");
    this.client.login(process.env.DISCORD_BOT_TOKEN)
      .then(() => console.log("Discord bot login successful"))
      .catch(error => {
        console.error("Discord bot login failed:", error.message);
        console.log("Please check your DISCORD_BOT_TOKEN and bot permissions in Discord Developer Portal");
      });
  }
}

/**
 * Register slash commands with Discord
 * This is exported as a standalone function
 */
async function registerCommands() {
  console.log('Starting to register Discord slash commands...');
  
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('Error: DISCORD_BOT_TOKEN not found in environment variables');
    return;
  }
  
  if (!process.env.DISCORD_CLIENT_ID) {
    console.error('Error: DISCORD_CLIENT_ID not found in environment variables');
    console.error('Please add your Discord application ID to the .env file as DISCORD_CLIENT_ID=your_app_id');
    return;
  }
  
  const commands = [
    {
      name: 'chat',
      description: 'Chat with the BlockDAG assistant',
      options: [
        {
          name: 'message',
          type: 3, // STRING
          description: 'Your message to the assistant',
          required: true
        }
      ]
    }
  ];
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
    
    // For global commands
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    
    console.log('Successfully registered application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

module.exports = {
  DiscordBot,
  registerCommands
}; 