import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';

// Home kept as direct import for instant First Contentful Paint / Hero display
import Home from '../pages/Home';

// Route-level code splitting for secondary pages (loaded on demand)
const About = lazy(() => import('../pages/About'));
const Doctors = lazy(() => import('../pages/Doctors'));
const DoctorDetails = lazy(() => import('../pages/DoctorDetails'));
const Services = lazy(() => import('../pages/Services'));
const ServiceDetails = lazy(() => import('../pages/ServiceDetails'));
const Treatments = lazy(() => import('../pages/Treatments'));
const TreatmentDetails = lazy(() => import('../pages/TreatmentDetails'));
const Gallery = lazy(() => import('../pages/Gallery'));
const SwarnaBindu = lazy(() => import('../pages/SwarnaBindu'));
const Testimonials = lazy(() => import('../pages/Testimonials'));
const Contact = lazy(() => import('../pages/Contact'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin portal lazy loaded
const AdminRoutes = lazy(() => import('./AdminRoutes'));

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<Loading fullPage />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:slug" element={<DoctorDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetails />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/treatments/:slug" element={<TreatmentDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/swarna-bindu" element={<SwarnaBindu />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/appointment" element={<Navigate to="/contact" replace />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<Loading fullPage />}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
