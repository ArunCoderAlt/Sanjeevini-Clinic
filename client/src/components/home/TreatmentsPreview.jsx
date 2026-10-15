import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';

const categories = [
  { name: 'Gastrointestinal', count: 5, icon: '🌿' },
  { name: 'Dermatology', count: 6, icon: '✨' },
  { name: 'Women\'s Health', count: 4, icon: '🌸' },
  { name: 'Musculoskeletal', count: 4, icon: '🦴' },
  { name: 'Neurology', count: 4, icon: '🧠' },
  { name: 'Respiratory', count: 4, icon: '🫁' }
];

const TreatmentsPreview = () => {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif text-primary-700 mb-4">Specialized Treatments</h2>
            <p className="text-gray-600">We offer specialized care for a wide range of chronic and acute conditions using natural formulations.</p>
          </div>
          <Button to="/treatments" variant="primary" className="whitespace-nowrap">
            View All Treatments
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/treatments?category=${cat.name}`} className="block bg-sage/30 hover:bg-sage p-6 rounded-2xl transition-colors group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-primary-600 bg-white px-3 py-1 rounded-full">{cat.count} Conditions</span>
                </div>
                <h3 className="text-xl font-serif text-primary-700 group-hover:text-primary-600">{cat.name} Care</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TreatmentsPreview;
