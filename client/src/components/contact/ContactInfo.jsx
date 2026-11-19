import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, Facebook } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';

// Dedicated Landline Desk Telephone Icon (Lucide style & Cross-Browser Optimized)
const LandlineIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    <path d="M20 3h-2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <path d="M16 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h11" />
    <path d="M12 8H6v3h6V8z" />
    <line x1="6.5" y1="15" x2="6.51" y2="15" strokeWidth="2.5" />
    <line x1="9.5" y1="15" x2="9.51" y2="15" strokeWidth="2.5" />
    <line x1="12.5" y1="15" x2="12.51" y2="15" strokeWidth="2.5" />
    <line x1="6.5" y1="18" x2="6.51" y2="18" strokeWidth="2.5" />
    <line x1="9.5" y1="18" x2="9.51" y2="18" strokeWidth="2.5" />
    <line x1="12.5" y1="18" x2="12.51" y2="18" strokeWidth="2.5" />
  </svg>
);

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
          <a
            href={clinicInfo.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-dark-blue-gradient font-semibold text-xs mt-2 transition-opacity group-hover:underline"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-primary-600 group-hover:text-white transition-colors text-primary-600">
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">Phone</h4>
          <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-primary-600 transition-colors inline-block mb-1">
            {clinicInfo.phone}
          </a>
        </div>
      </div>

      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-primary-600 group-hover:text-white transition-colors text-primary-600">
          <LandlineIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">Landline</h4>
          <a href={`tel:${clinicInfo.landline.replace(/\s/g, '')}`} className="text-gray-600 hover:text-primary-600 transition-colors inline-block mb-1 font-medium">
            {clinicInfo.landline}
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
          <p className="text-xs text-gray-500">+91 94868 38368 • Instant consultation inquiries</p>
        </div>
      </div>

      <div className="flex items-start group">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 mr-4 group-hover:bg-[#1877F2] group-hover:text-white transition-colors text-[#1877F2]">
          <Facebook className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-serif text-primary-700 mb-2">Facebook</h4>
          <a
            href={clinicInfo.socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-[#1877F2] transition-colors inline-block mb-1 font-medium"
          >
            facebook.com/sanjeevinisiddha
          </a>
          <p className="text-xs text-gray-500">Follow our official Facebook page for clinic news and health tips</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
