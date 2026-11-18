import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Phone, Mail, MessageCircle } from 'lucide-react';
import { navLinks } from '../../data/navigation';
import { clinicInfo } from '../../data/clinicInfo';
import Button from '../common/Button';
import { classNames, getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';

export default function MobileMenu({ isOpen, onClose, currentPath }) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: "tween", duration: 0.3 }}
      className="mobile-nav-drawer fixed inset-0 z-[60] bg-gradient-to-b from-[#081d35] via-[#0A223B] to-[#06172b] text-white flex flex-col no-bg-pattern"
      aria-label="Mobile Navigation Menu"
    >
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png?v=4" alt="Sanjeevini Siddha & Ayurveda Logo" className="h-11 w-auto object-contain rounded-full shadow-xs ring-2 ring-white/10" />
          <div className="flex flex-col">
            <span className="font-heading font-bold text-2xl text-white leading-none">Sanjeevini</span>
            <span className="text-[10px] font-medium text-[#93C5FD] tracking-wider mt-1">Since 2005</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/80 hover:text-white" aria-label="Close menu">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col space-y-4">
        {navLinks.map((link, i) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              to={link.path}
              onClick={onClose}
              className={classNames(
                "block text-lg py-2 font-medium transition-colors",
                currentPath === link.path ? "text-[#38BDF8] font-semibold" : "text-white/85 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          </motion.div>
        ))}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-6 mt-6 border-t border-white/10"
        >
          <Button 
            to="/contact" 
            onClick={(e) => {
              onClose();
              if (currentPath === '/contact') {
                if (e && e.preventDefault) e.preventDefault();
                setTimeout(() => {
                  const formEl = document.getElementById('contact-form') || document.querySelector('form');
                  if (formEl) {
                    formEl.scrollIntoView({ behavior: 'smooth' });
                    const input = formEl.querySelector('input');
                    if (input) input.focus();
                  }
                }, 150);
              }
            }} 
            className="w-full justify-center bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white border border-[#38BDF8]/30 font-semibold"
          >
            Contact Us
          </Button>
        </motion.div>
      </div>

      <div className="p-6 bg-[#04101e] border-t border-white/10 mt-auto">
        <div className="space-y-3 text-sm text-gray-300">
          <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="flex items-center hover:text-white">
            <Phone className="w-4 h-4 mr-3 text-[#38BDF8]" />
            {clinicInfo.phone}
          </a>
          <a href={`mailto:${clinicInfo.email}`} className="flex items-center hover:text-white">
            <Mail className="w-4 h-4 mr-3 text-[#38BDF8]" />
            {clinicInfo.email}
          </a>
          <a
            href={getWhatsAppUrl(clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#25D366] hover:text-[#4ade80] font-medium"
          >
            <MessageCircle className="w-4 h-4 mr-3 text-[#25D366]" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
