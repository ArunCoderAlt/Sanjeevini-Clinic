import React from 'react';
import Container from '../common/Container';

const AboutHero = () => {
  return (
    <section className="bg-primary-700 py-24 text-white">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif mb-6">About Sanjeevini</h1>
          <p className="text-sage text-lg md:text-xl font-light leading-relaxed">
            Preserving and practicing the ancient wisdom of Siddha and Ayurveda to provide comprehensive, holistic healthcare for the modern world.
          </p>
        </div>
      </Container>
    </section>
  );
};

export default AboutHero;
