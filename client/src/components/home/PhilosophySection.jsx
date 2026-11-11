import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';

const PhilosophySection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-[#EDF5FB] via-[#E2EEF8] to-[#D6E7F5] overflow-hidden text-center">
      {/* Parallax background effect placeholder */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leaves.png")' }}></div>
      
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-gold text-6xl font-serif leading-none opacity-50 block mb-4">"</span>
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8 text-[#09223D]">
            The body heals with play, the mind heals with laughter, and the spirit heals with joy. True health is a harmony of all three.
          </h2>
          <p className="text-[#243B52] text-lg md:text-xl font-light uppercase tracking-widest font-medium">
            — The Essence of Siddha & Ayurveda
          </p>
        </motion.div>
      </Container>
    </section>
  );
};

export default PhilosophySection;
