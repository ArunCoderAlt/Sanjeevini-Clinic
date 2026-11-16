import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';

// Home kept as direct import for instant First Contentful Paint / Hero display
import Home from '../pages/Home';

// Importers map for on-demand lazy loading and automatic background prefetching
const routeImporters = {
  about: () => import('../pages/About'),
  doctors: () => import('../pages/Doctors'),
  doctorDetails: () => import('../pages/DoctorDetails'),
  services: () => import('../pages/Services'),
  serviceDetails: () => import('../pages/ServiceDetails'),
  treatments: () => import('../pages/Treatments'),
  treatmentDetails: () => import('../pages/TreatmentDetails'),
  gallery: () => import('../pages/Gallery'),
  swarnaBindu: () => import('../pages/SwarnaBindu'),
  testimonials: () => import('../pages/Testimonials'),
  contact: () => import('../pages/Contact'),
  privacyPolicy: () => import('../pages/PrivacyPolicy'),
  terms: () => import('../pages/Terms'),
  notFound: () => import('../pages/NotFound'),
};

// Route-level code splitting for secondary pages (loaded on demand)
const About = lazy(routeImporters.about);
const Doctors = lazy(routeImporters.doctors);
const DoctorDetails = lazy(routeImporters.doctorDetails);
const Services = lazy(routeImporters.services);
const ServiceDetails = lazy(routeImporters.serviceDetails);
const Treatments = lazy(routeImporters.treatments);
const TreatmentDetails = lazy(routeImporters.treatmentDetails);
const Gallery = lazy(routeImporters.gallery);
const SwarnaBindu = lazy(routeImporters.swarnaBindu);
const Testimonials = lazy(routeImporters.testimonials);
const Contact = lazy(routeImporters.contact);
const PrivacyPolicy = lazy(routeImporters.privacyPolicy);
const Terms = lazy(routeImporters.terms);
const NotFound = lazy(routeImporters.notFound);

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
