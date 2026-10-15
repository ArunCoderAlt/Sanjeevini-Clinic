import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
import PageTransition from '../components/common/PageTransition';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Doctors = lazy(() => import('../pages/Doctors'));
const DoctorDetails = lazy(() => import('../pages/DoctorDetails'));
const ServiceDetails = lazy(() => import('../pages/ServiceDetails'));
const Services = lazy(() => import('../pages/Services'));
const Treatments = lazy(() => import('../pages/Treatments'));
const TreatmentDetails = lazy(() => import('../pages/TreatmentDetails'));
const Gallery = lazy(() => import('../pages/Gallery'));
const Testimonials = lazy(() => import('../pages/Testimonials'));
const Contact = lazy(() => import('../pages/Contact'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading fullPage />}>
      <Routes>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/doctors" element={<PageTransition><Doctors /></PageTransition>} />
        <Route path="/doctors/:slug" element={<PageTransition><DoctorDetails /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/services/:slug" element={<PageTransition><ServiceDetails /></PageTransition>} />
        <Route path="/treatments" element={<PageTransition><Treatments /></PageTransition>} />
        <Route path="/treatments/:slug" element={<PageTransition><TreatmentDetails /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/testimonials" element={<PageTransition><Testimonials /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/appointment" element={<Navigate to="/contact" replace />} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Suspense>
  );
}
