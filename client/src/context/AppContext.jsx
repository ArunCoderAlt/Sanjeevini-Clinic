import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { 
  getAdminActions, 
  recordAdminAction, 
  clearAdminActions, 
  subscribeToDataChanges, 
  subscribeToActionLogs,
  broadcastDataChange 
} from '../utils/realtimeSync';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [actionsHistory, setActionsHistory] = useState(() => getAdminActions());

  // Subscribe to real-time data changes across tabs and current window
  useEffect(() => {
    const unsubscribeData = subscribeToDataChanges(() => {
      setDataVersion((prev) => prev + 1);
    });

    const unsubscribeActions = subscribeToActionLogs((event) => {
      if (event.type === 'ACTION_LOGGED') {
        setActionsHistory((prev) => [event.action, ...prev.filter(a => a.id !== event.action.id)].slice(0, 100));
      } else if (event.type === 'ACTIONS_CLEARED') {
        setActionsHistory([]);
      } else if (event.type === 'STORAGE_SYNC') {
        setActionsHistory(event.actions || []);
      }
    });

    // When returning to tab or window focus, verify if data changed in another tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const storedVersion = localStorage.getItem('clinic_data_version');
        if (storedVersion) {
          setDataVersion((prev) => prev + 1);
        }
        setActionsHistory(getAdminActions());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      unsubscribeData();
      unsubscribeActions();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  const triggerRefresh = useCallback((meta = {}) => {
    broadcastDataChange('', 'MANUAL_REFRESH', meta);
    setDataVersion((prev) => prev + 1);
  }, []);

  const handleRecordAction = useCallback((actionData) => {
    const created = recordAdminAction(actionData);
    if (created) {
      setActionsHistory((prev) => [created, ...prev].slice(0, 100));
    }
    return created;
  }, []);

  const handleClearActions = useCallback(() => {
    clearAdminActions();
    setActionsHistory([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        dataVersion,
        actionsHistory,
        recordAction: handleRecordAction,
        clearActions: handleClearActions,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
