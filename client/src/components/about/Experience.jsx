import React from 'react';
import { Award, Users, Heart, Shield, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import CountUp from '../common/CountUp';

const stats = [
  { icon: Award, label: 'Years of Excellence', value: '21+' },
  { icon: Users, label: 'Patients Treated Monthly', value: '500+' },
  { icon: Heart, label: 'Therapies Performed', value: '500+' },
  { icon: Shield, label: 'Organic Herbs Used', value: '250+' },
  { icon: Sparkles, label: 'Traditional Systems', value: '2' }
];

const Experience = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-[#144979] via-[#0C294A] to-[#071A2F] text-white shadow-inner">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const isLastOnMobile = idx === stats.length - 1;
            return (
              <div 
                key={idx} 
                className={`text-center ${isLastOnMobile ? 'col-span-2 md:col-span-1 max-w-[220px] mx-auto' : ''}`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3 sm:mb-6">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#38BDF8]" />
                </div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-1.5 sm:mb-2 text-white drop-shadow-md">
                  <CountUp value={stat.value} delay={idx * 0.15} duration={2} />
                </h3>
                <p className="text-[#E0EFFB] text-xs sm:text-sm uppercase tracking-wider font-medium leading-relaxed">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Experience;
