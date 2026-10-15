import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import GoogleMap from '../components/contact/GoogleMap';
import ConsultationHours from '../components/contact/ConsultationHours';

const Contact = () => {
  useEffect(() => {
    if (window.location.hash === '#contact-form') {
      setTimeout(() => {
        const el = document.getElementById('contact-form');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          const input = el.querySelector('input');
          if (input) input.focus();
        }
      }, 200);
    }
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>Contact Us | Sanjeevini Siddha & Ayurveda</title>
      </Helmet>
      <div className="bg-cream py-20 min-h-screen">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-4">Contact Us</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Get in touch with us for consultations and general inquiries.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <ContactInfo />
              <div className="mt-8">
                <ConsultationHours />
              </div>
            </div>
            <div>
              <div id="contact-form" className="bg-white p-8 rounded-2xl shadow-sm h-full scroll-mt-28 transition-all duration-300">
                <h3 className="text-2xl font-serif text-primary-700 mb-6">Send a Message</h3>
                <ContactForm />
              </div>
            </div>
          </div>

          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-sm">
            <GoogleMap />
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default Contact;
