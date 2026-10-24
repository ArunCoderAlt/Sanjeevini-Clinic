import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const imageMap = {
  'Gastrointestinal': '/images/treatments/digestive.jpg',
  'Dermatology': '/images/treatments/skin.jpg',
};

const TreatmentCard = ({ treatment }) => {
  const imgSrc = treatment.image || imageMap[treatment.category];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <Link
        to={`/treatments/${treatment.slug || treatment.id}`}
        className="block bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-sage h-full group overflow-hidden"
      >
        {imgSrc ? (
          <div className="aspect-[16/10] overflow-hidden relative">
            <img
              src={imgSrc}
              alt={`${treatment.name} — ${treatment.category}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-sage/40 flex items-center justify-center">
            <span className="text-4xl" aria-label="Treatment icon">{treatment.icon}</span>
          </div>
        )}
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            {!imgSrc && <span className="text-3xl">{treatment.icon}</span>}
            <span className="bg-sage text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{treatment.category}</span>
          </div>
          <h3 className="text-xl font-serif text-primary-700 mb-3 group-hover:text-primary-600 transition-colors">{treatment.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{treatment.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default TreatmentCard;
