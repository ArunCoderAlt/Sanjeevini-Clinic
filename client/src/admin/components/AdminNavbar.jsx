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
    <header className="bg-gradient-to-r from-[#E6F2FA] to-[#D8ECF8] border-b border-[#B8D5ED] shadow-xs z-10 py-3.5 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-[#09223D] hover:text-black focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-bold text-[#09223D] hidden sm:block">
            {getPageTitle()}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#243B52] hover:bg-white/50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-[#B8D5ED]">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#09223D]">{user?.name || 'Admin User'}</span>
              <span className="text-xs font-medium text-[#475E75]">{user?.role || 'Administrator'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#144979] to-[#0A2644] flex items-center justify-center text-white font-bold shadow-md">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
