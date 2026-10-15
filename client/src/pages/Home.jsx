import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import HeroSection from '../components/home/HeroSection';
import TrustStats from '../components/home/TrustStats';
import AboutPreview from '../components/home/AboutPreview';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ServicesPreview from '../components/home/ServicesPreview';
import TreatmentsPreview from '../components/home/TreatmentsPreview';
import DoctorsPreview from '../components/home/DoctorsPreview';
import PhilosophySection from '../components/home/PhilosophySection';
import InstagramSection from '../components/home/InstagramSection';
import GalleryPreview from '../components/home/GalleryPreview';
import VideoSection from '../components/home/VideoSection';
import Testimonials from '../components/home/Testimonials';
import AppointmentCTA from '../components/home/AppointmentCTA';
import Newsletter from '../components/home/Newsletter';

const Home = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Sanjeevini Siddha & Ayurveda Medical Centre - Natural Healing, Personalized Care</title>
        <meta name="description" content="Experience Siddha & Ayurveda care designed around your individual wellness journey at Sanjeevini Siddha & Ayurveda Medical Centre." />
      </Helmet>
      <HeroSection />
      <TrustStats />
      <AboutPreview />
      <WhyChooseUs />
      <ServicesPreview />
      <TreatmentsPreview />
      <DoctorsPreview />
      <PhilosophySection />
      <InstagramSection />
      <GalleryPreview />
      <VideoSection />
      <Testimonials />
      <AppointmentCTA />
      <Newsletter />
    </PageTransition>
  );
};

export default Home;
