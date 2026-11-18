import { useState, useEffect, useRef } from 'react';
import { MapPin, ExternalLink, Navigation, Compass } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';

const GoogleMap = () => {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const embedUrl = clinicInfo.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.6012698626005!2d79.8311448!3d10.9178771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a55114c73bcb10f%3A0xa87a8127466e42ab!2sSanjeevini%20Siddha%20%26%20Ayurveda%20Medical%20centre!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin';
  const directMapUrl = clinicInfo.mapUrl || 'https://www.google.com/maps/place/Sanjeevini+Siddha+%26+Ayurveda+Medical+centre/@10.9169208,79.8304059,17.43z/data=!4m6!3m5!1s0x3a55114c73bcb10f:0xa87a8127466e42ab!8m2!3d10.9178718!4d79.8337197!16s%2Fg%2F1hf31q_pz';

  // Lazy-load the heavy Google Maps iframe only when the user scrolls near it (within 250px)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] md:min-h-[420px] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200"
    >
      {/* 1. Fast Placeholder Showcase & Fallback Card */}
      {!isIframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
          {/* Decorative Map Grid pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#144979 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="relative z-10 max-w-sm flex flex-col items-center">
            {/* Pulsing Pin */}
            <div className="relative mb-3">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-md">
                <MapPin className="w-7 h-7 text-red-600 animate-bounce" />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-red-400/40 rounded-full blur-xs" />
            </div>

            <h3 className="text-base font-bold text-[#0C2B4B] mb-1">
              {clinicInfo.name}
            </h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {clinicInfo.address}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={directMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#144979] text-white text-xs font-semibold shadow hover:bg-[#0C2B4B] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-300" />
                <span>Get Directions ↗</span>
              </a>

              {!shouldLoad && (
                <button
                  type="button"
                  onClick={() => setShouldLoad(true)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/90 text-slate-700 text-xs font-medium border border-slate-300 hover:bg-white shadow-xs transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Load Live Map</span>
                </button>
              )}
            </div>

            {shouldLoad && (
              <p className="text-[11px] text-gray-400 mt-3 animate-pulse">
                Loading interactive map...
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2. Interactive Google Maps Iframe (Mounted only when scrolled near) */}
      {shouldLoad && (
        <iframe
          title="Sanjeevini Siddha & Ayurveda Medical Centre, Karaikal"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsIframeLoaded(true)}
          className={`w-full h-full transition-opacity duration-500 ${
            isIframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default GoogleMap;
