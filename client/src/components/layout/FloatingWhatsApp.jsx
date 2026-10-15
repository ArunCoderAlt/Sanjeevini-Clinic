import React from 'react';
import { clinicInfo } from '../../data/clinicInfo';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';

export default function FloatingWhatsApp() {
  const phone = clinicInfo.whatsapp || '919443189498';
  const whatsappUrl = getWhatsAppUrl(phone, DEFAULT_WHATSAPP_MESSAGE);

  return (
    <a
      href={whatsappUrl}
      onClick={(e) => handleWhatsAppClick(e, phone, DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20ba59] transition-all transform hover:scale-105 animate-pulse-glow group flex items-center justify-center cursor-pointer"
      aria-label="Chat directly on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat on WhatsApp
      </span>
    </a>
  );
}
