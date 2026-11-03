import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Activity, Apple, Heart } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

const features = [
  {
    number: '01',
    icon: Pill,
    title: '1. Internal Medicines',
    desc: 'Individualised Siddha and Ayurvedic medical interventions, integrating the depth of traditional medical wisdom with contemporary clinical expertise to address a diverse spectrum of health conditions.'
  },
  {
    number: '02',
    icon: Activity,
    title: '2. Varmam & External Therapies',
    desc: 'A comprehensive integration of traditional Varmam techniques and specialised external therapeutic modalities, aimed at alleviating pain, enhancing musculoskeletal mobility and restoring functional well-being.'
  },
  {
    number: '03',
    icon: Apple,
    title: '3. Diet, Pathiyam & Nutrition',
    desc: 'Personalised dietary prescriptions and nutritional interventions, founded on the principles of Siddha and Ayurveda, harmonising individual health requirements with contemporary nutritional science.'
  },
  {
    number: '04',
    icon: Heart,
    title: '4. Yoga, Lifestyle & Rehabilitation',
    desc: 'A holistic integration of yogic practices, therapeutic movement and evidence-informed lifestyle interventions to optimise functional capacity, facilitate rehabilitation and sustain long-term health.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-sage">
      <Container>
        <SectionTitle 
          title="Why Choose Us" 
          subtitle="Experience the difference of authentic traditional medicine."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                      <Icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-2xl font-serif font-bold text-primary-200 group-hover:text-gold transition-colors">
                      {feature.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-primary-700 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
