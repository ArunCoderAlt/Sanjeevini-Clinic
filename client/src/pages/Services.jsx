import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import ServiceGrid from '../components/services/ServiceGrid';

const Services = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Our Services | Sanjeevini Siddha & Ayurveda</title>
      </Helmet>
      <section className="py-20 bg-sage">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-4">Our Services</h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Our clinic offers a comprehensive approach to health utilizing traditional Siddha and Ayurveda methods. 
              We focus on balancing the body's natural elements for long-lasting wellness and harmony.
            </p>
          </div>
          <ServiceGrid />
        </Container>
      </section>
    </PageTransition>
  );
};

export default Services;
