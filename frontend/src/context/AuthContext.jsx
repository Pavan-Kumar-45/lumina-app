import React, { createContext, useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      usersApi.getCurrentUser()
        .then(setCurrentUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    const user = await usersApi.getCurrentUser();
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const refreshCurrentUser = async () => {
    const user = await usersApi.getCurrentUser();
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout, refreshCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};