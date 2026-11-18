import { Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';
import Container from '../common/Container';

export default function TopBar() {
  return (
    <div className="bg-gradient-to-r from-[#E2EFF8] via-[#EAF4FB] to-[#E2EFF8] text-[#0C2B4B] py-2 text-xs md:text-sm font-medium hidden md:block border-b border-[#BEDCF0] shadow-xs">
      <Container className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <a 
            href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} 
            className="flex items-center text-[#0C2B4B] hover:text-[#1D4ED8] transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5 text-[#0369A1]" />
            {clinicInfo.phone}
          </a>
          <a
            href={getWhatsAppUrl(clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#0C2B4B] hover:text-[#16A34A] transition-colors font-medium"
          >
            <MessageCircle className="w-4 h-4 mr-1.5 text-[#16A34A]" />
            WhatsApp
          </a>
          <a 
            href={`mailto:${clinicInfo.email}`} 
            className="flex items-center text-[#0C2B4B] hover:text-[#1D4ED8] transition-colors font-medium"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5 text-[#0369A1]" />
            {clinicInfo.email}
          </a>
        </div>
        <div className="flex items-center text-[#0C2B4B] font-medium">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-[#0369A1]" />
          <span>{clinicInfo.hours}</span>
        </div>
      </Container>
    </div>
  );
}
