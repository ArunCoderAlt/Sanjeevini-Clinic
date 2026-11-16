import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { subscribeToDataChanges } from './utils/realtimeSync';
import { invalidateBrowserCache, clearAllBrowserCache } from './utils/browserCache';

/**
 * Global TanStack React Query Client with Browser Storage Persistence
 *
 * Configured with aggressive dual-layer caching to eliminate repeated network calls:
 * - staleTime (5 mins): Data is considered fresh for 5 minutes. Repeated mounts or
 *   navigation between pages render instantly from cache with 0 network calls.
 * - gcTime (24 hours): Query cache is retained for 24 hours.
 * - Browser Storage Persister: Serializes the React Query cache into localStorage so
 *   page reloads and returning visitors render the website with 0ms first-paint latency!
 * - Automatic Real-Time Invalidation: When any admin creates/edits/deletes items or
 *   when realtimeSync fires, matching query keys and browser storage entries are immediately flushed.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: 1,
    },
  },
});

// Configure Browser Storage Persistence for React Query (Survives page reloads & browser restarts)
if (typeof window !== 'undefined') {
  try {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'sanjeevini_react_query_cache',
      throttleTime: 1000,
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours persistence
      buster: 'v2.1',
    });
  } catch (err) {
    console.warn('React Query browser storage persistence notice:', err);
  }
}

// Auto-invalidate matching query keys and browser cache when real-time updates happen across tabs
if (typeof window !== 'undefined') {
  subscribeToDataChanges((event) => {
    const url = event?.url?.toLowerCase() || '';
    if (url.includes('/doctors')) {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      invalidateBrowserCache('doctors');
    } else if (url.includes('/services')) {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service'] });
      invalidateBrowserCache('services');
    } else if (url.includes('/treatments')) {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['treatment'] });
      invalidateBrowserCache('treatments');
    } else if (url.includes('/gallery')) {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      invalidateBrowserCache('gallery');
    } else if (url.includes('/reels')) {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      invalidateBrowserCache('reels');
    } else if (url.includes('/testimonials')) {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      invalidateBrowserCache('testimonials');
    } else if (url.includes('/swarna-bindu')) {
      queryClient.invalidateQueries({ queryKey: ['swarna-bindu'] });
      invalidateBrowserCache('swarna-bindu');
    } else if (url.includes('/settings')) {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      invalidateBrowserCache('settings');
    } else {
      queryClient.invalidateQueries();
      clearAllBrowserCache();
    }
  });
}
