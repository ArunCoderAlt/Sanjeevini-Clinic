import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Stethoscope, 
  Heart, 
  Pill, 
  Image as ImageIcon, 
  MessageSquare, 
  Mail, 
  Settings, 
  LogOut,
  X,
  Bot,
  Film,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'AI Bot Knowledge', path: '/admin/ai-bot', icon: Bot },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Services', path: '/admin/services', icon: Heart },
    { name: 'Treatments', path: '/admin/treatments', icon: Pill },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Swarna Bindu', path: '/admin/swarna-bindu', icon: Sparkles },
    { name: 'Instagram Reels', path: '/admin/reels', icon: Film },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0B1E32] text-white flex flex-col transform transition-transform duration-300 ease-in-out admin-sidebar
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ backgroundColor: '#0B1E32', backgroundImage: 'none' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60" style={{ backgroundColor: '#0B1E32' }}>
          <div className="flex items-center gap-3">
            <img src="/images/logo.png?v=4" alt="Sanjeevini" className="h-9 w-auto object-contain bg-white rounded-full p-0.5 shadow-sm" />
            <span className="text-xl font-bold text-white tracking-wide admin-brand-title" style={{ color: '#FFFFFF' }}>
              Sanjeevini
            </span>
          </div>
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav 
          className="admin-sidebar-nav flex-1 overflow-y-auto py-4"
          style={{ backgroundColor: 'transparent', backgroundImage: 'none', borderBottom: 'none', boxShadow: 'none' }}
        >
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#144979] to-[#0C2B4B] text-white shadow-md font-semibold' 
                      : 'text-slate-300 hover:bg-[#132A45] hover:text-white'}`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    backgroundColor: isActive ? '#144979' : 'transparent',
                    backgroundImage: isActive ? 'linear-gradient(135deg, #144979 0%, #0C2B4B 100%)' : 'none',
                  })}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700/60" style={{ backgroundColor: '#0B1E32' }}>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-300 rounded-lg hover:bg-[#132A45] hover:text-white transition-colors"
            style={{ color: '#CBD5E1' }}
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
