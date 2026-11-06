import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Eye } from 'lucide-react';
import Container from '../common/Container';
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
    src: '/images/treatments/digestive.jpg',
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
    <section className="py-16 md:py-20 bg-white relative" id="home-gallery">
      <Container>
        {/* Aligned Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicGalleryImages.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => openLightbox(idx)}
              className="aspect-[4/3] rounded-2xl overflow-hidden relative group shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-sage/60 bg-gray-100"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Hover Overlay with Expand Icon */}
              <div className="absolute inset-0 bg-primary-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/95 text-primary-700 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
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
