import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Button from '../common/Button';
import Container from '../common/Container';

const heroSlides = [
  {
    src: '/images/hero/slide-1.png',
    alt: 'Sanjeevini Clinic Exterior',
    label: 'Exterior'
  },
  {
    src: '/images/hero/slide-2.png',
    alt: 'Sanjeevini Waiting Room',
    label: 'Waiting Room'
  },
  {
    src: '/images/hero/slide-3.png',
    alt: 'Sanjeevini Reception',
    label: 'Reception'
  },
  {
    src: '/images/hero/slide-4.png',
    alt: 'Doctor Consultation',
    label: 'Doctor Consultation'
  },
  {
    src: '/images/hero/slide-5.png',
    alt: 'Ayurveda Consultation',
    label: 'Ayurveda Consultation'
  },
  {
    src: '/images/hero/slide-6.png',
    alt: 'Ayurvedic Pharmacy',
    label: 'Pharmacy'
  },
  {
    src: '/images/hero/slide-7.png',
    alt: 'Herbal Dispensary',
    label: 'Dispensary'
  },
  {
    src: '/images/hero/slide-8.png',
    alt: 'Therapy Room',
    label: 'Therapy Room'
  }
];

const slideVariants = {
  enter: (dir) => ({
    x: dir >= 0 ? '100%' : '-100%',
    opacity: 0.85
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'tween', duration: 0.85, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.5 }
    }
  },
  exit: (dir) => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0.85,
    transition: {
      x: { type: 'tween', duration: 0.85, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.5 }
    }
  })
};

const HeroSection = () => {
  const textRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Preload all 8 slide images
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  // Automatic slideshow with 4 seconds interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const goToSlide = (index) => {
    setDirection(index >= currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

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
    tl.fromTo(
      textRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    );
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-20 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slideshow (Images 1 to 8, sliding left-to-right at 4s intervals) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${heroSlides[currentSlide].src})`,
              backgroundPosition: 'center 30%'
            }}
          />
        </AnimatePresence>
      </div>

      {/* Neutral dark semi-transparent overlay with gentle left gradient for optimal text contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35 z-[2]"
        aria-hidden="true"
      />

      {/* Content */}
      <Container className="relative z-10 w-full py-12">
        <div className="max-w-2xl text-left" ref={textRef}>
          <span className="block text-[#E5A93C] font-medium tracking-wider md:tracking-[0.2em] text-xs md:text-[13px] mb-3.5 uppercase">
            Sanjeevini Sidhha and Ayurvedha Medical Center
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif text-white leading-[1.2] mb-3 drop-shadow-lg">
            Natural Healing.<br />Personalized Care.
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 mb-3 drop-shadow">
            Rooted in Tradition. Focused on New.
          </p>
          <p className="text-white/90 text-sm md:text-base mb-7 max-w-lg font-light drop-shadow-md leading-relaxed">
            Experience the timeless traditions of Siddha and Ayurveda with care tailored to your individual wellness journey.
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

      {/* Manual Navigation Arrows (appear on hover) */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/45 hover:bg-black/75 text-white/80 hover:text-white items-center justify-center transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer border border-white/15 shadow-lg"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/45 hover:bg-black/75 text-white/80 hover:text-white items-center justify-center transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer border border-white/15 shadow-lg"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators (1 to 8) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/45 px-3.5 py-1.5 rounded-full backdrop-blur-sm border border-white/15 shadow-md">
        {heroSlides.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}: ${slide.label}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-7 h-2 bg-gold shadow-sm'
                : 'w-2 h-2 bg-white/45 hover:bg-white/80'
            }`}
          />
        ))}
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
