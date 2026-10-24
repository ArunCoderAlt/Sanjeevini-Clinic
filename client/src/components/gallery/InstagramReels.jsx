import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import {
  Instagram,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';
import { getReels } from '../../services/reelService';
import { defaultClinicReels } from '../home/InstagramSection';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GalleryReelCard = ({ reel, isFirstItem, onOpenModal }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(parseInt(reel.likes) || 2400);
  const [copied, setCopied] = useState(false);

  const togglePlay = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(reel.instagramUrl || clinicInfo.socialLinks.instagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group h-full select-none">
      <div className="relative bg-neutral-950 rounded-2xl overflow-hidden shadow-xl h-full border border-white/10 transition-all duration-300 group-hover:shadow-2xl group-hover:border-gold/40">
        {/* 9:16 Vertical Reel Aspect */}
        <div className="relative aspect-[9/16] min-h-[460px] max-h-[520px] overflow-hidden bg-neutral-900">
          {/* Autoplaying Video */}
          {isPlaying ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${reel.videoId}?autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&loop=1&playlist=${reel.videoId}&start=${
                  reel.start || 0
                }&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                title={reel.title}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340%] h-[120%] max-w-none pointer-events-none object-cover"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full">
              <img
                src={reel.thumbnail || `https://i.ytimg.com/vi/${reel.videoId}/hq720.jpg`}
                alt={reel.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          )}

          {/* Vignette Overlay for readable text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/40 pointer-events-none" />

          {/* Top Bar: Reel badge & sound control */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href={reel.instagramUrl || clinicInfo.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white transition-all cursor-pointer"
                title="Open profile on Instagram"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
                  <Instagram className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide">Reels</span>
              </a>

              {isFirstItem && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Latest</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(reel);
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
                title="Watch full size"
                aria-label="Expand reel"
              >
                <Maximize2 className="w-3.5 h-3.5 text-white/90" />
              </button>
            </div>
          </div>

          {/* Right Floating Actions */}
          <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-2.5">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-0.5 cursor-pointer"
              aria-label="Like reel"
            >
              <div
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                  isLiked
                    ? 'bg-rose-500/90 border-rose-400 scale-110'
                    : 'bg-black/60 hover:bg-black/80 border-white/15'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? 'text-white fill-white' : 'text-white'}`}
                />
              </div>
              <span className="text-[10px] font-medium text-white/90 drop-shadow">
                {isLiked ? (likeCount / 1000).toFixed(1) + 'K' : reel.likes}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-0.5 cursor-pointer"
              title="Copy Instagram link"
              aria-label="Share reel"
            >
              <div className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all">
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-[10px] font-medium text-white/90 drop-shadow">
                {copied ? 'Copied' : 'Share'}
              </span>
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause reel' : 'Play reel'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
              )}
            </button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px] flex-shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Sanjeevini"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span className="text-white text-xs font-semibold drop-shadow">
                @sanjeevinisiddha
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-gold mb-1">
              {reel.tag}
            </span>

            <h4 className="text-white font-serif text-sm md:text-base font-medium leading-snug line-clamp-2 drop-shadow-md">
              {reel.title}
            </h4>

            <p className="text-white/80 text-[11px] line-clamp-2 mt-1 leading-relaxed drop-shadow">
              {reel.desc}
            </p>

            <a
              href={reel.instagramUrl || clinicInfo.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 transition-all hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram className="w-3 h-3 text-pink-400" />
              <span>Watch on Instagram</span>
              <ExternalLink className="w-2.5 h-2.5 text-white/70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstagramReels = () => {
  const [reels, setReels] = useState(defaultClinicReels);
  const [selectedModalReel, setSelectedModalReel] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAllReels = async () => {
      try {
        const res = await getReels();
        const items = res.data?.data;
        if (Array.isArray(items) && items.length > 0 && isMounted) {
          setReels(items);
        }
      } catch (err) {
        // Fallback remains active
      }
    };

    fetchAllReels();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative">
      {/* Section Header with Elevated Navigation Pill (Zero Overlap with Videos) */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-[#833ab4]/20 mb-4 shadow-sm">
            <Instagram className="w-4.5 h-4.5 text-[#E1306C]" />
            <span className="text-sm font-semibold bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-clip-text text-transparent">
              @sanjeevinisiddha
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-primary-700 font-bold mb-3">
            Trending Instagram Reels
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Watch continuous clinical demonstrations, authentic Siddha medicine preparations, pulse diagnosis, and daily wellness tips from Dr. Thiagarajan.
          </p>
        </div>

        {/* Clean Header Navigation Controls - ZERO overlap on video cards! */}
        <div className="flex items-center gap-3 self-start md:self-end flex-shrink-0">
          <span className="text-xs font-medium text-gray-500 hidden sm:inline-block">
            {reels.length} {reels.length === 1 ? 'Reel' : 'Reels'} Total
          </span>
          <div className="flex items-center gap-2">
            <button
              className="gallery-reels-prev w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-primary-700 hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all duration-200 cursor-pointer disabled:opacity-40"
              aria-label="Previous reel"
              title="Previous reel"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="gallery-reels-next w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-primary-700 hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all duration-200 cursor-pointer disabled:opacity-40"
              aria-label="Next reel"
              title="Next reel"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper Slider */}
      <div className="instagram-reels-slider">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1.2}
          loop={reels.length > 3}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            nextEl: '.gallery-reels-next',
            prevEl: '.gallery-reels-prev',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            480: { slidesPerView: 1.6, spaceBetween: 20 },
            640: { slidesPerView: 2.2, spaceBetween: 22 },
            768: { slidesPerView: 2.8, spaceBetween: 24 },
            1024: { slidesPerView: 3.4, spaceBetween: 26 },
            1280: { slidesPerView: 4, spaceBetween: 28 },
          }}
          className="!pb-14"
        >
          {reels.map((reel, index) => (
            <SwiperSlide key={reel.id || reel._id || index} className="h-auto">
              <GalleryReelCard
                reel={reel}
                isFirstItem={index === 0}
                onOpenModal={(r) => setSelectedModalReel(r)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Follow CTA */}
      <div className="text-center mt-6">
        <a
          href={clinicInfo.socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 transition-all shadow-md font-medium text-xs sm:text-sm hover:scale-105 hover:shadow-xl cursor-pointer"
        >
          <Instagram className="w-4 h-4" />
          <span>Follow @sanjeevinisiddha for Daily Health Reels</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Lightbox Modal */}
      {selectedModalReel && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedModalReel(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedModalReel.videoId}?autoplay=1&mute=0&loop=1&playlist=${selectedModalReel.videoId}&start=${
                    selectedModalReel.start || 0
                  }&controls=1&modestbranding=1&playsinline=1&rel=0`}
                  title={selectedModalReel.title}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-neutral-900 border-t border-white/10 flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <h5 className="text-white text-sm font-serif font-medium line-clamp-1">
                    {selectedModalReel.title}
                  </h5>
                  <p className="text-white/60 text-xs">
                    {selectedModalReel.views} views • {selectedModalReel.tag}
                  </p>
                </div>
                <a
                  href={selectedModalReel.instagramUrl || clinicInfo.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 transition-all shadow-md flex-shrink-0"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default InstagramReels;
