import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ExternalLink, Activity, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const AdminNavbar = ({ toggleSidebar, user }) => {
  const location = useLocation();
  const { actionsHistory, clearActions } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Format page title based on path
  const getPageTitle = () => {
    const path = location.pathname.replace('/admin', '');
    if (path === '' || path === '/') return 'Dashboard';

    return path
      .split('/')
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ');
  };

  const getCategoryColor = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('doctor')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cat.includes('service')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (cat.includes('treatment')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (cat.includes('swarna')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (cat.includes('bot') || cat.includes('ai')) return 'bg-sky-100 text-sky-800 border-sky-200';
    if (cat.includes('auth')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (cat.includes('appoint')) return 'bg-teal-100 text-teal-800 border-teal-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <header
      className="bg-white shadow-xs border-b border-slate-200/80 z-20 py-3.5 px-4 md:px-6 relative"
      style={{ backgroundColor: '#FFFFFF', backgroundImage: 'none' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-800 hidden sm:block" style={{ color: '#0F172A' }}>
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Quick link to live website */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#144979] hover:text-[#0C2B4B] bg-sky-50 hover:bg-sky-100/80 px-2.5 py-1.5 rounded-lg border border-sky-200 transition-colors"
            title="View public website (opens in new tab)"
          >
            <ExternalLink size={13} />
            <span>View Website</span>
          </Link>

          {/* Real-time actions & notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Admin Action History & Real-Time Sync"
            >
              <Bell size={20} />
              {actionsHistory.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[#144979] text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {actionsHistory.length > 99 ? '99+' : actionsHistory.length}
                </span>
              )}
              {/* Green pulse indicating live real-time synchronization */}
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>

            {/* Dropdown panel */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200/90 z-50 overflow-hidden animate-fadeDown">
                <div className="px-4 py-3 bg-gradient-to-r from-[#0C2B4B] to-[#144979] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" />
                    <span className="text-sm font-semibold">Admin Actions & Activity</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px] text-emerald-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-time</span>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {actionsHistory.length === 0 ? (
                    <div className="py-8 px-4 text-center text-gray-500">
                      <CheckCircle2 size={28} className="mx-auto text-gray-400 mb-2 opacity-60" />
                      <p className="text-xs font-medium text-gray-700">No actions recorded yet</p>
                      <p className="text-[11px] text-gray-400 mt-1">Changes made in the admin portal will appear here and persist across refreshes.</p>
                    </div>
                  ) : (
                    actionsHistory.map((act) => (
                      <div key={act.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-900 leading-tight">
                            {act.action}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${getCategoryColor(act.category)}`}>
                            {act.category}
                          </span>
                        </div>
                        {act.target && (
                          <p className="text-[11px] text-gray-600 mt-0.5 font-medium truncate">
                            {act.target}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {act.timeFormatted} ({act.dateFormatted})
                          </span>
                          <span className="text-gray-500 font-medium truncate max-w-[120px]">
                            by {act.user}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {actionsHistory.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {actionsHistory.length} action{actionsHistory.length === 1 ? '' : 's'} stored
                    </span>
                    <button
                      onClick={clearActions}
                      className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Trash2 size={11} />
                      Clear History
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-200">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-gray-500">{user?.role || 'Administrator'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#144979] to-[#0A2644] flex items-center justify-center text-white font-bold shadow-sm">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
