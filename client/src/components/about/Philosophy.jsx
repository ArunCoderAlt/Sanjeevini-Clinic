import React from 'react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

const Philosophy = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Full Uncropped SAMC Philosophy Poster */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[430px] rounded-3xl overflow-hidden shadow-2xl bg-[#020712] border border-gold/30 p-2 sm:p-2.5">
              <img 
                src="/images/about/samc-philosophy.jpg?v=3" 
                alt="Sanjeevini Siddha & Ayurveda Medical Centre - SAMC Philosophy Emblem" 
                width="578"
                height="1024"
                decoding="async"
                className="w-full h-auto object-contain rounded-2xl block mx-auto select-none"
                style={{ aspectRatio: '578 / 1024' }}
              />
            </div>
          </div>

          {/* Right Column: Philosophy Description */}
          <div className="lg:col-span-7">
            <SectionTitle title="Our Philosophy" align="left" />
            <div className="text-gray-700 space-y-6 mt-6 text-base sm:text-lg leading-relaxed">
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
