import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Award, HeartPulse } from 'lucide-react';
import Container from '../common/Container';
import CountUp from '../common/CountUp';

const stats = [
  { icon: Award, count: '21+', label: 'Years of Clinical Experience' },
  { icon: Users, count: '500+', label: 'Patients Treated Every Month' },
  { icon: HeartPulse, count: '2', label: 'Expert Doctors' },
  { icon: Activity, count: '13', label: 'Specialized Services' }
];

const TrustStats = () => {
  return (
    <section className="bg-gradient-to-r from-[#144979] via-[#0C294A] to-[#071A2F] py-16 text-white shadow-inner relative z-10">
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
                  <Icon className="w-10 h-10 text-[#38BDF8]" />
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-2 text-white drop-shadow-md">
                  <CountUp value={stat.count} delay={index * 0.15} duration={2} />
                </div>
                <div className="text-[#E0EFFB] text-xs sm:text-sm md:text-base uppercase tracking-wider font-medium leading-snug drop-shadow-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default TrustStats;
