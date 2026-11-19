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
      className="mobile-nav-drawer fixed inset-0 z-[60] bg-[#081d35] bg-gradient-to-b from-[#081d35] via-[#0A223B] to-[#06172b] text-white flex flex-col h-full h-[100dvh]"
      aria-label="Mobile Navigation Menu"
    >
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#081d35]">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png?v=4" alt="Sanjeevini Siddha & Ayurveda Logo" className="h-11 w-auto object-contain rounded-full shadow-xs ring-2 ring-white/10" />
          <div className="flex flex-col">
            <span className="font-heading font-bold text-2xl text-white leading-none">Sanjeevini</span>
            <span className="text-[10px] font-medium text-[#93C5FD] tracking-wider mt-1">Since 2005</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-white hover:text-[#38BDF8] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/40" 
          aria-label="Close menu"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col space-y-3 bg-[#081d35]">
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
                "block text-lg py-2.5 px-3 rounded-lg transition-all text-white",
                currentPath === link.path 
                  ? "bg-white/15 font-bold border-l-4 border-white pl-4 opacity-100" 
                  : "opacity-85 hover:opacity-100 hover:bg-white/10 font-medium"
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
          className="pt-6 mt-4 border-t border-white/10"
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
            className="w-full justify-center bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white border border-[#38BDF8]/30 font-semibold py-3 shadow-md"
          >
            Contact Us
          </Button>
        </motion.div>
      </div>

      <div className="p-6 bg-[#04101e] border-t border-white/10 mt-auto">
        <div className="space-y-3 text-sm">
          <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="flex items-center text-white hover:text-[#38BDF8] font-medium transition-colors">
            <Phone className="w-4 h-4 mr-3 text-[#38BDF8] shrink-0" />
            <span className="text-white">{clinicInfo.phone}</span>
          </a>
          <a href={`mailto:${clinicInfo.email}`} className="flex items-center text-white hover:text-[#38BDF8] font-medium transition-colors">
            <Mail className="w-4 h-4 mr-3 text-[#38BDF8] shrink-0" />
            <span className="text-white">{clinicInfo.email}</span>
          </a>
          <a
            href={getWhatsAppUrl(clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#25D366] hover:text-[#4ade80] font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-3 text-[#25D366] shrink-0" />
            <span className="text-[#25D366] hover:text-[#4ade80]">Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
