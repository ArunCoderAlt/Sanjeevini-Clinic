import React from 'react';
import Container from '../common/Container';

const AboutHero = () => {
  return (
    <section className="bg-gradient-to-r from-[#144979] via-[#0C294A] to-[#071A2F] py-24 text-white shadow-inner">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif mb-6 text-white drop-shadow-md">About Sanjeevini</h1>
          <p className="text-[#E0EFFB] text-lg md:text-xl font-light leading-relaxed">
            Preserving and practicing the ancient wisdom of Siddha and Ayurveda to provide comprehensive, holistic healthcare for the modern world.
          </p>
        </div>
      </Container>
    </section>
  );
};

export default AboutHero;
