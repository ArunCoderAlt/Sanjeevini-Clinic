import React from 'react';

const statusConfig = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
};

const AppointmentStatus = ({ status = 'pending' }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default AppointmentStatus;
