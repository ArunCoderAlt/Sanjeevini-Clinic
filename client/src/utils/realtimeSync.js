/**
 * Real-Time Synchronization & Persistent Admin Action Logging Engine
 * - Real-time cross-tab and in-tab event bus via BroadcastChannel & CustomEvents
 * - Persistent action history storage surviving page reloads
 * - Real-time state reflection on the public website upon admin mutations
 */

const CHANNEL_NAME = 'sanjeevini_clinic_sync_channel';
const ACTIONS_KEY = 'clinic_admin_actions';
const DATA_VERSION_KEY = 'clinic_data_version';
const MAX_ACTIONS = 100;

let channel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment, using localStorage fallback');
}

/**
 * Get all stored admin actions from localStorage
 */
export const getAdminActions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to parse admin actions from storage:', err);
    return [];
  }
};

/**
 * Record a new admin action into persistent storage
 */
export const recordAdminAction = ({ action, category = 'General', target = '', details = '', user = null }) => {
  if (typeof window === 'undefined') return null;

  try {
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem('clinic_admin_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentUser = parsed.name || parsed.email || 'Admin';
        }
      } catch {}
    }
    if (!currentUser) currentUser = 'Admin';

    const now = new Date();
    const newAction = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateFormatted: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      action,
      category,
      target: String(target || ''),
      details: String(details || ''),
      user: typeof currentUser === 'string' ? currentUser : currentUser.name || currentUser.email || 'Admin',
    };

    const existing = getAdminActions();
    const updated = [newAction, ...existing].slice(0, MAX_ACTIONS);

    localStorage.setItem(ACTIONS_KEY, JSON.stringify(updated));

    // Dispatch in current window
    window.dispatchEvent(new CustomEvent('clinic_action_logged', { detail: newAction }));

    // Broadcast across tabs
    if (channel) {
      channel.postMessage({ type: 'ACTION_LOGGED', action: newAction });
    }

    return newAction;
  } catch (err) {
    console.error('Error recording admin action:', err);
    return null;
  }
};

/**
 * Clear stored admin actions
 */
export const clearAdminActions = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIONS_KEY);
    window.dispatchEvent(new CustomEvent('clinic_actions_cleared'));
    if (channel) {
      channel.postMessage({ type: 'ACTIONS_CLEARED' });
    }
  } catch (err) {
    console.error('Error clearing admin actions:', err);
  }
};

/**
 * Broadcast that clinic data was changed (by an admin action)
 * This triggers instant re-renders in open pages without requiring a page reload.
 */
export const broadcastDataChange = (url = '', method = 'UPDATE', meta = {}) => {
  if (typeof window === 'undefined') return;

  const version = Date.now().toString();
  try {
    localStorage.setItem(DATA_VERSION_KEY, version);

    const payload = {
      type: 'DATA_CHANGED',
      url,
      method: method.toUpperCase(),
      meta,
      version,
      timestamp: Date.now(),
    };

    // Dispatch locally
    window.dispatchEvent(new CustomEvent('clinic_data_updated', { detail: payload }));

    // Broadcast across all open browser tabs/windows
    if (channel) {
      channel.postMessage(payload);
    }
  } catch (err) {
    console.error('Error broadcasting data change:', err);
  }
};

/**
 * Subscribe to real-time data change updates
 */
export const subscribeToDataChanges = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => callback(e.detail);
  const handleStorageEvent = (e) => {
    if (e.key === DATA_VERSION_KEY) {
      callback({ type: 'DATA_CHANGED', version: e.newValue });
    }
  };
  const handleChannelMessage = (e) => {
    if (e.data && e.data.type === 'DATA_CHANGED') {
      callback(e.data);
    }
  };

  window.addEventListener('clinic_data_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);
  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }

  return () => {
    window.removeEventListener('clinic_data_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
  };
};

/**
 * Subscribe to admin action log updates
 */
export const subscribeToActionLogs = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleActionLogged = (e) => callback({ type: 'ACTION_LOGGED', action: e.detail });
  const handleActionsCleared = () => callback({ type: 'ACTIONS_CLEARED' });
  const handleStorageEvent = (e) => {
    if (e.key === ACTIONS_KEY) {
      callback({ type: 'STORAGE_SYNC', actions: getAdminActions() });
    }
  };
  const handleChannelMessage = (e) => {
    if (e.data && (e.data.type === 'ACTION_LOGGED' || e.data.type === 'ACTIONS_CLEARED')) {
      callback(e.data);
    }
  };

  window.addEventListener('clinic_action_logged', handleActionLogged);
  window.addEventListener('clinic_actions_cleared', handleActionsCleared);
  window.addEventListener('storage', handleStorageEvent);
  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }

  return () => {
    window.removeEventListener('clinic_action_logged', handleActionLogged);
    window.removeEventListener('clinic_actions_cleared', handleActionsCleared);
    window.removeEventListener('storage', handleStorageEvent);
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
  };
};
