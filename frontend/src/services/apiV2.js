import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const apiV2 = {
  templates: {
    list(params = {}) {
      return apiClient.get('/templates', { params }).then((r) => r.data);
    },
    upsert(payload) {
      return apiClient.post('/templates', payload).then((r) => r.data);
    },
    remove(id) {
      return apiClient.delete(`/templates/${id}`).then((r) => r.data);
    },
    rate(payload) {
      return apiClient.post('/templates/rate', payload).then((r) => r.data);
    },
  },
  history: {
    list(params = {}) {
      return apiClient.get('/history', { params }).then((r) => r.data);
    },
    add(payload) {
      return apiClient.post('/history', payload).then((r) => r.data);
    },
    remove(id) {
      return apiClient.delete(`/history/${id}`).then((r) => r.data);
    },
    clear() {
      return apiClient.post('/history/clear').then((r) => r.data);
    },
  },
  suggestions: {
    suggest(payload) {
      return apiClient.post('/suggestions', payload).then((r) => r.data);
    },
  },
};
