import axios from 'axios';
import { AI_PROVIDERS, PROMPT_TEMPLATE } from '../config/aiProviders.js';

class AIService {
  async fetchModels(provider, apiKey) {
    const providerConfig = AI_PROVIDERS[provider];
    
    if (!providerConfig) {
      throw new Error('Invalid provider');
    }

    // Jika provider punya static models, return itu
    if (providerConfig.staticModels) {
      return providerConfig.staticModels;
    }

    // Jika tidak ada endpoint untuk models, return empty
    if (!providerConfig.modelsEndpoint) {
      return [];
    }

    switch (provider) {
      case 'openai':
        return await this.fetchOpenAIModels(providerConfig, apiKey);
      case 'gemini':
        return await this.fetchGeminiModels(providerConfig, apiKey);
      case 'openrouter':
        return await this.fetchOpenRouterModels(providerConfig, apiKey);
      case 'mistral':
        return await this.fetchMistralModels(providerConfig, apiKey);
      case 'ollama':
        return await this.fetchOllamaModels(providerConfig);
      default:
        return [];
    }
  }

  async fetchOpenAIModels(config, apiKey) {
    try {
      const response = await axios.get(
        config.modelsEndpoint,
        { headers: config.headers(apiKey) }
      );
      
      // Filter hanya model chat yang relevan
      const chatModels = response.data.data
        .filter(model => 
          model.id.includes('gpt-4') || 
          model.id.includes('gpt-3.5-turbo')
        )
        .map(model => model.id)
        .sort();
      
      return chatModels;
    } catch (error) {
      throw new Error(`OpenAI Models Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async fetchGeminiModels(config, apiKey) {
    try {
      const endpoint = `${config.modelsEndpoint}?key=${apiKey}`;
      const response = await axios.get(endpoint, { headers: config.headers() });
      
      // Filter model yang support generateContent
      const models = response.data.models
        .filter(model => 
          model.supportedGenerationMethods?.includes('generateContent')
        )
        .map(model => model.name.replace('models/', ''))
        .sort();
      
      return models;
    } catch (error) {
      throw new Error(`Gemini Models Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async fetchOpenRouterModels(config, apiKey) {
    try {
      const response = await axios.get(
        config.modelsEndpoint,
        { headers: config.headers(apiKey) }
      );
      
      // Ambil ID models dan sort
      const models = response.data.data
        .map(model => model.id)
        .sort();
      
      return models;
    } catch (error) {
      throw new Error(`OpenRouter Models Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async fetchMistralModels(config, apiKey) {
    try {
      const response = await axios.get(
        config.modelsEndpoint,
        { headers: config.headers(apiKey) }
      );
      
      const models = response.data.data
        .map(model => model.id)
        .sort();
      
      return models;
    } catch (error) {
      throw new Error(`Mistral Models Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async fetchOllamaModels(config) {
    try {
      const response = await axios.get(
        config.modelsEndpoint,
        { headers: config.headers() }
      );
      
      // Ollama return format: {models: [{name: "llama2:latest", ...}]}
      const models = response.data.models
        .map(model => model.name)
        .sort();
      
      return models;
    } catch (error) {
      throw new Error(`Ollama Models Error: ${error.message}. Make sure Ollama is running.`);
    }
  }

  async generatePrompt(provider, model, apiKey, userInput) {
    const providerConfig = AI_PROVIDERS[provider];
    
    if (!providerConfig) {
      throw new Error('Invalid provider');
    }

    const promptWithInput = PROMPT_TEMPLATE.replace('{USER_INPUT}', userInput);

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(providerConfig, model, apiKey, promptWithInput);
      case 'anthropic':
        return await this.callAnthropic(providerConfig, model, apiKey, promptWithInput);
      case 'gemini':
        return await this.callGemini(providerConfig, model, apiKey, promptWithInput);
      case 'grok':
        return await this.callGrok(providerConfig, model, apiKey, promptWithInput);
      case 'openrouter':
        return await this.callOpenRouter(providerConfig, model, apiKey, promptWithInput);
      case 'mistral':
        return await this.callMistral(providerConfig, model, apiKey, promptWithInput);
      case 'ollama':
        return await this.callOllama(providerConfig, model, promptWithInput);
      default:
        throw new Error('Provider not supported');
    }
  }

  // Method call AI tetap sama seperti sebelumnya
  async callOpenAI(config, model, apiKey, prompt) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callAnthropic(config, model, apiKey, prompt) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.content[0].text;
    } catch (error) {
      throw new Error(`Anthropic Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callGemini(config, model, apiKey, prompt) {
    try {
      const endpoint = `${config.endpoint}/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        endpoint,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        { headers: config.headers() }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error(`Gemini Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callGrok(config, model, apiKey, prompt) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Grok Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callOpenRouter(config, model, apiKey, prompt) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenRouter Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callMistral(config, model, apiKey, prompt) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Mistral Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callOllama(config, model, prompt) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          stream: false
        },
        { headers: config.headers() }
      );
      return response.data.message.content;
    } catch (error) {
      throw new Error(`Ollama Error: ${error.response?.data?.error || error.message}`);
    }
  }
}

export default new AIService();
