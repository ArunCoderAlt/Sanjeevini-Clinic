import { useState, useEffect } from 'react';
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    }
  };

  return (
    <>
      <nav className={classNames(
        "sticky top-0 z-50 transition-all duration-300 navbar-dark-blue",
        scrolled ? "bg-[#081d35] shadow-lg py-3" : "bg-[#081d35] py-4"
      )}>
        <Container className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/images/logo.png?v=4" 
              alt="Sanjeevini Siddha & Ayurveda Logo" 
              decoding="async" 
              className="h-11 sm:h-12 w-auto object-contain rounded-full shadow-xs ring-2 ring-white/10 group-hover:ring-[#38BDF8]/50 transition-all" 
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl sm:text-2xl text-white tracking-wide leading-none">Sanjeevini</span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#93C5FD] tracking-wider mt-1">Since 2005</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-7">
            <div className="flex space-x-3.5 xl:space-x-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={classNames(
                    "text-xs xl:text-sm transition-all whitespace-nowrap py-1 text-white",
                    location.pathname === link.path 
                      ? "border-b-2 border-white font-bold opacity-100" 
                      : "opacity-85 hover:opacity-100 font-medium"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="nav-button-container">
              <Button 
                to="/contact" 
                onClick={handleContactClick} 
                variant="gold" 
                size="sm"
                className="bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white border border-[#38BDF8]/30 shadow-md font-semibold px-5 py-2 text-xs xl:text-sm"
              >
                Contact Us
              </Button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white hover:text-[#38BDF8] p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/40 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6 text-white" />
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
