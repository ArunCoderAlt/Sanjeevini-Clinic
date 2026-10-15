import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';

const ContactInfo = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-primary-600 group-hover:text-white transition-colors text-primary-600">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">Clinic Address</h4>
          <a
            href={clinicInfo.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-primary-600 transition-colors block leading-relaxed"
          >
            Sanjeevini Siddha & Ayurveda Medical Centre<br />
            No. 22, Dr. Ambedkar Street,<br />
            Karaikal - 609602,<br />
            Puducherry (U.T.), India
          </a>
        </div>
      </div>

      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-primary-600 group-hover:text-white transition-colors text-primary-600">
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">Phone</h4>
          <a href="tel:+919443189498" className="text-gray-600 hover:text-primary-600 transition-colors inline-block mb-1">
            +91 94431 89498
          </a>
        </div>
      </div>

      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-primary-600 group-hover:text-white transition-colors text-primary-600">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">Email</h4>
          <a href="mailto:sanjeevinisiddha@gmail.com" className="text-gray-600 hover:text-primary-600 transition-colors">
            sanjeevinisiddha@gmail.com
          </a>
        </div>
      </div>

      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-[#25D366] group-hover:text-white transition-colors text-[#25D366]">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">WhatsApp</h4>
          <a
            href={getWhatsAppUrl(clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-[#25D366] transition-colors inline-block mb-1 font-medium"
          >
            Chat directly on WhatsApp
          </a>
          <p className="text-xs text-gray-500">+91 94431 89498 • Instant consultation inquiries</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
