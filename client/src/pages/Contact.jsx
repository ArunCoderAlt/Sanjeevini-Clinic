import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, ExternalLink } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import GoogleMap from '../components/contact/GoogleMap';
import ConsultationHours from '../components/contact/ConsultationHours';
import { clinicInfo } from '../data/clinicInfo';

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
              <div id="contact-form" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm h-full scroll-mt-28 transition-all duration-300">
                <h3 className="text-2xl font-serif text-primary-700 mb-6">Send a Message</h3>
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Location Map Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-sage">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-primary-600 block mb-1">Our Location</span>
                <h3 className="text-2xl font-serif text-primary-700 font-bold">Find Us on Google Maps</h3>
                <p className="text-gray-600 text-sm mt-1">{clinicInfo.address}</p>
              </div>
              <a
                href={clinicInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-md shrink-0 self-start sm:self-auto hover:shadow-lg"
              >
                <MapPin className="w-4 h-4 text-gold" />
                <span>Get Directions</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>
            </div>
            <div className="w-full h-[420px] rounded-2xl overflow-hidden shadow-inner border border-gray-200">
              <GoogleMap />
            </div>
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default Contact;
