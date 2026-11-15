import React from 'react';
import { Clock } from 'lucide-react';

const ConsultationHours = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage flex items-start">
      <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center shrink-0 mr-4 text-primary-700">
        <Clock className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-serif text-primary-700 mb-3 font-semibold">Consultation Hours</h4>
        <div className="space-y-2.5 text-sm text-gray-700 w-full max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between gap-6">
            <span className="font-medium text-gray-600 whitespace-nowrap">Mon – Sat:</span>
            <span className="font-semibold text-primary-700 whitespace-nowrap">5:00 PM – 9:30 PM</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="font-medium text-gray-600 whitespace-nowrap">Sunday:</span>
            <span className="font-semibold text-red-500 whitespace-nowrap">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHours;
