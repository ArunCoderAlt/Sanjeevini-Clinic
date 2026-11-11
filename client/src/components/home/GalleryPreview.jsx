import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

// 100% Authentic Clinic Images provided and uploaded by user
const clinicGalleryImages = [
  {
    src: '/images/hero/slide-1.png',
    title: 'Rooted in Tradition, Focused on Health',
    category: 'Holistic Care',
    alt: 'Siddha and Ayurveda comprehensive care at Sanjeevini',
  },
  {
    src: '/images/hero/slide-2.png',
    title: 'Traditional Medicine & Personalized Wellness',
    category: 'Wellness',
    alt: 'Natural healing and wellness care at Sanjeevini',
  },
  {
    src: '/images/hero/slide-3.png',
    title: 'Consultation & Individualized Treatment Plans',
    category: 'Consultation',
    alt: 'Specialist Siddha and Ayurvedic consultation at Karaikal',
  },
  {
    src: '/images/hero/slide-4.png',
    title: 'Specialised Point Stimulation & Care',
    category: 'Specialized Care',
    alt: 'Traditional Siddha point stimulation and therapeutic care at Sanjeevini',
  },
  {
    src: '/images/hero/slide-5.png',
    title: 'Ayush Certified Traditional Formulations',
    category: 'Herbal Medicine',
    alt: 'Authentic Siddha & Ayurvedic medicines and herbs',
  },
  {
    src: '/images/about/samc-philosophy.jpg',
    title: 'Ancient Wisdom & SAMC Philosophy',
    category: 'Philosophy',
    alt: 'Sanjeevini SAMC healing emblem and philosophy',
  },
];

const GalleryPreview = () => {
  return (
    <section className="py-16 md:py-20 bg-white relative" id="home-gallery">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-sky-700 mb-2 block">
              Clinic Campus &amp; Care
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#0C2B4B] font-bold">
              Our Clinic &amp; Facilities
            </h2>
            <p className="text-gray-600 text-xs sm:text-base mt-2 max-w-xl">
              Explore authentic glimpses of Sanjeevini Siddha &amp; Ayurveda Medical Centre in Karaikal.
            </p>
          </div>
          <Button to="/gallery" variant="outline" className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full">
            <span>View Full Gallery</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* 6-item photo grid with authentic clinic assets - Clean inline display with no popup modals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {clinicGalleryImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-900 aspect-[16/10]"
            >
              <Link to="/gallery" className="block w-full h-full relative" aria-label={`View ${img.title} in gallery`}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <div className="absolute bottom-3 sm:bottom-4 left-3.5 sm:left-4 right-3.5 sm:right-4">
                  <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 sm:mb-1.5">
                    {img.category}
                  </span>
                  <h3 className="text-white text-sm sm:text-base font-serif font-bold leading-snug drop-shadow-sm">
                    {img.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button to="/gallery" variant="outline" className="px-8 py-3.5 shadow-sm text-sm font-medium">
            Explore All Photos &amp; Facility Tour →
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default GalleryPreview;