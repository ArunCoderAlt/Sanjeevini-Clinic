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
  Film
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
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0B1E32] text-white flex flex-col transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-[#38BDF8]">Sanjeevini Admin</h1>
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
