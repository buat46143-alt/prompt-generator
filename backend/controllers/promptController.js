import aiService from '../services/aiService.js';
import { AI_PROVIDERS } from '../config/aiProviders.js';

export const generatePrompt = async (req, res) => {
  try {
    const { provider, model, apiKey, userInput } = req.body;

    if (!provider || !model || !userInput) {
      return res.status(400).json({
        success: false,
        message: 'Provider, model, and user input are required'
      });
    }

    if (provider !== 'ollama' && !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required for this provider'
      });
    }

    const generatedPrompt = await aiService.generatePrompt(
      provider,
      model,
      apiKey,
      userInput
    );

    res.json({
      success: true,
      data: {
        generatedPrompt,
        provider,
        model,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate prompt'
    });
  }
};

export const getProviders = (req, res) => {
  const providers = Object.keys(AI_PROVIDERS).map(key => ({
    id: key,
    name: AI_PROVIDERS[key].name,
    requiresApiKey: key !== 'ollama'
  }));

  res.json({
    success: true,
    data: providers
  });
};

export const getModels = async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: 'Provider is required'
      });
    }

    if (provider !== 'ollama' && !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required for this provider'
      });
    }

    const models = await aiService.fetchModels(provider, apiKey);

    res.json({
      success: true,
      data: {
        provider,
        models
      }
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch models'
    });
  }
};
