import React from 'react';
import { Phone, Mail, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clinicInfo } from '../../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick, DEFAULT_WHATSAPP_MESSAGE } from '../../utils/helpers';
import Container from '../common/Container';
import { useAuth } from '../../hooks/useAuth';

export default function TopBar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-r from-[#07192C] via-[#0A223B] to-[#07192C] text-gray-200 py-2 text-sm hidden md:block border-b border-[#143B5C]/40">
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
            className="flex items-center hover:text-[#38BDF8] transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-1.5 text-[#25D366]" />
            WhatsApp
          </a>
          <a href={`mailto:${clinicInfo.email}`} className="flex items-center hover:text-gold transition-colors">
            <Mail className="w-4 h-4 mr-2" />
            {clinicInfo.email}
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{clinicInfo.hours}</span>
          </div>

          {/* Persistent Admin Session Indicator on Public Website */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 pl-4 border-l border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Admin Session Active & Real-Time Sync Online" />
              <span className="text-xs text-sky-200 font-medium">
                Admin: {user?.name || 'Administrator'}
              </span>
              <Link
                to="/admin"
                className="text-xs bg-sky-500/20 hover:bg-sky-500/40 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                title="Go to Admin Portal"
              >
                <ShieldCheck size={12} className="text-emerald-300" />
                <span>Portal</span>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
