import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', change }) => {
  const colorClasses = {
    green: 'bg-sky-100 text-[#0C2B4B]',
    blue: 'bg-sky-100 text-[#0C2B4B]',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 flex items-center"
      style={{ backgroundColor: '#FFFFFF', backgroundImage: 'none' }}
    >
      <div className={`p-4 rounded-full mr-5 ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1" style={{ color: '#64748B' }}>{title}</p>
        <h3 className="text-2xl font-bold text-slate-900" style={{ color: '#0F172A' }}>{value}</h3>
        {change && (
          <p className="text-xs mt-1">
            <span className={change.startsWith('+') ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
              {change}
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
