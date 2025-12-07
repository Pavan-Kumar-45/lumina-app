export const API_BASE_URL = 'http://localhost:8000';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
      throw new Error('Unauthorized');
    }

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};


// Automatically detect if we are in Production (Vercel) or Development (Localhost)
// const isProduction = import.meta.env.PROD;

// // REPLACE 'https://lumina-backend.onrender.com' with your actual Render URL after deployment!
// export const API_BASE_URL = isProduction 
//   ? 'https://lumina-backend-i7p7.onrender.com' 
//   : 'http://localhost:8000';

// export const apiClient = {
//   async request(endpoint, options = {}) {
//     const token = localStorage.getItem('token');
//     const headers = {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     };
    
//     if (token && !options.skipAuth) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         ...options,
//         headers,
//       });

//       if (response.status === 401) {
//         localStorage.removeItem('token');
//         window.location.reload();
//         throw new Error('Unauthorized');
//       }

//       if (!response.ok && response.status !== 204) {
//         const error = await response.json().catch(() => ({ detail: 'Request failed' }));
//         throw new Error(error.detail || 'Request failed');
//       }

//       if (response.status === 204) {
//         return null;
//       }

//       return response.json();
//     } catch (error) {
//       console.error("API Request Error:", error);
//       throw error;
//     }
//   },

//   get(endpoint) {
//     return this.request(endpoint);
//   },

//   post(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   put(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   delete(endpoint) {
//     return this.request(endpoint, { method: 'DELETE' });
//   },
// };