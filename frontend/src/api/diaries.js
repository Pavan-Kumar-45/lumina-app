import { apiClient } from './client';

export const diariesApi = {
  getAll: () => apiClient.get('/diaries/'),
  getById: (id) => apiClient.get(`/diaries/${id}`),
  getByDate: (date) => apiClient.get(`/diaries/date/${date}`),
  create: (data) => apiClient.post('/diaries/', data),
  update: (id, data) => apiClient.put(`/diaries/${id}`, data),
  delete: (id) => apiClient.delete(`/diaries/${id}`),
};