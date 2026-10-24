import React from 'react';
import { Award, Users, Heart, Shield } from 'lucide-react';
import Container from '../common/Container';
import CountUp from '../common/CountUp';

const stats = [
  { icon: Award, label: 'Years of Excellence', value: '15+' },
  { icon: Users, label: 'Happy Patients', value: '10,000+' },
  { icon: Heart, label: 'Therapies Performed', value: '5,000+' },
  { icon: Shield, label: 'Organic Herbs Used', value: '250+' }
];

const Experience = () => {
  return (
    <section className="py-24 bg-primary-700 text-white">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                  <CountUp value={stat.value} delay={idx * 0.15} duration={2} />
                </h3>
                <p className="text-sage text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Experience;
