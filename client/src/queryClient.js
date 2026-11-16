import { QueryClient } from '@tanstack/react-query';
import { subscribeToDataChanges } from './utils/realtimeSync';
import { invalidateBrowserCache, clearAllBrowserCache } from './utils/browserCache';

/**
 * Global TanStack React Query Client
 *
 * Configured with active Garbage Collection and 0-latency cache invalidation:
 * - staleTime (0): Data is always checked against the server, guaranteeing fresh data on refresh and navigation.
 * - gcTime (60s): Inactive/unmounted queries are garbage-collected and evicted after 60 seconds to keep memory lean.
 * - Real-Time Cache Purge: When any mutation occurs, old data is purged from memory immediately.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Immediately consider data stale so reloads and mounts always fetch latest updates
      gcTime: 60 * 1000, // 60s garbage collection for inactive queries
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
      retry: 1,
    },
  },
});

// Clean up any legacy localStorage persistent query caches to prevent stale data
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('sanjeevini_react_query_cache');
  } catch (_) {}
}

/**
 * Immediately purges stale data from React Query and browser cache,
 * then triggers a fresh refetch for all active views.
 */
export const purgeAndInvalidateQuery = (keys) => {
  const queryKeys = Array.isArray(keys) ? keys : [keys];
  for (const k of queryKeys) {
    // 1. Immediately delete cached data from React Query cache (instant garbage collection)
    queryClient.removeQueries({ queryKey: [k], exact: false });
    // 2. Trigger fresh network refetch for any active components observing this key
    queryClient.invalidateQueries({ queryKey: [k], refetchType: 'all' });
    // 3. Purge matching entries from browser persistent & RAM cache
    invalidateBrowserCache(k);
  }
};

/**
 * Completely purges all cached queries and storage entries across the application
 */
export const purgeAllQueriesAndCache = () => {
  queryClient.clear();
  queryClient.invalidateQueries({ refetchType: 'all' });
  clearAllBrowserCache();
};

// Auto-purge matching query keys and browser cache when real-time updates happen across tabs
if (typeof window !== 'undefined') {
  subscribeToDataChanges((event) => {
    const url = event?.url?.toLowerCase() || '';
    if (url.includes('/doctors')) {
      purgeAndInvalidateQuery(['doctors', 'doctor']);
    } else if (url.includes('/services')) {
      purgeAndInvalidateQuery(['services', 'service']);
    } else if (url.includes('/treatments')) {
      purgeAndInvalidateQuery(['treatments', 'treatment', 'treatment-categories']);
    } else if (url.includes('/gallery')) {
      purgeAndInvalidateQuery(['gallery']);
    } else if (url.includes('/reels')) {
      purgeAndInvalidateQuery(['reels']);
    } else if (url.includes('/testimonials')) {
      purgeAndInvalidateQuery(['testimonials']);
    } else if (url.includes('/swarna-bindu')) {
      purgeAndInvalidateQuery(['swarna-bindu']);
    } else if (url.includes('/settings')) {
      purgeAndInvalidateQuery(['settings']);
    } else {
      purgeAllQueriesAndCache();
    }
  });
}
