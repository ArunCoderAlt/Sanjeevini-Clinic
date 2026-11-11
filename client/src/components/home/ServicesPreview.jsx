import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Activity, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';

const services = [
  { 
    id: 'varmam', 
    slug: 'varmam-therapy', 
    icon: Activity, 
    title: 'Varmam Therapy', 
    desc: 'Traditional Siddha therapeutic technique targeting vital energy points (Varmam) to release trapped energy, restore neuromuscular pathways, and relieve chronic pain.' 
  },
  { 
    id: 'thokkanam', 
    slug: 'thokkanam-therapy', 
    icon: HeartHandshake, 
    title: 'Thokkanam Therapy', 
    desc: 'Classical physical manipulation and traditional medicated herbal oil body therapy for neurological recovery, joint mobility, and musculoskeletal restoration.' 
  },
  { 
    id: 'wellness', 
    slug: 'wellness-support', 
    icon: Leaf, 
    title: 'Holistic Wellness Support', 
    desc: 'Comprehensive preventive health programs including personalized dietary counseling (Pathya Aaharam), seasonal cleansing regimens, and herbal rejuvenatives.' 
  }
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
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 hover:border-[#144979]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="w-16 h-16 bg-[#E8F2FA] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#144979] transition-colors">
                    <Icon className="w-8 h-8 text-[#144979] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-serif text-[#0C2B4B] font-bold mb-3.5 group-hover:text-[#144979] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <Link 
                    to={`/services/${service.slug}`} 
                    className="text-[#144979] font-semibold hover:text-[#0C2B4B] transition-colors inline-flex items-center text-sm"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center">
          <Button to="/services" variant="outline" className="px-8 py-3.5 rounded-full font-medium shadow-xs">
            View All Services
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default ServicesPreview;