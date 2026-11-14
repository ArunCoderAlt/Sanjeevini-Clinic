import React, { useState } from 'react';
import { Activity, Stethoscope, Sparkles } from 'lucide-react';
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

const TreatmentDetails = ({ treatment }) => {
  const [imgError, setImgError] = useState(false);
  if (!treatment) return null;

  const hasRealImage = !isMockImage(treatment.image);
  const displayImage = hasRealImage ? getImageUrl(treatment.image) : null;
  const hasSymptoms = Array.isArray(treatment.symptoms) && treatment.symptoms.length > 0;
  const hasApproaches = Array.isArray(treatment.approaches) && treatment.approaches.length > 0;

  const cleanName = (treatment.name || '').replace(/\.jl\s*fine/gi, '').trim();
  const cleanDesc = (treatment.description || treatment.desc || '')
    .replace(/\.jl\s*fine/gi, '')
    .trim();

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-8 md:p-12 max-w-4xl mx-auto border border-slate-200/80">
      {displayImage && !imgError && (
        <div className="aspect-[16/10] sm:aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-md bg-slate-100">
          <img
            src={displayImage}
            alt={`${cleanName} illustration`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block bg-[#E3EFF9] text-[#0C2B4B] px-4 py-1.5 rounded-full text-sm font-bold">
          {treatment.category}
        </span>
        {treatment.icon && (
          <span className="text-2xl" role="img" aria-label="Icon">
            {treatment.icon}
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-5xl font-serif text-[#0C2B4B] mb-6 leading-tight">
        {cleanName}
      </h1>

      {cleanDesc && (
        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
          {cleanDesc}
        </p>
      )}

      <div className="flex flex-col gap-6 md:gap-8">
        {hasSymptoms && (
          <div className="p-6 md:p-8 bg-[#F0F6FC] rounded-2xl border border-[#D5E5F5]">
            <h3 className="text-xl font-serif text-[#0C2B4B] flex items-center mb-5 font-bold">
              <Stethoscope className="w-6 h-6 mr-3 text-[#144979] shrink-0" />
              Common Conditions Addressed
            </h3>
            <ul className="space-y-3.5">
              {treatment.symptoms.map((sym, idx) => (
                <li key={idx} className="flex items-start text-gray-700 text-sm md:text-base">
                  <span className="w-2 h-2 bg-[#144979] rounded-full mt-2 mr-3 shrink-0" />
                  <span className="leading-snug">{sym.replace(/\.jl\s*fine/gi, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasApproaches && (
          <div className="p-6 md:p-8 bg-[#F0F6FC] rounded-2xl border border-[#D5E5F5]">
            <h3 className="text-xl font-serif text-[#0C2B4B] flex items-center mb-5 font-bold">
              <Activity className="w-6 h-6 mr-3 text-[#144979] shrink-0" />
              Traditional Healing Approach
            </h3>
            <ul className="space-y-3.5">
              {treatment.approaches.map((app, idx) => (
                <li key={idx} className="flex items-start text-gray-700 text-sm md:text-base">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 shrink-0" />
                  <span className="leading-snug">{app}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentDetails;