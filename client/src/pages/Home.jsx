import { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import HeroSection from '../components/home/HeroSection';
import TrustStats from '../components/home/TrustStats';
import AboutPreview from '../components/home/AboutPreview';

// Lazy-load below-the-fold sections so hero & above-the-fold content render immediately
const WhyChooseUs = lazy(() => import('../components/home/WhyChooseUs'));
const ServicesPreview = lazy(() => import('../components/home/ServicesPreview'));
const TreatmentsPreview = lazy(() => import('../components/home/TreatmentsPreview'));
const DoctorsPreview = lazy(() => import('../components/home/DoctorsPreview'));
const PhilosophySection = lazy(() => import('../components/home/PhilosophySection'));
const InstagramSection = lazy(() => import('../components/home/InstagramSection'));
const GalleryPreview = lazy(() => import('../components/home/GalleryPreview'));
const VideoSection = lazy(() => import('../components/home/VideoSection'));
const Testimonials = lazy(() => import('../components/home/Testimonials'));
const Newsletter = lazy(() => import('../components/home/Newsletter'));

const SectionFallback = () => <div className="min-h-[260px]" aria-hidden="true" />;

const Home = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Sanjeevini Siddha & Ayurveda Medical Centre - Rooted in Tradition, Focused on New</title>
        <meta name="description" content="Experience the timeless traditions of Siddha and Ayurveda with care tailored to your individual wellness journey at Sanjeevini Siddha & Ayurveda Medical Centre." />
      </Helmet>
      <HeroSection />
      <TrustStats />
      <AboutPreview />
      <Suspense fallback={<SectionFallback />}>
        <WhyChooseUs />
        <ServicesPreview />
        <TreatmentsPreview />
        <DoctorsPreview />
        <PhilosophySection />
        <InstagramSection />
        <GalleryPreview />
        <VideoSection />
        <Testimonials />
        <Newsletter />
      </Suspense>
    </PageTransition>
  );
};

export default Home;
