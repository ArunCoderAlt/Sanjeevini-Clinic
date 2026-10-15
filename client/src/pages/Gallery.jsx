import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Camera, Instagram } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import GalleryGrid from '../components/gallery/GalleryGrid';
import GalleryFilter from '../components/gallery/GalleryFilter';
import InstagramReels from '../components/gallery/InstagramReels';
import VideoGallery from '../components/gallery/VideoGallery';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <PageTransition>
      <Helmet>
        <title>Gallery | Sanjeevini Siddha & Ayurveda</title>
        <meta name="description" content="View clinic photos, treatment rooms, therapy procedures, Instagram reels and video guides at Sanjeevini Siddha & Ayurveda Medical Centre." />
      </Helmet>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: INSTAGRAM REELS SLIDER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-cream via-white to-cream" id="instagram-reels">
        <Container>
          <InstagramReels />
        </Container>
      </section>

      {/* Decorative Divider */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-700/20 to-transparent" />
        <div className="flex items-center justify-center -mt-4">
          <div className="bg-cream px-6">
            <div className="w-2 h-2 rounded-full bg-primary-700/30" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: CLINIC GALLERY (Admin Uploaded Images)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream min-h-[60vh]" id="clinic-gallery">
        <Container>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary-700/5 border border-primary-700/10 mb-5">
              <Camera className="w-4 h-4 text-primary-700" />
              <span className="text-sm font-semibold text-primary-700">Photo Gallery</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-primary-700 mb-3">Our Clinic Gallery</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A glimpse into our clinic, treatment rooms, events, and the team behind your healing journey.
            </p>
          </div>
          
          <GalleryFilter activeTab={activeTab} setActiveTab={setActiveTab} />
          <GalleryGrid activeTab={activeTab} />
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: CLINIC VIDEOS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white" id="clinic-videos">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif text-primary-700 mb-3">Clinic Videos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Watch video explanations of our healing therapies, treatments, and patient recovery stories.</p>
          </div>
          <VideoGallery />
        </Container>
      </section>
    </PageTransition>
  );
};

export default Gallery;
