import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

const ServiceCard = ({ service }) => {
  const [imgError, setImgError] = useState(false);
  const Icon = Icons[service.iconName] || Icons.Activity;
  const imgSrc = service.image && !imgError ? getImageUrl(service.image) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-sm border border-sage hover:border-primary-600 hover:shadow-xl transition-all duration-300 flex flex-col h-full group overflow-hidden"
    >
      {imgSrc && (
        <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
          <img
            src={imgSrc}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="p-8 flex flex-col flex-grow justify-between">
        <div>
          {!imgSrc && (
            <div className="w-16 h-16 bg-sage rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
              <Icon className="w-8 h-8 text-primary-700 group-hover:text-white transition-colors" />
            </div>
          )}
          <h3 className="text-2xl font-serif text-primary-700 mb-3 group-hover:text-primary-800 transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
            {service.desc}
          </p>
        </div>

        <Link
          to={`/services/${service.slug || service.id}`}
          className="text-gold font-medium hover:text-primary-600 transition-colors mt-auto inline-flex items-center text-base sm:text-lg font-semibold"
        >
          Explore <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
