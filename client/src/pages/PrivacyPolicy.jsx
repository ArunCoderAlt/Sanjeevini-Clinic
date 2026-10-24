import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';

const PrivacyPolicy = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Privacy Policy | Sanjeevini Siddha & Ayurveda</title>
      </Helmet>
      <div className="bg-cream py-20 min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
            <h1 className="text-3xl font-serif text-primary-700 mb-8">Privacy Policy</h1>
            <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-xl font-semibold text-primary-700">1. Information We Collect</h2>
              <p>At Sanjeevini Siddha & Ayurveda Medical Centre, we collect personal information that you provide to us, including your name, contact details, medical history, and treatment preferences when you book an appointment or consult with our doctors.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">2. How We Use Your Information</h2>
              <p>Your information is used strictly for medical evaluation, treatment planning, and clinic administration. We ensure the confidentiality of all patient records in accordance with medical ethics and applicable laws.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">3. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">4. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at sanjeevinisiddha@gmail.com.</p>
            </div>
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
