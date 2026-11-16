import { useState, useMemo, useEffect } from 'react';
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
  Check,
  Film
} from 'lucide-react';
import Container from '../common/Container';
import { clinicInfo } from '../../data/clinicInfo';
import { useReels } from '../../hooks/useQueries';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const defaultClinicReels = [
  {
    id: 'default-1',
    videoId: '8oLZSitF20E',
    start: 0,
    thumbnail: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg',
    title: 'Hospital Care & Herbal Treatments',
    tag: 'Panchakarma & Siddha',
    likes: '2.4K',
    views: '18.9K',
    desc: 'Virtual walkthrough of Sanjeevini Siddha inpatient rooms, traditional herbal care, and therapy facilities in Karaikal.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'default-2',
    videoId: '-Fz1SBNlSw0',
    start: 12,
    thumbnail: 'https://i.ytimg.com/vi/-Fz1SBNlSw0/hq720.jpg',
    title: 'Ayush Therapies & Traditional Medicine',
    tag: 'Ayush Certified',
    likes: '3.1K',
    views: '24.5K',
    desc: 'Clinical insights on authentic Siddha herbal preparations, dietary regimens, and holistic healing principles.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-13T10:00:00Z',
  },
  {
    id: 'default-3',
    videoId: '8oLZSitF20E',
    start: 45,
    thumbnail: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg',
    title: 'Nadi Parikshai Pulse Diagnosis',
    tag: 'Siddha Diagnosis',
    likes: '4.8K',
    views: '32.1K',
    desc: 'Dr. Thiagarajan explains the assessment of body doshas (Vatham, Pitham, Kapham) through ancient pulse examination.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'default-4',
    videoId: '-Fz1SBNlSw0',
    start: 78,
    thumbnail: 'https://i.ytimg.com/vi/-Fz1SBNlSw0/hq720.jpg',
    title: 'Varmam Vital Point Energy Therapy',
    tag: 'Energy Locks',
    likes: '3.6K',
    views: '28.3K',
    desc: 'Demonstration of vital pressure points (Varmam) to treat chronic spinal stiffness, nerve compression, and joint mobility.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-11T10:00:00Z',
  },
  {
    id: 'default-5',
    videoId: '8oLZSitF20E',
    start: 110,
    thumbnail: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg',
    title: 'Authentic Herbal Pharmacy & Decoctions',
    tag: 'Natural Pharmacy',
    likes: '1.9K',
    views: '15.7K',
    desc: 'Preparation of customized herbal Kashayams and medicated oils according to classical Agathiyar Siddha formulations.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'default-6',
    videoId: '-Fz1SBNlSw0',
    start: 135,
    thumbnail: 'https://i.ytimg.com/vi/-Fz1SBNlSw0/hq720.jpg',
    title: 'Swarna Bindu Prashana Drops for Children',
    tag: 'Pediatric Immunity',
    likes: '4.2K',
    views: '29.7K',
    desc: 'Monthly Pushya Nakshatra memory and immunity enhancement drops prepared with purified gold ash and herbal honey.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'default-7',
    videoId: '8oLZSitF20E',
    start: 160,
    thumbnail: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg',
    title: 'Elakizhi Herbal Leaf Compress Pain Therapy',
    tag: 'Spine & Joint Care',
    likes: '3.8K',
    views: '26.4K',
    desc: 'Warm herbal poultice massage for chronic back pain, cervical spondylosis, and neuromuscular stiffness.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 'default-8',
    videoId: '-Fz1SBNlSw0',
    start: 190,
    thumbnail: 'https://i.ytimg.com/vi/-Fz1SBNlSw0/hq720.jpg',
    title: 'Daily Siddha Regimen & Preventive Health',
    tag: 'Holistic Wellness',
    likes: '5.1K',
    views: '35.8K',
    desc: 'Daily Dinacharya guidelines, herbal teas, and seasonal detox protocols recommended by Dr. Thiagarajan.',
    instagramUrl: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    createdAt: '2026-10-07T10:00:00Z',
  },
];

export const clinicReelsData = defaultClinicReels;

const HomeReelCard = ({ reel, isFirstItem, isPlaying, onTogglePlay, onOpenModal }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(parseInt(reel.likes) || 2400);
  const [copied, setCopied] = useState(false);

  const togglePlay = (e) => {
    e.stopPropagation();
    onTogglePlay();
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
        {/* 9:16 Vertical Reel Frame */}
        <div className="relative aspect-[9/16] min-h-[460px] max-h-[520px] overflow-hidden bg-neutral-900">
          {/* Autoplaying Video / Cropped YouTube Reel */}
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
            <div 
              className="absolute inset-0 w-full h-full cursor-pointer group/thumb"
              onClick={togglePlay}
              role="button"
              tabIndex={0}
              aria-label={`Play reel: ${reel.title}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlay(e); }}
            >
              <img
                src={reel.thumbnail || `https://i.ytimg.com/vi/${reel.videoId}/hq720.jpg`}
                alt={reel.title}
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 group-hover/thumb:bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl group-hover/thumb:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          )}

          {/* Vignette Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/40 pointer-events-none" />

          {/* Top Bar: Instagram Badge, Newest Tag & Controls */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-1.5">
            {/* Instagram Badge */}
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

              {/* Latest / Newest Badge */}
              {isFirstItem && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Latest</span>
                </span>
              )}
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1.5">
              {/* Sound Toggle (Mute / Unmute) */}
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
              </button>

              {/* Fullscreen Expand */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(reel);
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
                title="Watch in full size"
                aria-label="Expand reel"
              >
                <Maximize2 className="w-3.5 h-3.5 text-white/90" />
              </button>
            </div>
          </div>

          {/* Right Floating Actions (Like, Share, Play/Pause) */}
          <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-2.5">
            {/* Like Button */}
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

            {/* Share / Copy Button */}
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

            {/* Play / Pause Toggle Button */}
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
            {/* Channel Handle & Verified Tag */}
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

            {/* Direct Open in Instagram Button */}
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

/* Fullscreen Reel Lightbox Modal */
const ReelLightboxModal = ({ reel, onClose }) => {
  if (!reel) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Player in 9:16 aspect */}
          <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${reel.videoId}?autoplay=1&mute=0&loop=1&playlist=${reel.videoId}&start=${
                reel.start || 0
              }&controls=1&modestbranding=1&playsinline=1&rel=0`}
              title={reel.title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-neutral-900 border-t border-white/10 flex items-center justify-between">
            <div className="flex-1 pr-3">
              <h5 className="text-white text-sm font-serif font-medium line-clamp-1">
                {reel.title}
              </h5>
              <p className="text-white/60 text-xs">
                {reel.views} views • {reel.tag}
              </p>
            </div>
            <a
              href={reel.instagramUrl || clinicInfo.socialLinks.instagram}
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
  );
};

const InstagramSection = () => {
  const { data: rawReels } = useReels();
  const reels = useMemo(() => {
    const list = Array.isArray(rawReels) && rawReels.length > 0 ? rawReels : (!rawReels ? defaultClinicReels : []);
    if (!Array.isArray(list) || list.length === 0) return [];

    // Always sort newest / latest reels first so the latest reel is displayed first
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return (a.order ?? 999) - (b.order ?? 999);
    });
  }, [rawReels]);
  const [selectedModalReel, setSelectedModalReel] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activePlayingId, setActivePlayingId] = useState(() => {
    return defaultClinicReels[0]?.id || 'default-1';
  });

  // Automatically activate latest first reel on mount or dynamic load
  useEffect(() => {
    if (reels.length > 0) {
      setActivePlayingId(reels[0].id || reels[0]._id || 'default-1');
    }
  }, [reels]);

  // Synchronize playing reel with Swiper autoplay slide transition
  const handleSlideChange = (swiper) => {
    const idx = swiper.realIndex ?? swiper.activeIndex;
    const currentReel = reels[idx];
    if (currentReel) {
      const reelKey = currentReel.id || currentReel._id || `reel-${idx}`;
      setActivePlayingId(reelKey);
    }
  };

  return (
    <section
      className="py-20 bg-gradient-to-b from-[#EDF5FB] via-[#F4F9FD] to-[#DFEEF8] relative overflow-hidden"
      id="home-instagram"
    >
      <Container>
        {/* Section Header with Elevated Navigation Pill (Zero Overlap with Videos) */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-[#833ab4]/20 shadow-sm">
              <Instagram className="w-4 h-4 text-[#E1306C]" />
              <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-clip-text text-transparent">
                Follow @sanjeevinisiddha
              </span>
            </div>
          </div>

          {/* Clean Navigation Controls - Placed above carousel with ZERO overlap on video cards! */}
          {reels.length > 0 && (
            <div className="flex items-center gap-3 self-start md:self-end flex-shrink-0">
              <span className="text-xs font-medium text-gray-500 hidden sm:inline-block">
                {reels.length} {reels.length === 1 ? 'Reel' : 'Reels'} Total
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="home-reels-prev w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-primary-700 hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all duration-200 cursor-pointer disabled:opacity-40"
                  aria-label="Previous reel"
                  title="Previous reel"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="home-reels-next w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-primary-700 hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all duration-200 cursor-pointer disabled:opacity-40"
                  aria-label="Next reel"
                  title="Next reel"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Autoplay Reels Slider or Empty Notice */}
        {reels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto my-8 shadow-sm">
            <Film className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-xl font-serif text-slate-800 font-semibold mb-2">No Video Reels Currently Available</h3>
            <p className="text-slate-500 text-sm">Clinical reels and patient recovery updates will be posted soon. Follow @sanjeevinisiddha on Instagram for live updates.</p>
          </div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1.2}
              loop={reels.length > 3}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              onSwiper={setSwiperInstance}
              onSlideChange={handleSlideChange}
              navigation={{
                nextEl: '.home-reels-next',
                prevEl: '.home-reels-prev',
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
              {reels.map((reel, index) => {
                const reelKey = reel.id || reel._id || `reel-${index}`;
                return (
                  <SwiperSlide key={reelKey} className="h-auto">
                    <HomeReelCard
                      reel={reel}
                      isFirstItem={index === 0}
                      isPlaying={activePlayingId === reelKey}
                      onTogglePlay={() => {
                        setActivePlayingId(reelKey);
                        if (swiperInstance) {
                          if (typeof swiperInstance.slideToLoop === 'function') {
                            swiperInstance.slideToLoop(index);
                          } else {
                            swiperInstance.slideTo(index);
                          }
                        }
                      }}
                      onOpenModal={(r) => {
                        setActivePlayingId(null);
                        setSelectedModalReel(r);
                      }}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}

        {/* Follow CTA */}
        <div className="text-center mt-6">
          <a
            href={clinicInfo.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-gradient-btn inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 transition-all shadow-md font-semibold text-xs sm:text-sm hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <Instagram className="w-4 h-4 text-white" />
            <span className="text-white font-semibold">Follow @sanjeevinisiddha for Daily Health Reels</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/90" />
          </a>
        </div>
      </Container>

      {/* Expanded Modal */}
      {selectedModalReel && (
        <ReelLightboxModal
          reel={selectedModalReel}
          onClose={() => setSelectedModalReel(null)}
        />
      )}
    </section>
  );
};

export default InstagramSection;
