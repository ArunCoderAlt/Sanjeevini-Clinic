import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Play, X, Youtube, ExternalLink, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import { classNames } from '../../utils/helpers';

const clinicVideos = [
  {
    id: 1,
    videoId: '8oLZSitF20E',
    badge: 'Hospital & Therapies',
    title: 'Hospital Care, Herbal Treatments & Panchakarma',
    desc: 'Take a virtual walk through Sanjeevini Siddha & Ayurveda Medical Centre in Karaikal. Explore authentic Siddha, Ayurveda, yoga, and natural therapies.',
    thumb: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg',
  },
  {
    id: 2,
    videoId: '-Fz1SBNlSw0',
    badge: 'Ayush Certified Hospital',
    title: 'Ayush Therapies & Traditional Herbal Medicine',
    desc: 'Explore our Ayush-certified healthcare practices in Karaikal, including traditional herbal medicine, pulse examination (Nadi Parikshai), and clinical care.',
    thumb: 'https://i.ytimg.com/vi/-Fz1SBNlSw0/hq720.jpg',
  },
  {
    id: 3,
    videoId: '8oLZSitF20E',
    playlistId: 'UUJrUZ0fx2GHwpM3daTx5Ieg',
    badge: 'Channel Highlights',
    title: 'Treatment Guides & Patient Recovery Stories',
    desc: 'Watch our full library of medical talks, therapy demonstrations, and patient recovery journeys on the official @SanjeeviniSiddha channel.',
    thumb: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg',
  }
];

const VideoSection = () => {
  // Autoplay YouTube video by default (id: 1)
  const [playingVideoId, setPlayingVideoId] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex ?? swiper.activeIndex);
    const currentVideo = clinicVideos[swiper.realIndex ?? swiper.activeIndex];
    if (currentVideo) {
      setPlayingVideoId(currentVideo.id);
    }
  };

  const handleSelectVideo = (index, videoId) => {
    setActiveIndex(index);
    setPlayingVideoId(videoId);
    swiperInstance?.slideTo(index);
  };

  return (
    <section className="py-24 bg-cream" id="home-videos">
      <Container>
        <SectionTitle 
          title="Watch & Learn" 
          subtitle="Official YouTube Showreel"
          description="Explore our healing practices, hospital facilities, and authentic therapies in Karaikal through our official YouTube channel."
        />

        <div className="max-w-5xl mx-auto">
          {/* Main Autoplaying Video Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 9000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              onSwiper={setSwiperInstance}
              onSlideChange={handleSlideChange}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              {clinicVideos.map((video) => (
                <SwiperSlide key={video.id}>
                  <div className="relative rounded-3xl overflow-hidden aspect-video bg-dark group">
                    {playingVideoId === video.id ? (
                      <div className="relative w-full h-full">
                        {/* Autoplaying YouTube Iframe */}
                        <iframe
                          src={video.playlistId
                            ? `https://www.youtube-nocookie.com/embed/videoseries?list=${video.playlistId}&autoplay=1&mute=${isMuted ? '1' : '0'}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
                            : `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
                          }
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0 rounded-3xl"
                        />

                        {/* Top Badges & Controls Overlay */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                            <Youtube className="w-3.5 h-3.5" />
                            <span>YouTube Autoplay</span>
                          </span>
                        </div>

                        {/* Audio Toggle Indicator */}
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 inline-flex items-center gap-1.5 bg-black/85 hover:bg-black text-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-md transition-all shadow-lg cursor-pointer border border-white/20"
                          title={isMuted ? 'Click to enable audio' : 'Click to mute audio'}
                        >
                          {isMuted ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                              <span>Muted for Autoplay (Click for Sound)</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                              <span>Sound Enabled</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Play ${video.title}`}
                        onClick={() => setPlayingVideoId(video.id)}
                        className="w-full h-full relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-gold/50 rounded-3xl"
                      >
                        <img 
                          src={video.thumb} 
                          alt={video.title} 
                          className="w-full h-full object-cover opacity-75 group-hover:opacity-65 transition-opacity duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />
                        
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 ml-1" fill="currentColor" />
                          </div>
                        </div>

                        {/* Video metadata overlay */}
                        <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                          <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow-sm">
                              <Youtube className="w-3.5 h-3.5" />
                              <span>@SanjeeviniSiddha</span>
                              <span className="opacity-60">•</span>
                              <span>{video.badge}</span>
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-serif mb-2 leading-tight">
                              {video.title}
                            </h3>
                            <p className="text-white/85 text-xs md:text-sm line-clamp-2 md:line-clamp-none">
                              {video.desc}
                            </p>
                          </div>
                          <a
                            href="https://www.youtube.com/@SanjeeviniSiddha"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white text-white hover:text-dark px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm transition-all shrink-0 self-start sm:self-auto"
                          >
                            <span>Visit Channel</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Slider Navigation Arrows (visible on sm+ screens, hidden on small mobile to avoid overlaying video controls) */}
            <button
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Previous video"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white items-center justify-center transition-all backdrop-blur-sm shadow-xl hover:scale-110 cursor-pointer border border-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Next video"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white items-center justify-center transition-all backdrop-blur-sm shadow-xl hover:scale-110 cursor-pointer border border-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>

          {/* Interactive Video Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {clinicVideos.map((v, index) => (
              <button
                key={v.id}
                onClick={() => handleSelectVideo(index, v.id)}
                className={classNames(
                  "flex items-center gap-3 p-3 rounded-2xl text-left transition-all border cursor-pointer",
                  activeIndex === index
                    ? "bg-white border-primary shadow-md ring-2 ring-primary/20"
                    : "bg-white/60 border-sage/60 hover:bg-white hover:border-sage shadow-sm"
                )}
              >
                <div className="relative w-20 aspect-video rounded-xl overflow-hidden shrink-0 bg-dark">
                  <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gold font-semibold uppercase tracking-wider mb-0.5 truncate">{v.badge}</p>
                  <h4 className="text-xs font-serif text-primary-700 font-medium line-clamp-2 leading-snug">{v.title}</h4>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Subscribe Banner */}
          <div className="mt-8 text-center">
            <a
              href="https://www.youtube.com/@SanjeeviniSiddha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors shadow-md"
            >
              <Youtube className="w-5 h-5" />
              <span>Subscribe to @SanjeeviniSiddha on YouTube</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default VideoSection;
