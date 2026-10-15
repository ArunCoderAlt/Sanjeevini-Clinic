import React from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, MessageSquare } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

const AppointmentCTA = () => {
  return (
    <section className="py-20 bg-[#F8F5EC] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full border-4 border-white/10"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full border-4 border-white/10"></div>
      
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-[#3D3428]">Ready to Start Your Healing Journey?</h2>
          <p className="text-[#655B4B] text-lg mb-10">
            Connect with our specialists and take the first step towards natural, holistic wellness.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button to="/contact#contact-form" variant="primary" className="bg-[#244638] text-white hover:bg-[#1a3228] w-full sm:w-auto text-lg py-4 px-8 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
            <a href="tel:+919443189498" className="inline-flex items-center justify-center w-full sm:w-auto text-lg py-4 px-8 rounded-full border-2 border-[#244638] text-[#244638] hover:bg-[#244638] hover:text-white transition-colors">
              <PhoneCall className="w-5 h-5 mr-2" />
              +91 94431 89498
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AppointmentCTA;
