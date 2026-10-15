import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const GalleryLightbox = ({ images, currentIndex, setCurrentIndex, onClose, triggerRef }) => {
  const closeRef = React.useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (triggerRef?.current) triggerRef.current.focus();
    };
  }, [images.length, onClose, setCurrentIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <button ref={closeRef} aria-label="Close lightbox" onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full">
        <X className="w-8 h-8" />
      </button>
      
      <button aria-label="Previous image"
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <div className="max-w-5xl max-h-[80vh]">
        <img 
          src={images[currentIndex].src} 
          alt={images[currentIndex].alt} 
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        <p className="text-white text-center mt-4 font-serif text-xl">{images[currentIndex].alt}</p>
      </div>

      <button aria-label="Next image"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
};

export default GalleryLightbox;
