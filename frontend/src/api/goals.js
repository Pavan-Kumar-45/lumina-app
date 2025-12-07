import { apiClient } from './client';

export const goalsApi = {
  getAll: () => apiClient.get('/goals/'),
  getById: (id) => apiClient.get(`/goals/${id}`),
  create: (data) => apiClient.post('/goals/', data),
  update: (id, data) => apiClient.put(`/goals/${id}`, data),
  complete: (id) => apiClient.put(`/goals/complete/${id}`, {}),
  delete: (id) => apiClient.delete(`/goals/${id}`),
};