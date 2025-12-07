import { apiClient } from './client';

export const usersApi = {
  getCurrentUser: () => apiClient.get('/users/me/'),
  updateUsername: (username) => apiClient.put('/users/me/username', { username }),
  updateEmail: (email) => apiClient.put('/users/me/email', { email }),
  updatePassword: (password) => apiClient.put('/users/me/password', { password }),
  updateRollover: (rollover) => apiClient.put('/users/me/rollover', { rollover }),
  
  // --- NEW NOTIFICATION ENDPOINTS ---
  sendValidationCode: () => apiClient.post('/users/me/send-validation-code', {}),
  validateEmail: (email, code) => apiClient.post('/users/me/validate-email', { email, code }),
  updateNotifications: (enable) => apiClient.put(`/users/me/notifications?enable=${enable}`, {}),
  disableNotifications: () => apiClient.put('/users/me/notifications/disable', {}),

  deleteAccount: () => apiClient.delete('/users/me/'),
};