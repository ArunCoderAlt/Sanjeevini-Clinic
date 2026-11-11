import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { getGallery } from '../../services/galleryService';

const isMockImage = (url) => {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('unsplash.com') ||
    lower.includes('placeholder') ||
    lower.includes('consultation.jpg') ||
    lower.includes('varmam.jpg') ||
    lower.includes('thokkanam.jpg') ||
    lower.includes('herbs.jpg') ||
    lower.includes('digestive.jpg') ||
    lower.includes('skin.jpg') ||
    lower.includes('clinic-front.jpg') ||
    lower.includes('front-image.jpg')
  );
};

// 100% Authentic clinic gallery assets uploaded/provided by user
const authenticDefaultGallery = [
  { id: 'g-1', src: '/images/hero/slide-1.png', category: 'Clinic', alt: 'Sanjeevini Siddha & Ayurveda Medical Centre' },
  { id: 'g-2', src: '/images/hero/slide-2.png', category: 'Clinic', alt: 'Holistic Siddha Healthcare & Natural Wellness' },
  { id: 'g-3', src: '/images/hero/slide-3.png', category: 'Facility', alt: 'Specialist Clinical Consultation & Diagnosis' },
  { id: 'g-4', src: '/images/hero/slide-4.png', category: 'Treatment', alt: 'Traditional Siddha & Ayurveda Point Stimulation' },
  { id: 'g-5', src: '/images/hero/slide-5.png', category: 'Treatment', alt: 'Ayush Certified Traditional Medicines' },
  { id: 'g-6', src: '/images/hero/slide-6.png', category: 'Treatment', alt: 'Traditional Herbal Preparations & Care' },
  { id: 'g-7', src: '/images/about/samc-philosophy.jpg', category: 'Philosophy', alt: 'SAMC Philosophy Emblem' },
  { id: 'g-8', src: '/images/about/clinic-building.jpg', category: 'Clinic', alt: 'Sanjeevini Clinic Campus' },
];

const GalleryGrid = ({ activeTab }) => {
  const [images, setImages] = useState(authenticDefaultGallery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const categoryParam = activeTab === 'All' ? undefined : activeTab.toLowerCase();
    getGallery(categoryParam)
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          // Filter out any mock/stock AI images
          const validRealImages = data
            .filter((item) => item.image && !isMockImage(item.image))
            .map((item) => ({
              id: item._id || item.id,
              src: item.image,
              category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Clinic',
              alt: item.title || item.description || 'Clinic photo'
            }));

          if (validRealImages.length > 0) {
            setImages(validRealImages);
          } else {
            setImages(authenticDefaultGallery);
          }
        } else {
          setImages(authenticDefaultGallery);
        }
      })
      .catch(() => {
        setImages(authenticDefaultGallery);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab]);

  const filteredImages = images.filter(
    (img) => activeTab === 'All' || img.category.toLowerCase() === activeTab.toLowerCase()
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-sage/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-20 mt-12 bg-white rounded-3xl border border-slate-200 p-8">
        <ImageOff className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-serif text-slate-700 mb-2">No photos in this category</h3>
        <p className="text-slate-500 text-sm">Photos will appear here as clinic updates are posted.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-8 sm:mt-12">
      {filteredImages.map((image, index) => (
        <motion.div
          key={image.id || index}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <img
            src={image.src}
            alt={image.alt || 'Clinic facility'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5">
            <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 w-fit">
              {image.category}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium drop-shadow-sm line-clamp-2">{image.alt}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GalleryGrid;