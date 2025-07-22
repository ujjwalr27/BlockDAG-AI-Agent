const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Simple version without function calling for compatibility
 */
function getModel() {
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40
    }
  });
}

/**
 * Generate system prompt for the agent
 */
function getSystemPrompt() {
  return "I'm a BlockDAG assistant that can help with BlockDAG Primordial Testnet interactions. I can explain how to transfer tokens, swap tokens via DEX, check balances, and provide liquidity. The BlockDAG network offers fast confirmations (under 2s) and very low fees ($0.01/tx).";
}

/**
 * Process a user message and get AI response
 */
async function processMessage(message, chatHistory = []) {
  // Define available models to try in order
  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
  let lastError = null;
  
  // Try each model in sequence
  for (const modelName of models) {
    try {
      console.log(`Trying to use model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40
        }
      });
      
      // Simplest possible approach - just generate content with context
      const contextualPrompt = `You are a BlockDAG assistant that helps with blockchain operations. 
The BlockDAG Primordial Testnet offers fast confirmations and low fees.
You can help with transfers, swaps, balances, and liquidity.

User question: ${message}`;
      
      const result = await model.generateContent(contextualPrompt);
      return {
        text: result.response.text(),
        functionCalls: []
      };
    } catch (error) {
      console.error(`Error with model ${modelName}:`, error.message);
      lastError = error;
      // Continue to the next model
    }
  }
  
  // If all models failed, return a helpful error message
  console.error("All Gemini models failed:", lastError);
  return {
    text: "I'm having trouble connecting to my AI services right now. Please check your Gemini API key and make sure it's correctly configured with appropriate access.",
    functionCalls: []
  };
}

module.exports = {
  processMessage,
  functionSchemas: [] // Empty for compatibility
}; 