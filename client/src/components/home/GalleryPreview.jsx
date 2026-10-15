import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronRight, Eye, ChevronLeft } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import GalleryLightbox from '../gallery/GalleryLightbox';

const clinicGalleryImages = [
  {
    src: '/images/gallery/clinic-front.jpg',
    title: 'Sanjeevini Clinic Front & Campus',
    category: 'Hospital Facility',
    alt: 'Sanjeevini Siddha & Ayurveda Medical Centre front exterior in Karaikal',
  },
  {
    src: '/images/services/consultation.jpg',
    title: 'Dr. Thiagarajan Nadi Parikshai Pulse Diagnosis',
    category: 'Consultation',
    alt: 'Traditional Siddha pulse examination at Sanjeevini',
  },
  {
    src: '/images/services/varmam.jpg',
    title: 'Varmam Vital Point Therapeutic Stimulation',
    category: 'Specialized Therapy',
    alt: 'Siddha Varmam treatment for neuromuscular rehabilitation',
  },
  {
    src: '/images/about/herbs.jpg',
    title: 'Authentic Herbal Pharmacy & Choornams',
    category: 'In-house Pharmacy',
    alt: 'Natural herbs, oils, and formulations prepared by experts',
  },
  {
    src: '/images/services/thokkanam.jpg',
    title: 'Traditional Thokkanam Body Therapy',
    category: 'Body Therapy',
    alt: 'Therapeutic Siddha body massage and steam treatment',
  },
  {
    src: '/images/treatments/gastro.jpg',
    title: 'Inpatient Care & Panchakarma Recovery Room',
    category: 'Patient Rooms',
    alt: 'Calm healing recovery rooms at Sanjeevini Hospital',
  },
];

const GalleryPreview = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (idx) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <section className="py-24 bg-white relative" id="home-gallery">
      <Container>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-sm">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-wide uppercase text-primary">
              Clinic Photo Tour
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif text-primary-700 font-bold mb-3">
            Life at Sanjeevini Clinic
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Take a visual tour through our hospital campus, dedicated therapy suites, in-house herbal pharmacy, and consultation rooms in Karaikal.
          </p>
        </div>

        {/* Horizontal Scroll Gallery Grid */}
        <div className="relative">
          <div
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 -mx-4 px-4 md:-mx-8 md:px-8 gallery-scroll-container"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {clinicGalleryImages.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => openLightbox(idx)}
                className="snap-start shrink-0 w-[82vw] sm:w-[48vw] md:w-[32vw] lg:w-[23vw] aspect-square rounded-2xl overflow-hidden relative group shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-sage/60"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <span className="inline-block text-[11px] font-bold text-gold uppercase tracking-wider mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-serif font-medium line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-white/70 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Click to expand</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll Nav buttons */}
          <button
            onClick={() => {
              const c = document.querySelector('.gallery-scroll-container');
              if (c) c.scrollBy({ left: -340, behavior: 'smooth' });
            }}
            aria-label="Previous image"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-xl text-primary-700 hover:bg-primary-700 hover:text-white transition-all items-center justify-center border border-sage cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const c = document.querySelector('.gallery-scroll-container');
              if (c) c.scrollBy({ left: 340, behavior: 'smooth' });
            }}
            aria-label="Next image"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-xl text-primary-700 hover:bg-primary-700 hover:text-white transition-all items-center justify-center border border-sage cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View Full Gallery CTA */}
        <div className="flex items-center justify-center mt-10">
          <Button to="/gallery" variant="outline" className="px-8 py-3.5 shadow-sm text-sm font-medium">
            <span>Explore Full Clinic Photo Gallery</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Container>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <GalleryLightbox
          images={clinicGalleryImages}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
};

export default GalleryPreview;
