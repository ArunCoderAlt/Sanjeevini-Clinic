import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false); // Can change to true if fetching real settings

  useEffect(() => {
    // Optional: fetch site settings from backend
    // For now we rely on local clinicInfo
    setLoading(false);
  }, []);

  if (loading) return <Loading fullPage />;

  return (
    <AppContext.Provider value={{ settings }}>
      {children}
    </AppContext.Provider>
  );
};
