import axios from 'axios';
import { getToken, removeToken } from '../utils/helpers';
import { API_URL } from '../utils/constants';
import { broadcastDataChange, recordAdminAction, subscribeToDataChanges } from '../utils/realtimeSync';
import { getBrowserCache, setBrowserCache, invalidateBrowserCache, clearAllBrowserCache } from '../utils/browserCache';

// ==============================================================================
// DUAL-LAYER IN-MEMORY & BROWSER STORAGE CACHE + PROMISE DEDUPLICATOR
// Eliminates duplicate HTTP queries and gives instant 0ms page navigation & reload
// ==============================================================================
const inFlightRequests = new Map();
const BROWSER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes persistent browser cache

export const clearClientApiCache = (urlPrefix = '') => {
  if (!urlPrefix) {
    clearAllBrowserCache();
    return;
  }
  invalidateBrowserCache(urlPrefix);
};

// Auto-purge browser cache when real-time updates are received across tabs
if (typeof window !== 'undefined') {
  subscribeToDataChanges(() => {
    clearClientApiCache();
  });
}

const api = axios.create({
  baseURL: API_URL
});

// Intercept api.get to provide instant In-Memory + Browser Storage caching and request deduplication
const originalGet = api.get.bind(api);

api.get = async function (url, config = {}) {
  const token = getToken();
  const isAdminPath = typeof url === 'string' && (
    url.startsWith('/appointments') || 
    url.startsWith('/contact') || 
    url.startsWith('/auth') || 
    url.startsWith('/bot') ||
    url.startsWith('/settings/admin')
  );

  // Never cache authenticated admin queries, sensitive admin endpoints, or explicit no-cache
  if (token || isAdminPath || config.skipCache || config.params?.all === 'true' || config.params?.nocache === 'true') {
    return originalGet(url, config);
  }

  const cacheKey = `api_get:${url}:${config.params ? JSON.stringify(config.params) : ''}`;

  // 1. Check L1 In-Memory & L2 Browser Persistent Storage (survives reloads)
  const cachedData = getBrowserCache(cacheKey);
  if (cachedData) {
    return Promise.resolve({
      data: cachedData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      fromClientCache: true,
    });
  }

  // 2. In-flight request deduplication: reuse active promise for simultaneous component mounts
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Dispatch network request
  const requestPromise = originalGet(url, config)
    .then((response) => {
      // Store in L1 In-Memory + L2 Browser Storage
      if (response && response.data) {
        setBrowserCache(cacheKey, response.data, BROWSER_CACHE_TTL);
      }
      return response;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to deduce human-readable action from API call
const deduceActionInfo = (url = '', method = 'POST', data = {}) => {
  const cleanUrl = url.toLowerCase();
  const methodUpper = method.toUpperCase();

  if (cleanUrl.includes('/doctors')) {
    const action = methodUpper === 'POST' ? 'Added New Doctor' : methodUpper === 'DELETE' ? 'Deleted Doctor' : 'Updated Doctor Information';
    return { action, category: 'Doctors', target: data?.name || 'Doctor Profile' };
  }
  if (cleanUrl.includes('/services')) {
    const action = methodUpper === 'POST' ? 'Created New Service' : methodUpper === 'DELETE' ? 'Deleted Service' : 'Updated Service Details';
    return { action, category: 'Services', target: data?.title || 'Service' };
  }
  if (cleanUrl.includes('/treatments')) {
    const action = methodUpper === 'POST' ? 'Created New Treatment' : methodUpper === 'DELETE' ? 'Deleted Treatment' : 'Updated Treatment Details';
    return { action, category: 'Treatments', target: data?.name || 'Treatment' };
  }
  if (cleanUrl.includes('/gallery')) {
    const action = methodUpper === 'POST' ? 'Uploaded Gallery Media' : methodUpper === 'DELETE' ? 'Removed Gallery Item' : 'Updated Gallery Media';
    return { action, category: 'Gallery', target: data?.title || 'Media File' };
  }
  if (cleanUrl.includes('/swarna-bindu')) {
    const action = methodUpper === 'POST' ? 'Added Swarna Bindu Camp' : methodUpper === 'DELETE' ? 'Deleted Swarna Bindu Camp' : 'Updated Swarna Bindu Schedule';
    return { action, category: 'Swarna Bindu', target: data?.nakshatra || data?.date || 'Camp Schedule' };
  }
  if (cleanUrl.includes('/appointments')) {
    const action = methodUpper === 'DELETE' ? 'Deleted Appointment' : methodUpper === 'PUT' ? 'Updated Appointment Status' : 'New Appointment Scheduled';
    return { action, category: 'Appointments', target: data?.name || 'Appointment' };
  }
  if (cleanUrl.includes('/testimonials')) {
    const action = methodUpper === 'POST' ? 'Added Testimonial' : methodUpper === 'DELETE' ? 'Deleted Testimonial' : 'Updated Testimonial';
    return { action, category: 'Testimonials', target: data?.name || 'Patient Story' };
  }
  if (cleanUrl.includes('/bot/upload')) {
    return { action: 'Uploaded RAG Knowledge PDF', category: 'AI Bot', target: data?.fileName || 'Clinic PDF' };
  }
  if (cleanUrl.includes('/bot/settings')) {
    return { action: 'Updated AI Bot Configuration', category: 'AI Bot', target: 'Chatbot Settings' };
  }
  if (cleanUrl.includes('/reels')) {
    const action = methodUpper === 'POST' ? 'Added Instagram Reel' : methodUpper === 'DELETE' ? 'Removed Instagram Reel' : 'Updated Reel';
    return { action, category: 'Reels', target: data?.title || 'Reel' };
  }
  if (cleanUrl.includes('/settings')) {
    return { action: 'Updated Clinic Global Settings', category: 'Settings', target: 'Clinic Info' };
  }
  if (cleanUrl.includes('/contact')) {
    return { action: 'Contact Form Submission', category: 'Messages', target: data?.name || 'Patient Message' };
  }

  return {
    action: `${methodUpper} Request Completed`,
    category: 'System',
    target: url
  };
};

api.interceptors.response.use(
  (response) => {
    // If a modifying HTTP method (POST, PUT, PATCH, DELETE) succeeded, broadcast real-time update
    const method = response.config?.method?.toUpperCase();
    const url = response.config?.url || '';

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Clear client-side memory cache immediately upon data mutation
      clearClientApiCache();

      // Don't auto-log normal login query here as AuthContext handles it with user credentials
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        const actionInfo = deduceActionInfo(url, method, response.config?.data ? (() => {
          try { return typeof response.config.data === 'string' ? JSON.parse(response.config.data) : response.config.data; } catch { return {}; }
        })() : {});

        // Automatically record this admin action into persistent history
        recordAdminAction({
          action: actionInfo.action,
          category: actionInfo.category,
          target: actionInfo.target,
          details: `${method} ${url}`
        });
      }

      // Broadcast data change across the website in real-time
      broadcastDataChange(url, method, { status: response.status });
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('clinic_admin_user');
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
