import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Award, HeartPulse } from 'lucide-react';
import Container from '../common/Container';
import CountUp from '../common/CountUp';

const stats = [
  { icon: Award, count: '15+', label: 'Years Experience' },
  { icon: Users, count: '10,000+', label: 'Patients Treated' },
  { icon: HeartPulse, count: '2', label: 'Expert Doctors' },
  { icon: Activity, count: '4', label: 'Specialized Services' }
];

const TrustStats = () => {
  return (
    <section className="bg-primary-600 py-16 text-white shadow-inner relative z-10">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <Icon className="w-10 h-10 text-gold" />
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-2 text-white drop-shadow-sm">
                  <CountUp value={stat.count} delay={index * 0.15} duration={2} />
                </div>
                <div className="text-white/90 text-sm md:text-base uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default TrustStats;
