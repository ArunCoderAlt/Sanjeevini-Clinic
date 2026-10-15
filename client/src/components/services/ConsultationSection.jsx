import React from 'react';
import { motion } from 'framer-motion';

const ConsultationSection = () => {
  return (
    <div id="consultation" className="scroll-mt-32 py-16">
      <h2 className="text-3xl font-serif text-primary-700 mb-6">Consultation</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage">
        <p className="text-gray-700 leading-relaxed mb-4">
          Our consultation process is thorough and rooted in traditional diagnostic methods, particularly Nadi Pariksha (Pulse Diagnosis). By examining the pulse, our doctors can understand the balance of Vatham, Pitham, and Kapham in your body.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We combine this ancient wisdom with modern understanding to create a highly personalized treatment plan that addresses the root cause of your ailments rather than merely alleviating symptoms.
        </p>
      </div>
    </div>
  );
};

export default ConsultationSection;
