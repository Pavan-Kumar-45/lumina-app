import { apiClient } from './client';

export const todosApi = {
  getAll: () => apiClient.get('/todos/'),
  getByDate: (date) => apiClient.get(`/todos/date/${date}`),
  create: (data) => apiClient.post('/todos/', data),
  update: (id, data) => apiClient.put(`/todos/${id}`, data),
  updateStatus: (id, status) => apiClient.put(`/todos/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/todos/${id}`),
  rollover: () => apiClient.post('/todos/rollover', {}),
};