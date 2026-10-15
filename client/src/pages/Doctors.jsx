import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import DoctorGrid from '../components/doctors/DoctorGrid';
import Container from '../components/common/Container';
import SectionTitle from '../components/common/SectionTitle';

const Doctors = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Our Medical Team | Sanjeevini Siddha & Ayurveda</title>
        <meta name="description" content="Meet our expert doctors at Sanjeevini Siddha & Ayurveda Medical Centre." />
      </Helmet>
      <section className="py-20 bg-cream">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-4">Our Medical Team</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Expert care combining traditional wisdom and modern understanding.</p>
          </div>
          <DoctorGrid />
        </Container>
      </section>
    </PageTransition>
  );
};

export default Doctors;
