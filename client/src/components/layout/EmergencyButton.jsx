import React from 'react';
import { Phone } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';

export default function EmergencyButton() {
  return (
    <a
      href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`}
      className="md:hidden fixed bottom-6 left-6 z-40 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-light transition-colors"
      aria-label="Call clinic"
    >
      <Phone className="w-6 h-6" />
    </a>
  );
}
