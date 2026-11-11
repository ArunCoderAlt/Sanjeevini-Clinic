import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../common/Container';
import Button from '../common/Button';
import MobileMenu from './MobileMenu';
import { navLinks } from '../../data/navigation';
import { classNames } from '../../utils/helpers';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactClick = (e) => {
    if (location.pathname === '/contact') {
      if (e && e.preventDefault) e.preventDefault();
      const formEl = document.getElementById('contact-form') || document.querySelector('form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        const nameInput = formEl.querySelector('input[name="name"]') || formEl.querySelector('input');
        if (nameInput) nameInput.focus();
        // Visual indicator glow
        formEl.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => formEl.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 1200);
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    } else {
      navigate('/contact#contact-form');
    }
  };

  return (
    <>
      <nav className={classNames(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-white py-5"
      )}>
        <Container className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png?v=4" alt="Sanjeevini Siddha & Ayurveda Logo" className="h-11 sm:h-12 w-auto object-contain rounded-full shadow-xs" />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl sm:text-2xl text-[#0C2B4B] leading-none">Sanjeevini</span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#475E75] tracking-wider mt-1">Since 2005</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={classNames(
                    "text-sm font-medium transition-colors hover:text-[#0C2B4B]",
                    location.pathname === link.path ? "text-[#0C2B4B] border-b-2 border-[#0C2B4B] font-semibold" : "text-[#243B52]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <Button 
              to="/contact#contact-form" 
              onClick={handleContactClick} 
              variant="primary" 
              size="sm"
            >
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-dark p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </Container>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)} 
            currentPath={location.pathname} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
