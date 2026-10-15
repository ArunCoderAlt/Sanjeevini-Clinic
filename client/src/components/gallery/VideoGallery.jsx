import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

const clinicVideos = [
  {
    id: 1,
    title: 'Hospital Care & Herbal Treatments',
    videoId: '8oLZSitF20E',
    desc: 'Explore Sanjeevini Siddha & Ayurveda Medical Centre – Siddha, Ayurveda, herbal treatments, yoga, and Panchakarma in Karaikal.',
    thumb: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg'
  },
  {
    id: 2,
    title: 'Ayush Therapies & Herbal Medicine',
    videoId: '-Fz1SBNlSw0',
    desc: 'Ayush-certified Siddha hospital in Karaikal offering traditional herbal medicine, Ayurveda treatments, and holistic wellness care.',
    thumb: 'https://i.ytimg.com/vi/-Fz1SBNlSw0/hq720.jpg'
  },
  {
    id: 3,
    title: 'Sanjeevini Siddha – Full Channel',
    videoId: '8oLZSitF20E',
    desc: 'Watch all our videos on the @SanjeeviniSiddha YouTube channel for treatment insights, patient stories, and wellness tips.',
    thumb: 'https://i.ytimg.com/vi/8oLZSitF20E/hq720.jpg'
  }
];

const VideoGallery = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    if (activeVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideo]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {clinicVideos.map(video => (
          <div 
            key={video.id} 
            role="button"
            tabIndex={0}
            onClick={() => setActiveVideo(video)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveVideo(video);
              }
            }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-sage hover:border-primary-600 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <div className="relative aspect-video bg-dark overflow-hidden">
              <img src={video.thumb} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-primary-700 shadow-lg group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  <Play className="w-6 h-6 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-serif text-lg text-primary-700 group-hover:text-primary-600 transition-colors mb-2">{video.title}</h4>
              <p className="text-gray-600 text-sm">{video.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-neutral-900 text-white">
              <h3 className="font-serif text-lg font-medium">{activeVideo.title}</h3>
              <button 
                onClick={() => setActiveVideo(null)}
                aria-label="Close video player"
                className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoGallery;
