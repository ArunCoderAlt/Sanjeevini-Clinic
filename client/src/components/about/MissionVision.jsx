import React from 'react';
import { Target, Eye } from 'lucide-react';
import Container from '../common/Container';

const MissionVision = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-sage/40 p-10 rounded-3xl border border-sage hover:border-primary-600 transition-colors">
            <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-serif text-primary-700 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To provide authentic, compassionate, and highly effective Siddha and Ayurvedic healthcare. We are committed to alleviating suffering, preventing disease, and promoting optimal health through personalized, natural therapies.
            </p>
          </div>
          <div className="bg-cream p-10 rounded-3xl border border-gold/30 hover:border-gold transition-colors">
            <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-serif text-primary-700 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To be a premier center of excellence for traditional Indian medicine, recognized globally for restoring health organically and spreading awareness about the profound healing potential of Siddha and Ayurveda.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MissionVision;
