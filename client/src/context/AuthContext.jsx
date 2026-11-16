import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { setToken, getToken, removeToken } from '../utils/helpers';
import { recordAdminAction } from '../utils/realtimeSync';

const USER_STORAGE_KEY = 'clinic_admin_user';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization from localStorage so admin session is immediately maintained across refreshes
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // If token & cached user exist, don't show blank/loading screen on refresh
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    const token = getToken();
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return !(token && stored);
  });

  // Keep state in sync across different browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === USER_STORAGE_KEY) {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
      if (e.key === 'token' && !e.newValue) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Background token verification without wiping valid session on transient network delays
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (isMounted && data?.data) {
          setUser(data.data);
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.data));
          } catch {}
        }
      } catch (err) {
        // Only clear credentials if server explicitly rejects token with 401 or 403
        if (err.response?.status === 401 || err.response?.status === 403) {
          removeToken();
          try {
            localStorage.removeItem(USER_STORAGE_KEY);
          } catch {}
          if (isMounted) {
            setUser(null);
          }
        }
        // Otherwise, keep the cached user session active (rate limits, cold starts, offline)
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, user: userData } = data.data;

    setToken(token);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch {}
    setUser(userData);

    // Record login action in persistent history
    recordAdminAction({
      action: 'Admin Logged In',
      category: 'Authentication',
      target: userData?.name || userData?.email || 'Admin',
      details: `Active session started for ${userData?.email || email}`,
      user: userData
    });

    return data.data;
  };

  const logout = useCallback(() => {
    const currentUser = user;
    removeToken();
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
    setUser(null);

    // Record logout action in persistent history
    recordAdminAction({
      action: 'Admin Logged Out',
      category: 'Authentication',
      target: currentUser?.name || currentUser?.email || 'Admin',
      details: 'Session ended successfully',
      user: currentUser
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
