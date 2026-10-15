import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Stethoscope, Droplets, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

const features = [
  { icon: Stethoscope, title: 'Experienced Doctors', desc: 'Expert practitioners with over 15 years in Siddha and Ayurveda.' },
  { icon: Heart, title: 'Personalized Treatment', desc: 'Care plans tailored to your unique doshas and constitution.' },
  { icon: Leaf, title: 'Natural Remedies', desc: '100% natural, herb-based medicines with no side effects.' },
  { icon: Sparkles, title: 'Holistic Approach', desc: 'Treating the root cause, not just masking the symptoms.' },
  { icon: Droplets, title: 'Authentic Therapies', desc: 'Traditional Varmam and Thokkanam therapies performed accurately.' },
  { icon: ShieldCheck, title: 'Proven Results', desc: 'Successfully treated thousands of patients with chronic ailments.' }
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-sage">
      <Container>
        <SectionTitle 
          title="Why Choose Us" 
          subtitle="Experience the difference of authentic traditional medicine."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                  <Icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-serif text-primary-700 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
