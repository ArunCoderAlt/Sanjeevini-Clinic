import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', change }) => {
  const colorClasses = {
    green: 'bg-sky-100 text-[#1880B8]',
    blue: 'bg-sky-100 text-[#1880B8]',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
      <div className={`p-4 rounded-full mr-5 ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {change && (
          <p className="text-xs mt-1">
            <span className={change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
              {change}
            </span>
            <span className="text-gray-400 ml-1">vs last month</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
