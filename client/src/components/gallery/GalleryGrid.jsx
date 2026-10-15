import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import GalleryLightbox from './GalleryLightbox';
import { getGallery } from '../../services/galleryService';

const GalleryGrid = ({ activeTab }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const triggerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const categoryParam = activeTab === 'All' ? undefined : activeTab.toLowerCase();
    getGallery(categoryParam)
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(item => ({
            id: item._id || item.id,
            src: item.image,
            category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Clinic',
            alt: item.title || item.description || 'Clinic photo'
          }));
          setImages(mapped);
        } else {
          setImages([]);
        }
      })
      .catch(() => {
        setImages([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab]);

  const filteredImages = images.filter(img => activeTab === 'All' || img.category.toLowerCase() === activeTab.toLowerCase());

  const openLightbox = (index, event) => {
    if (event && event.currentTarget) triggerRef.current = event.currentTarget;
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

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
      <div className="text-center py-20 mt-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/30 mb-5">
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-serif text-gray-600 mb-2">No Photos Yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Gallery images will appear here once they're uploaded by the clinic. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <AnimatePresence>
          {filteredImages.map((img, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              key={img.id || index}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-shadow"
              onClick={(e) => openLightbox(index, e)}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              {/* Category badge */}
              <div className="absolute top-3 left-3 z-10 bg-primary-700/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                {img.category}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary-700/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                <span className="text-white font-serif text-xl border border-white px-6 py-2 rounded-full mb-3">View</span>
                <p className="text-white/90 text-sm font-medium px-4 text-center line-clamp-2">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {lightboxOpen && filteredImages.length > 0 && (
        <GalleryLightbox
          images={filteredImages}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClose={() => { setLightboxOpen(false); setTimeout(() => triggerRef.current?.focus(), 0); }}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
};

export default GalleryGrid;
