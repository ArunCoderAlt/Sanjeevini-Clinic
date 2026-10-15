import React from 'react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

const Philosophy = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800&q=80" alt="Herbal Medicine" className="rounded-3xl shadow-xl w-full" />
          </div>
          <div className="md:w-1/2">
            <SectionTitle title="Our Philosophy" align="left" />
            <div className="text-gray-700 space-y-6 mt-6">
              <p>
                At Sanjeevini Siddha & Ayurveda Medical Centre, we believe that true health is not merely the absence of disease, but a dynamic state of physical, mental, and spiritual harmony.
              </p>
              <p>
                Rooted in the ancient Indian wisdom of Siddha and Ayurveda, our philosophy centers on treating the individual as a whole. We focus on identifying the root cause of an illness rather than just suppressing its symptoms.
              </p>
              <p>
                By restoring the balance of the body's natural elements (Vatham, Pitham, and Kapham), we help our patients achieve long-lasting wellness naturally, safely, and effectively.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Philosophy;
