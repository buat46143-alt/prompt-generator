import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const promptService = {
  async getProviders() {
    try {
      const response = await apiClient.get('/prompt/providers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch providers');
    }
  },

  async getModels(provider, apiKey) {
    try {
      const response = await apiClient.post('/prompt/models', {
        provider,
        apiKey
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch models');
    }
  },

  async generatePrompt(provider, model, apiKey, userInput) {
    try {
      const response = await apiClient.post('/prompt/generate', {
        provider,
        model,
        apiKey,
        userInput
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate prompt');
    }
  }
};
