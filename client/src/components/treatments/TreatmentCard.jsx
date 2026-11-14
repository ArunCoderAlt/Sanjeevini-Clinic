import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

const isMockImage = (img) => {
  if (!img || typeof img !== 'string') return true;
  // Authentically uploaded files and Supabase Storage URLs are never mock images
  if (img.startsWith('/uploads/') || img.includes('supabase.co') || img.startsWith('data:') || img.startsWith('blob:')) {
    return false;
  }
  const lower = img.toLowerCase();
  return (
    lower.includes('unsplash.com') ||
    lower.includes('treatment-5f825.jpg') ||
    lower.includes('placeholder')
  );
};

const TreatmentCard = ({ treatment }) => {
  const [imgError, setImgError] = useState(false);
  const hasRealImage = !isMockImage(treatment.image);
  const imgSrc = hasRealImage ? getImageUrl(treatment.image) : null;

  // Sanitize any mock artifacts from title or description
  const cleanTitle = (treatment.name || '').replace(/\.jl\s*fine/gi, '').trim();
  const cleanDesc = (treatment.desc || treatment.description || '')
    .replace(/\.jl\s*fine/gi, '')
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Link
        to={`/treatments/${treatment.slug || treatment.id}`}
        className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 hover:border-[#144979]/40 h-full flex flex-col justify-between group overflow-hidden"
      >
        {imgSrc && !imgError && (
          <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
            <img
              src={imgSrc}
              alt={`${cleanTitle} — ${treatment.category}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between">
          <div>
            {imgSrc ? (
              <div className="mb-3 sm:mb-4">
                <span className="bg-[#E3EFF9] text-[#0C2B4B] text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full inline-block">
                  {treatment.category}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E8F2FA] text-[#0C2B4B] flex items-center justify-center text-xl sm:text-2xl shadow-xs group-hover:scale-105 transition-transform">
                  <span role="img" aria-label={treatment.category || 'Treatment'}>
                    {treatment.icon || '🌿'}
                  </span>
                </div>
                <span className="bg-[#E3EFF9] text-[#0C2B4B] text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {treatment.category}
                </span>
              </div>
            )}

            <h3 className="text-lg sm:text-xl font-serif text-[#0C2B4B] font-bold mb-2 sm:mb-3 group-hover:text-[#144979] transition-colors leading-snug">
              {cleanTitle}
            </h3>

            {cleanDesc && (
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 sm:mb-6">
                {cleanDesc}
              </p>
            )}
          </div>

          <div className="pt-3 sm:pt-4 border-t border-slate-100 mt-auto flex items-center text-[#144979] font-semibold text-xs sm:text-sm group-hover:text-[#0C2B4B]">
            <span>Explore Treatment</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TreatmentCard;