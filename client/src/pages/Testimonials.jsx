import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import TestimonialCard from '../components/testimonials/TestimonialCard';
import TestimonialForm from '../components/testimonials/TestimonialForm';
import Loading from '../components/common/Loading';
import { getTestimonials } from '../services/testimonialService';

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getTestimonials()
      .then((res) => {
        const data = res.data.data || res.data || [];
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError('Unable to load testimonials.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>Patient Testimonials | Sanjeevini</title>
        <meta name="description" content="Read what our patients say about their healing journey at Sanjeevini Siddha & Ayurveda Medical Centre." />
      </Helmet>
      <div className="py-20 bg-sage min-h-screen">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-4">Patient Testimonials</h1>
            <p className="text-gray-700 max-w-2xl mx-auto">Read what our patients have to say about their healing journey with us.</p>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <p className="text-center text-red-500 py-12">{error}</p>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No testimonials yet. Be the first to share your experience!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {testimonials.map((t) => (
                <TestimonialCard key={t._id || t.id} testimonial={t} />
              ))}
            </div>
          )}

          <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-serif text-primary-700 mb-6 text-center">Share Your Experience</h2>
            <TestimonialForm />
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default TestimonialsPage;
