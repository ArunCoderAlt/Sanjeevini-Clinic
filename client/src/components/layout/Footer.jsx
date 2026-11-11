import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Phone, Mail, Clock, Youtube, Instagram, Facebook } from 'lucide-react';
import Container from '../common/Container';
import { clinicInfo } from '../../data/clinicInfo';
import { footerLinks } from '../../data/navigation';

export default function Footer() {
  return (
    <footer className="footer-dark-gradient bg-gradient-to-b from-[#091C2E] via-[#061524] to-[#020910] text-[#CADBE9] pt-16 pb-8 border-t border-[#143B5C]/40 relative z-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 text-white">
              <img src="/images/logo.png?v=4" alt="Sanjeevini Logo" className="w-10 h-10 rounded-full bg-white p-1 object-contain shadow-sm shrink-0" />
              <span className="font-heading font-bold text-2xl text-white">Sanjeevini</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#B5CCE0]">
              Experience the ancient wisdom of Siddha and Ayurveda for holistic healing and wellness.
            </p>
            <div className="flex space-x-3.5">
              <a
                href={clinicInfo.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram @sanjeevinisiddha"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all text-pink-400 shadow-sm"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={clinicInfo.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube channel @SanjeeviniSiddha"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-red-500 shadow-sm"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={clinicInfo.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook @sanjeevinisiddha"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors text-blue-400 shadow-sm"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={clinicInfo.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X (formerly Twitter)"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 hover:text-white transition-colors text-gray-300 font-bold text-sm shadow-sm"
              >
                𝕏
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xl mb-6">Services</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/services/varmam-therapy" className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors">Varmam Therapy</Link></li>
              <li><Link to="/services/thokkanam-therapy" className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors">Thokkanam Therapy</Link></li>
              <li><Link to="/services/wellness-support" className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors">Wellness Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xl mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-[#38BDF8] mr-3 shrink-0 mt-0.5" />
                <a href={clinicInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors">
                  {clinicInfo.address}
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-[#38BDF8] mr-3 shrink-0" />
                <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors">{clinicInfo.phone}</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-[#38BDF8] mr-3 shrink-0" />
                <a href={`mailto:${clinicInfo.email}`} className="text-[#CADBE9] hover:text-[#38BDF8] transition-colors">{clinicInfo.email}</a>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-[#38BDF8] mr-3 shrink-0 mt-0.5" />
                <span className="text-[#CADBE9]">{clinicInfo.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#8BA4BD]">
          <p>&copy; {new Date().getFullYear()} Sanjeevini Siddha & Ayurveda Medical Centre. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-[#8BA4BD] hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[#8BA4BD] hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
