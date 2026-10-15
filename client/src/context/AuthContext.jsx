import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setToken, getToken, removeToken } from '../utils/helpers';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (isMounted) {
          setUser(data.data);
        }
      } catch (err) {
        // Only clear token if server explicitly confirms it's invalid/expired (401 or 403)
        // Never wipe token on 429 (rate-limit) or temporary network issues
        if (err.response?.status === 401 || err.response?.status === 403) {
          removeToken();
          if (isMounted) {
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, user: userData } = data.data;
    setToken(token);
    setUser(userData);
    return data.data;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
