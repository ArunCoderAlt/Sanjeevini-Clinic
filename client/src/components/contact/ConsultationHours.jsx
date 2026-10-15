import React from 'react';
import { Clock } from 'lucide-react';

const ConsultationHours = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage flex items-start">
      <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center shrink-0 mr-4 text-primary-700">
        <Clock className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-lg font-serif text-primary-700 mb-3">Consultation Hours</h4>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between w-48">
            <span>Mon - Sat:</span>
            <span className="font-medium text-primary-700">5:00 PM - 9:30 PM</span>
          </div>
          <div className="flex justify-between w-48">
            <span>Sunday:</span>
            <span className="font-medium text-red-500">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHours;
