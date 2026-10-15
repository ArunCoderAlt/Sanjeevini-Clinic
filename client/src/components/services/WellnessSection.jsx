import React from 'react';

const WellnessSection = () => {
  return (
    <div id="wellness" className="scroll-mt-32 py-16">
      <h2 className="text-3xl font-serif text-primary-700 mb-6">Wellness Support</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage">
        <p className="text-gray-700 leading-relaxed mb-4">
          True health extends beyond the clinic. Our Wellness Support programs are designed to help you maintain optimal health in your daily life.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We provide customized dietary plans, lifestyle counseling, and daily routines (Dinacharya) based on your body constitution (Prakriti). By aligning your lifestyle with nature, we help you build immunity and prevent future diseases.
        </p>
      </div>
    </div>
  );
};

export default WellnessSection;
