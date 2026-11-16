import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { getImageUrl, getDefaultServiceImage, isValidImage } from '../../utils/helpers';

const ServiceCard = ({ service }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [service?.image]);

  const Icon = Icons[service?.iconName] || Icons.Activity;
  const fallbackImg = getDefaultServiceImage(service);
  const activeImg = !imgError && isValidImage(service?.image) ? service.image : fallbackImg;
  const imgSrc = getImageUrl(activeImg) || fallbackImg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200/80 hover:border-primary-600 hover:shadow-xl transition-all duration-300 flex flex-col h-full group overflow-hidden"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
        <img
          src={imgSrc}
          alt={service?.title || 'Clinic Service'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={() => {
            if (!imgError) {
              setImgError(true);
            }
          }}
        />
      </div>

      <div className="p-8 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-2xl font-serif text-primary-700 mb-3 group-hover:text-primary-800 transition-colors font-bold">
            {service?.title}
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3 text-sm sm:text-base">
            {service?.desc}
          </p>
        </div>

        <Link
          to={`/services/${service?.slug || service?.id}`}
          className="text-gold font-medium hover:text-primary-600 transition-colors mt-auto inline-flex items-center text-base sm:text-lg font-semibold"
        >
          Explore <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
