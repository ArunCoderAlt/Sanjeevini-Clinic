import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';

const AboutPreview = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="aspect-[4/5] bg-sage rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/images/about/herbs.jpg" 
                  alt="Sanjeevini Medical Centre" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary-700 rounded-full flex items-center justify-center p-6 text-center shadow-xl border-4 border-cream hidden md:flex">
                <p className="text-white font-serif italic text-lg">"Healing naturally, from the roots."</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <SectionTitle 
              title="About Sanjeevini" 
              subtitle="Where ancient wisdom meets modern healthcare."
              align="left"
            />
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Located in the heart of Karaikal, Sanjeevini Siddha & Ayurveda Medical Centre is dedicated to providing holistic, natural healthcare. Under the expert guidance of Dr. Thiagarajan Saminadane (Siddha) and Dr. Subashini Ganesan (Ayurveda), we offer personalized treatments that address the root cause of ailments.
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed">
              We believe in restoring the body's natural balance through traditional therapies, specialized herbal formulations, and lifestyle modifications.
            </p>
            <Button to="/about" variant="primary">
              Learn More About Us
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default AboutPreview;
