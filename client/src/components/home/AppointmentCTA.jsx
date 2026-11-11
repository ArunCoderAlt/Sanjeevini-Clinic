import React from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, MessageSquare } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import { clinicInfo } from '../../data/clinicInfo';

const AppointmentCTA = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#EDF5FB] via-[#F4F9FD] to-[#DFEEF8] relative overflow-hidden" id="appointment-cta">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto"
        >
          <Button
            to="/contact#contact-form"
            variant="primary"
            className="w-full sm:w-auto text-base py-3.5 px-8 rounded-full shadow-md hover:shadow-lg flex items-center justify-center font-medium transition-all"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span>Contact Us</span>
          </Button>

          <a
            href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center justify-center w-full sm:w-auto text-base py-3.5 px-8 rounded-full border-2 border-[#0E355C] text-[#0A2644] bg-gradient-to-r from-white to-[#E3EFF9] hover:bg-gradient-to-r hover:from-[#144979] hover:to-[#0A2644] hover:text-white transition-all shadow-sm hover:shadow-md font-medium"
          >
            <PhoneCall className="w-5 h-5 mr-2" />
            <span>{clinicInfo.phone}</span>
          </a>
        </motion.div>
      </Container>
    </section>
  );
};

export default AppointmentCTA;
