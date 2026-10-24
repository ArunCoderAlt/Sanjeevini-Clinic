import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Phone, Mail, Clock, Youtube, Instagram } from 'lucide-react';
import Container from '../common/Container';
import { clinicInfo } from '../../data/clinicInfo';
import { footerLinks } from '../../data/navigation';

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-white">
              <Leaf className="w-8 h-8 text-gold" />
              <span className="font-heading font-bold text-2xl">Sanjeevini</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Experience the ancient wisdom of Siddha and Ayurveda for holistic healing and wellness.
            </p>
            <div className="flex space-x-4">
              <a href={clinicInfo.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
                𝕏
              </a>
              <a href={clinicInfo.socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube channel @SanjeeviniSiddha" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-red-500">
                <Youtube className="w-5 h-5" />
              </a>
              <a href={clinicInfo.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram @sanjeevinisiddha" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all text-pink-400">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-gold transition-colors text-sm">
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
              <li><Link to="/services/varmam-therapy" className="hover:text-gold transition-colors">Varmam Therapy</Link></li>
              <li><Link to="/services/thokkanam-therapy" className="hover:text-gold transition-colors">Thokkanam Therapy</Link></li>
              <li><Link to="/services/wellness-support" className="hover:text-gold transition-colors">Wellness Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xl mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-gold mr-3 shrink-0 mt-0.5" />
                <a href={clinicInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  {clinicInfo.address}
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-gold mr-3 shrink-0" />
                <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="hover:text-gold">{clinicInfo.phone}</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-gold mr-3 shrink-0" />
                <a href={`mailto:${clinicInfo.email}`} className="hover:text-gold">{clinicInfo.email}</a>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-gold mr-3 shrink-0 mt-0.5" />
                <span>{clinicInfo.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Sanjeevini Siddha & Ayurveda Medical Centre. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
