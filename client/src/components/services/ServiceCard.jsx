import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

const ServiceCard = ({ service }) => {
  const Icon = Icons[service.iconName] || Icons.Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-3xl shadow-sm border border-sage hover:border-primary-600 hover:shadow-md transition-all duration-300 flex flex-col h-full group"
    >
      <div className="w-16 h-16 bg-sage rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
        <Icon className="w-8 h-8 text-primary-700 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-serif text-primary-700 mb-4">{service.title}</h3>
      <p className="text-gray-600 mb-8 flex-grow leading-relaxed">{service.desc}</p>
      <Link to={`/services/${service.slug || service.id}`} className="text-gold font-medium hover:text-primary-600 transition-colors mt-auto inline-flex items-center text-lg">
        Explore <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
