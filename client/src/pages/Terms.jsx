import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';

const Terms = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Terms & Conditions | Sanjeevini</title>
      </Helmet>
      <div className="bg-cream py-20 min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
            <h1 className="text-3xl font-serif text-primary-700 mb-8">Terms and Conditions</h1>
            <div className="prose prose-green max-w-none text-gray-700 space-y-6">
              <p>Welcome to Sanjeevini Siddha & Ayurveda Medical Centre.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">1. Appointments</h2>
              <p>Appointments are subject to availability. Please arrive 10 minutes before your scheduled time. Late arrivals may result in reduced consultation time.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">2. Medical Disclaimer</h2>
              <p>The content on this website is for informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">3. Treatments</h2>
              <p>Traditional treatments and their efficacy vary from person to person. Our doctors will recommend the best course of action based on thorough consultation.</p>
              
              <h2 className="text-xl font-semibold text-primary-700">4. Contact</h2>
              <p>For any queries regarding our terms, reach out at No. 22, Dr. Ambedkar Street, Karaikal - 609602, Puducherry.</p>
            </div>
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default Terms;
