import React from 'react';
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';
import Container from '../common/Container';

export default function TopBar() {
  return (
    <div className="bg-dark text-gray-300 py-2 text-sm hidden md:block">
      <Container className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="flex items-center hover:text-gold transition-colors">
            <Phone className="w-4 h-4 mr-2" />
            {clinicInfo.phone}
          </a>
          <a
            href={getWhatsAppUrl(clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-green-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-1.5 text-[#25D366]" />
            WhatsApp
          </a>
          <a href={`mailto:${clinicInfo.email}`} className="flex items-center hover:text-gold transition-colors">
            <Mail className="w-4 h-4 mr-2" />
            {clinicInfo.email}
          </a>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>{clinicInfo.hours}</span>
        </div>
      </Container>
    </div>
  );
}
