import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';

// Public pages directly imported for instant navigation with zero delay
import Home from '../pages/Home';
import About from '../pages/About';
import Doctors from '../pages/Doctors';
import DoctorDetails from '../pages/DoctorDetails';
import Services from '../pages/Services';
import ServiceDetails from '../pages/ServiceDetails';
import Treatments from '../pages/Treatments';
import TreatmentDetails from '../pages/TreatmentDetails';
import Gallery from '../pages/Gallery';
import SwarnaBindu from '../pages/SwarnaBindu';
import Testimonials from '../pages/Testimonials';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Terms from '../pages/Terms';
import NotFound from '../pages/NotFound';

// Admin portal lazy loaded
const AdminRoutes = lazy(() => import('./AdminRoutes'));

export default function AppRoutes() {
  const location = useLocation();

  return (
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
  );
}
