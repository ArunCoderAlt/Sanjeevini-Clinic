import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/index.css';
import './styles/animations.css';
import { API_URL } from './utils/constants';

// Dynamically preconnect & DNS prefetch to backend API server if on external origin
if (typeof document !== 'undefined' && API_URL && /^https?:\/\//i.test(API_URL)) {
  try {
    const apiOrigin = new URL(API_URL).origin;
    if (apiOrigin !== window.location.origin) {
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = apiOrigin;
      preconnectLink.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectLink);

      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = apiOrigin;
      document.head.appendChild(dnsLink);
    }
  } catch (_) {}
}

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>
);
