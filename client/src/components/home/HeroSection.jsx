import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import Button from '../common/Button';

const HeroSection = () => {
  const textRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      if (textRef.current) {
        textRef.current.children[0].style.transform = 'none';
        textRef.current.children[0].style.opacity = '1';
      }
      return () => {};
    }
    const tl = gsap.timeline();
    tl.fromTo(textRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Full-background clinic image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/front-image.jpg)', backgroundPosition: 'center 25%' }}
        aria-hidden="true"
      />

      {/* Warm semi-transparent overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(60, 45, 30, 0.55)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto" ref={textRef}>
        <span className="block text-[#C9A227] font-medium tracking-[0.25em] text-sm md:text-base mb-6 uppercase">TRADITIONAL WISDOM • MODERN CARE</span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] mb-6 drop-shadow-lg">
          Natural Healing.<br />Personalized Care.
        </h1>
        <p className="text-[#F5F0DD] text-lg md:text-2xl mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
          Experience Siddha & Ayurveda care designed around your individual wellness journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/contact#contact-form" variant="primary" className="w-full sm:w-auto text-lg py-3 px-8 shadow-lg">
            Contact Us
          </Button>
          <Button to="/treatments" variant="outline" className="w-full sm:w-auto text-lg py-3 px-8 text-white border-white hover:bg-white/10 shadow-lg">
            Explore Treatments
          </Button>
        </div>
      </div>

      <button 
        onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        aria-label="Scroll to content"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10 cursor-pointer focus:outline-none"
      >
        <ChevronDown className="text-white/70 hover:text-white transition-colors w-8 h-8" />
      </button>
    </section>
  );
};

export default HeroSection;
