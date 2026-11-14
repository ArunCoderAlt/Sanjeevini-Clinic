import React from 'react';
import { Target, Eye } from 'lucide-react';
import Container from '../common/Container';

const MissionVision = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
          {/* Our Mission Card */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-primary-600/40 transition-all duration-300 flex flex-col justify-between group h-full">
            <div>
              <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-serif text-primary-700 mb-4 group-hover:text-primary-600 transition-colors">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                To provide authentic, compassionate, and highly effective Siddha and Ayurvedic healthcare. We are committed to alleviating suffering, preventing disease, and promoting optimal health through personalized, natural therapies.
              </p>
            </div>
          </div>

          {/* Our Vision Card */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-primary-600/40 transition-all duration-300 flex flex-col justify-between group h-full">
            <div>
              <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-serif text-primary-700 mb-4 group-hover:text-primary-600 transition-colors">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                To be a premier center of excellence for traditional Indian medicine, recognized globally for restoring health organically and spreading awareness about the profound healing potential of Siddha and Ayurveda.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MissionVision;
