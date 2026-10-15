import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Clock, Phone, Navigation, MessageCircle } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import AppointmentForm from '../components/appointment/AppointmentForm';
import GoogleMap from '../components/contact/GoogleMap';
import { clinicInfo } from '../data/clinicInfo';
import { getWhatsAppUrl, handleWhatsAppClick } from '../utils/helpers';

const Appointment = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Book Appointment | Sanjeevini Siddha & Ayurveda</title>
        <meta name="description" content="Schedule your consultation at Sanjeevini Siddha & Ayurveda Medical Centre in Karaikal. Easy online appointment booking." />
      </Helmet>
      <div className="bg-sage min-h-screen py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-4">Book a Consultation</h1>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Schedule your visit with our expert doctors. Fill out the form below and our clinic team will contact you to confirm your appointment.
              </p>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm mb-16">
              <AppointmentForm />
            </div>

            {/* Clinic Location & Map section */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-sage">
              <div className="text-center md:text-left mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif text-primary-700 mb-2">Clinic Location & Directions</h2>
                  <p className="text-gray-600">Find us in Karaikal. Ample parking and easy accessibility.</p>
                </div>
                <a
                  href={clinicInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-primary-700 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm self-start md:self-auto"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
                <div className="flex items-start">
                  <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-primary-700 shrink-0 mr-3 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                    <a href={clinicInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-700 transition-colors block leading-relaxed">{clinicInfo.address}</a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-primary-700 shrink-0 mr-3 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Consultation Hours</h3>
                    <p className="text-gray-600">{clinicInfo.hours}</p>
                    <p className="text-red-500 text-xs mt-1">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-primary-700 shrink-0 mr-3 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone & WhatsApp</h3>
                    <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="text-primary-700 hover:text-gold font-medium block">
                      {clinicInfo.phone}
                    </a>
                    <a
                      href={getWhatsAppUrl(clinicInfo.whatsapp, 'Hello Sanjeevini Clinic, I would like to book an appointment.')}
                      onClick={(e) => handleWhatsAppClick(e, clinicInfo.whatsapp, 'Hello Sanjeevini Clinic, I would like to book an appointment.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#25D366] hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="w-full h-80 rounded-xl overflow-hidden shadow-inner border border-sage/60">
                <GoogleMap />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default Appointment;
