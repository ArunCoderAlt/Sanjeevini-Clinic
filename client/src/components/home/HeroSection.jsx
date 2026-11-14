import React, { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import Button from '../common/Button';

const HeroSection = () => {
  const textRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Slower, calm, cinematic playback speed (0.7x)
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      if (textRef.current) {
        Array.from(textRef.current.children).forEach((el) => {
          el.style.transform = 'none';
          el.style.opacity = '1';
        });
      }
      return () => {};
    }

    if (textRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        textRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.18, ease: 'power3.out' }
      );
      return () => {
        tl.kill();
      };
    }
  }, []);

  return (
    <section
      className="relative min-h-[92vh] sm:min-h-screen flex items-center overflow-hidden pt-24 pb-16 sm:py-20"
      id="hero"
    >
      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero/slide-1.png"
          onLoadedMetadata={() => {
            if (videoRef.current) videoRef.current.playbackRate = 0.7;
          }}
          onCanPlay={() => {
            if (videoRef.current) videoRef.current.playbackRate = 0.7;
          }}
          className="w-full h-full object-cover object-center"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dual Gradient Overlay: Optimised for crisp legibility on both Mobile & Desktop */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/75 via-black/40 to-black/60 sm:bg-gradient-to-r sm:from-black/65 sm:via-black/35 sm:to-black/10"
        aria-hidden="true"
      />

      {/* Hero Content Container - Aligned left for modern look and optimal mobile responsiveness */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 xl:px-20">
        <div className="max-w-xl lg:max-w-2xl text-left" ref={textRef}>
          <span className="block text-[#E5A93C] font-semibold tracking-wider md:tracking-[0.2em] text-xs sm:text-[13px] mb-3 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
            Sanjeevini Siddha and Ayurveda Medical Center
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif text-white leading-[1.2] mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Rooted in Tradition.<br />Focused on New.
          </h1>
          <p className="text-white text-sm sm:text-base mb-7 max-w-lg font-normal drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] leading-relaxed">
            Experience the timeless traditions of Siddha and Ayurveda with care tailored to your individual wellness journey.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3.5 sm:gap-4 w-full sm:w-auto">
            <Button
              to="/contact#contact-form"
              variant="primary"
              className="w-full sm:w-auto text-base py-3 sm:py-2.5 px-7 shadow-xl text-center flex items-center justify-center font-medium"
            >
              Contact Us
            </Button>
            <Button
              to="/treatments"
              variant="outline"
              className="w-full sm:w-auto text-base py-3 sm:py-2.5 px-7 text-white border-white bg-black/30 hover:bg-white/20 backdrop-blur-sm shadow-xl text-center flex items-center justify-center font-medium"
            >
              Explore Treatments
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll to content arrow */}
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        aria-label="Scroll to content"
        className="hidden lg:block absolute bottom-6 right-8 z-20 text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none"
      >
        <ChevronDown className="w-7 h-7 animate-bounce" />
      </button>
    </section>
  );
};

export default HeroSection;
