import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', change }) => {
  const colorClasses = {
    green: 'bg-emerald-100 text-emerald-700 shadow-xs',
    blue: 'bg-sky-100 text-[#0C2B4B] shadow-xs',
    orange: 'bg-amber-100 text-amber-700 shadow-xs',
    purple: 'bg-purple-100 text-purple-700 shadow-xs',
    red: 'bg-red-100 text-red-600 shadow-xs',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-[#C2DCF2]">
      <div className={`p-4 rounded-full mr-5 ${colorClasses[color] || colorClasses.blue}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#475E75] mb-1">{title}</p>
        <h3 className="text-3xl font-serif font-bold text-[#09223D]">{value}</h3>
        {change && (
          <p className="text-xs mt-1">
            <span className={change.startsWith('+') ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
              {change}
            </span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
