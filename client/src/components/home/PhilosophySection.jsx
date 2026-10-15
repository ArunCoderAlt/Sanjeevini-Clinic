import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';

const PhilosophySection = () => {
  return (
    <section className="relative py-32 bg-[#F8F5EC] overflow-hidden text-center">
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
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8 text-[#3D3428]">
            The body heals with play, the mind heals with laughter, and the spirit heals with joy. True health is a harmony of all three.
          </h2>
          <p className="text-[#655B4B] text-lg md:text-xl font-light uppercase tracking-widest">
            — The Essence of Siddha & Ayurveda
          </p>
        </motion.div>
      </Container>
    </section>
  );
};

export default PhilosophySection;
