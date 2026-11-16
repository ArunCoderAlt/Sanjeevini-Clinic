import { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import EmergencyButton from './components/layout/EmergencyButton';
import TopBar from './components/layout/TopBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Lazy-load chatbot so hero & initial layout render without delay
const FloatingChatbot = lazy(() => import('./components/chatbot/FloatingChatbot'));

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [loadChatbot, setLoadChatbot] = useState(false);

  useEffect(() => {
    if (isAdmin) return;

    // Defer loading until after main content renders / idle callback
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setLoadChatbot(true), { timeout: 2000 });
      return () => {
        if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      };
    } else {
      const timer = setTimeout(() => setLoadChatbot(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <ScrollToTop />
          {!isAdmin && <TopBar />}
          {!isAdmin && <Navbar />}
          <main className={isAdmin ? "" : "min-h-screen bg-cream font-body text-dark"}>
            <AppRoutes />
          </main>
          {!isAdmin && <Footer />}
          {!isAdmin && loadChatbot && (
            <Suspense fallback={null}>
              <FloatingChatbot />
            </Suspense>
          )}
          {!isAdmin && <FloatingWhatsApp />}
          {!isAdmin && <EmergencyButton />}
          {!isAdmin && <BackToTop />}
          <Toaster position="top-center" toastOptions={{ className: 'font-body' }} />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
