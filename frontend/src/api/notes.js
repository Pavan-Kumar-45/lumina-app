import { apiClient } from './client';

export const notesApi = {
  getAll: () => apiClient.get('/notes/'),
  create: (data) => apiClient.post('/notes/', data),
  update: (id, data) => apiClient.put(`/notes/${id}`, data),
  delete: (id) => apiClient.delete(`/notes/${id}`),
};