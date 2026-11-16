/**
 * Dual-Layer In-Memory & Browser Storage Cache Manager
 *
 * Architecture:
 * - L1: In-Memory Map (0ms instantaneous RAM lookup, zero JSON serialization overhead)
 * - L2: Persistent Browser Storage (localStorage/sessionStorage, survives page reloads & browser restarts)
 * - Auto-Pruning: Gracefully cleans expired entries and handles storage quota limits
 * - Real-Time Invalidation: Flushes both L1 and L2 instantly on admin mutations or cross-tab sync
 */

const L1_MEMORY_CACHE = new Map();
const CACHE_PREFIX = 'sanjeevini_cache_';
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes default browser cache

/**
 * Safe storage accessor that handles private browsing, quota errors, and SSR
 */
const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    const testKey = '__cache_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
};

/**
 * Get item from L1 (memory) or L2 (browser persistent storage)
 * @param {string} key Cache key
 * @returns {any|null} Cached data or null
 */
export const getBrowserCache = (key) => {
  const normalizedKey = key.startsWith(CACHE_PREFIX) ? key : `${CACHE_PREFIX}${key}`;

  // 1. Check L1 In-Memory RAM Cache (fastest: 0ms)
  const memoryEntry = L1_MEMORY_CACHE.get(normalizedKey);
  if (memoryEntry) {
    if (Date.now() < memoryEntry.expiresAt) {
      return memoryEntry.data;
    }
    L1_MEMORY_CACHE.delete(normalizedKey);
  }

  // 2. Check L2 Browser Persistent Storage (survives reload)
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(normalizedKey);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (entry && entry.expiresAt && Date.now() < entry.expiresAt) {
      // Re-populate L1 RAM cache for immediate future reads
      L1_MEMORY_CACHE.set(normalizedKey, {
        data: entry.data,
        expiresAt: entry.expiresAt,
      });
      return entry.data;
    }

    // Expired item cleanup
    storage.removeItem(normalizedKey);
    return null;
  } catch {
    return null;
  }
};

/**
 * Set item in both L1 (memory) and L2 (browser storage)
 * @param {string} key Cache key
 * @param {any} data Payload to cache
 * @param {number} ttlMs Time-to-live in milliseconds
 */
export const setBrowserCache = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  if (data === undefined || data === null) return;
  const normalizedKey = key.startsWith(CACHE_PREFIX) ? key : `${CACHE_PREFIX}${key}`;
  const expiresAt = Date.now() + ttlMs;

  // 1. Save to L1 In-Memory Cache
  L1_MEMORY_CACHE.set(normalizedKey, {
    data,
    expiresAt,
  });

  // 2. Save to L2 Browser Storage
  const storage = getStorage();
  if (!storage) return;

  try {
    const payload = JSON.stringify({
      data,
      expiresAt,
      timestamp: Date.now(),
    });
    storage.setItem(normalizedKey, payload);
  } catch (err) {
    // If quota exceeded, prune expired entries and retry once
    pruneExpiredBrowserCache();
    try {
      storage.setItem(
        normalizedKey,
        JSON.stringify({ data, expiresAt, timestamp: Date.now() })
      );
    } catch {
      // Storage full, L1 RAM cache will still serve the user during this session
    }
  }
};

/**
 * Invalidate a specific key or keys matching a prefix
 * @param {string} prefix Key or prefix to invalidate
 */
export const invalidateBrowserCache = (prefix = '') => {
  const normPrefix = prefix.startsWith(CACHE_PREFIX) ? prefix : `${CACHE_PREFIX}${prefix}`;

  // Flush from L1 Memory
  for (const key of L1_MEMORY_CACHE.keys()) {
    if (!prefix || key.includes(prefix) || key.startsWith(normPrefix)) {
      L1_MEMORY_CACHE.delete(key);
    }
  }

  // Flush from L2 Browser Storage
  const storage = getStorage();
  if (!storage) return;

  try {
    const keysToRemove = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        if (!prefix || k.includes(prefix) || k.startsWith(normPrefix)) {
          keysToRemove.push(k);
        }
      }
    }
    keysToRemove.forEach((k) => storage.removeItem(k));
  } catch {
    // Ignore storage iteration issues
  }
};

/**
 * Clear all website browser caches
 */
export const clearAllBrowserCache = () => {
  L1_MEMORY_CACHE.clear();
  const storage = getStorage();
  if (!storage) return;

  try {
    const keysToRemove = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && (k.startsWith(CACHE_PREFIX) || k.startsWith('sanjeevini_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => storage.removeItem(k));
  } catch {}
};

/**
 * Prune all expired entries from browser storage
 */
export const pruneExpiredBrowserCache = () => {
  const storage = getStorage();
  if (!storage) return;

  try {
    const keysToRemove = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(storage.getItem(k));
          if (!item || !item.expiresAt || Date.now() >= item.expiresAt) {
            keysToRemove.push(k);
          }
        } catch {
          keysToRemove.push(k);
        }
      }
    }
    keysToRemove.forEach((k) => storage.removeItem(k));
  } catch {}
};

// Auto-prune on startup to keep storage lean
if (typeof window !== 'undefined') {
  pruneExpiredBrowserCache();
}
