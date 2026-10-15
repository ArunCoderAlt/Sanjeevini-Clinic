import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminNavbar from './components/AdminNavbar';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Services from './pages/Services';
import Treatments from './pages/Treatments';
import Gallery from './pages/Gallery';
import ReelsAdmin from './pages/ReelsAdmin';
import Testimonials from './pages/Testimonials';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import AiBotKnowledge from './pages/AiBotKnowledge';
import Login from './pages/Login';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';

const AdminApp = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <Loading />;
  }

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated and on login page, redirect to dashboard
  if (isAuthenticated && location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />;
  }

  // Login page layout
  if (location.pathname === '/admin/login') {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={user} 
        />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="" element={<Dashboard />} />
            <Route path="ai-bot" element={<AiBotKnowledge />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="services" element={<Services />} />
            <Route path="treatments" element={<Treatments />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="reels" element={<ReelsAdmin />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminApp;
