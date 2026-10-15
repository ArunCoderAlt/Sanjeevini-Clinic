import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Phone, Mail, MessageCircle } from 'lucide-react';
import { navLinks } from '../../data/navigation';
import { clinicInfo } from '../../data/clinicInfo';
import Button from '../common/Button';
import { classNames, getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';

export default function MobileMenu({ isOpen, onClose, currentPath }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed inset-0 z-[60] bg-white flex flex-col"
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <span className="font-heading font-bold text-2xl text-primary">Sanjeevini</span>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-primary">
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
                "block text-lg py-2 font-medium",
                currentPath === link.path ? "text-primary" : "text-gray-700"
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
          className="pt-6 mt-6 border-t border-gray-100"
        >
          <Button 
            to="/contact#contact-form" 
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
            className="w-full justify-center"
          >
            Contact Us
          </Button>
        </motion.div>
      </div>

      <div className="p-6 bg-sage/30 mt-auto">
        <div className="space-y-3 text-sm text-gray-600">
          <a href={`tel:${clinicInfo.phone.replace(/\\s/g, '')}`} className="flex items-center">
            <Phone className="w-4 h-4 mr-3 text-primary" />
            {clinicInfo.phone}
          </a>
          <a href={`mailto:${clinicInfo.email}`} className="flex items-center">
            <Mail className="w-4 h-4 mr-3 text-primary" />
            {clinicInfo.email}
          </a>
          <a
            href={getWhatsAppUrl(clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#25D366] font-medium"
          >
            <MessageCircle className="w-4 h-4 mr-3 text-[#25D366]" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
