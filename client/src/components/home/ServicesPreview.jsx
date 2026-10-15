import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Activity, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';

const services = [
  { id: 'varmam', slug: 'varmam-therapy', icon: Activity, title: 'Varmam Therapy', desc: 'Traditional therapeutic technique targeting vital energy points for pain relief and healing.', img: '/images/services/varmam.jpg' },
  { id: 'thokkanam', slug: 'thokkanam-therapy', icon: HeartHandshake, title: 'Thokkanam Therapy', desc: 'Traditional Siddha physical therapy and massage for neurological and musculoskeletal issues.', img: '/images/services/thokkanam.jpg' },
  { id: 'wellness', slug: 'wellness-support', icon: Leaf, title: 'Wellness Support', desc: 'Holistic wellness, diet planning, and preventive care programs.', img: '/images/services/wellness.jpg' }
];

const ServicesPreview = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <SectionTitle 
          title="Our Core Services" 
          subtitle="Authentic treatments rooted in ancient Indian medicine systems."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12 max-w-5xl mx-auto">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-sage hover:border-primary-600 transition-colors overflow-hidden flex flex-col h-full"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary-700" />
                  </div>
                  <h3 className="text-xl font-serif text-primary-700 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{service.desc}</p>
                  <Link to={`/services/${service.slug}`} className="text-gold font-medium hover:text-primary-600 transition-colors mt-auto inline-flex items-center">
                    Learn More <span className="ml-2">→</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center">
          <Button to="/services" variant="outline">
            View All Services
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default ServicesPreview;
