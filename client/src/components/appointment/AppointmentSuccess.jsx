import React from 'react';
import { motion } from 'framer-motion';
import { Check, MessageCircle } from 'lucide-react';
import Button from '../common/Button';
import { clinicInfo } from '../../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick } from '../../utils/helpers';

const AppointmentSuccess = ({ appointment, onReset }) => {
  return (
    <div className="text-center py-12 px-4">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-sage rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <Check className="w-12 h-12 text-primary-600" />
      </motion.div>
      <h3 className="text-3xl font-serif text-primary-700 mb-4">Request Confirmed!</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
        Thank you, {appointment?.name || 'patient'}. Your appointment request for <span className="font-semibold">{appointment?.service || 'consultation'}</span> has been received.
      </p>
      <div className="bg-cream p-6 rounded-2xl max-w-md mx-auto mb-8 text-left border border-sage">
        <h4 className="font-medium text-primary-700 border-b border-sage/50 pb-2 mb-4">Appointment Summary</h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between"><span>Date:</span> <span className="font-medium">{appointment?.preferredDate || 'Pending'}</span></div>
          <div className="flex justify-between"><span>Time:</span> <span className="font-medium">{appointment?.preferredTime || 'Pending'}</span></div>
          <div className="flex justify-between"><span>Status:</span> <span className="text-gold font-medium">Pending Confirmation</span></div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
        Our clinic staff will call you at {appointment?.phone} shortly to confirm the exact time slot.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={getWhatsAppUrl(clinicInfo.whatsapp, `Hello Sanjeevini Clinic, I have submitted an appointment request for ${appointment?.name || 'patient'} (${appointment?.service || 'Consultation'}) on ${appointment?.preferredDate || ''} at ${appointment?.preferredTime || ''}.`)}
          onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, `Hello Sanjeevini Clinic, I have submitted an appointment request for ${appointment?.name || 'patient'} (${appointment?.service || 'Consultation'}) on ${appointment?.preferredDate || ''} at ${appointment?.preferredTime || ''}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3 rounded-xl text-base font-medium transition-colors shadow-md w-full sm:w-auto"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Quick Confirm on WhatsApp
        </a>
        {onReset && (
          <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentSuccess;
