import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AdminNavbar = ({ toggleSidebar, user }) => {
  const location = useLocation();
  
  // Format page title based on path
  const getPageTitle = () => {
    const path = location.pathname.replace('/admin', '');
    if (path === '' || path === '/') return 'Dashboard';
    
    // Convert /some-path to Some Path
    return path
      .split('/')
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ');
  };

  return (
    <header className="bg-white shadow-sm z-10 py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
            {getPageTitle()}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-gray-500">{user?.role || 'Administrator'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1880B8] flex items-center justify-center text-white font-bold">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
