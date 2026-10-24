import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import Button from '../common/Button';
import Container from '../common/Container';

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
    <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-20">
      {/* Full-background clinic image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/front-image.jpg)', backgroundPosition: 'center 25%' }}
        aria-hidden="true"
      />

      {/* Neutral dark semi-transparent overlay with gentle left gradient for optimal text contrast (no blue tint on photo) */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25"
        aria-hidden="true"
      />

      {/* Content */}
      <Container className="relative z-10 w-full py-12">
        <div className="max-w-2xl text-left" ref={textRef}>
          <span className="block text-[#E5A93C] font-medium tracking-[0.25em] text-xs md:text-sm mb-4 uppercase">
            TRADITIONAL WISDOM • MODERN CARE
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-[70px] font-serif text-white leading-[1.15] mb-5 drop-shadow-lg">
            Natural Healing.<br />Personalized Care.
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-8 max-w-xl font-light drop-shadow-md leading-relaxed">
            Experience Siddha & Ayurveda care designed around your individual wellness journey.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4">
            <Button to="/contact#contact-form" variant="primary" className="w-full sm:w-auto text-base py-2.5 px-7 shadow-lg">
              Contact Us
            </Button>
            <Button to="/treatments" variant="outline" className="w-full sm:w-auto text-base py-2.5 px-7 text-white border-white hover:bg-white/10 shadow-lg">
              Explore Treatments
            </Button>
          </div>
        </div>
      </Container>

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
