import React from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import EmergencyButton from './components/layout/EmergencyButton';
import FloatingChatbot from './components/chatbot/FloatingChatbot';
import TopBar from './components/layout/TopBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

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
          {!isAdmin && <FloatingChatbot />}
          {!isAdmin && <FloatingWhatsApp />}
          {!isAdmin && <EmergencyButton />}
          {!isAdmin && <BackToTop />}
          <Toaster position="top-center" toastOptions={{ className: 'font-body' }} />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
