import React from 'react';
import { Activity, Stethoscope } from 'lucide-react';

const imageMap = {
  'Gastrointestinal': '/images/treatments/digestive.jpg',
  'Dermatology': '/images/treatments/skin.jpg',
};

const TreatmentDetails = ({ treatment }) => {
  if (!treatment) return null;

  const displayImage = treatment.image || imageMap[treatment.category] || '/images/treatments/digestive.jpg';
  const hasSymptoms = Array.isArray(treatment.symptoms) && treatment.symptoms.length > 0;
  const hasApproaches = Array.isArray(treatment.approaches) && treatment.approaches.length > 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 max-w-4xl mx-auto">
      {displayImage && (
        <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-md">
          <img
            src={displayImage}
            alt={`${treatment.name} illustration`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="inline-block bg-sage text-primary-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
        {treatment.category}
      </div>
      <h1 className="text-3xl md:text-5xl font-serif text-primary-700 mb-8">{treatment.name}</h1>

      <div className={`grid grid-cols-1 ${hasSymptoms && hasApproaches ? 'md:grid-cols-2' : ''} gap-6 md:gap-8`}>
        {hasSymptoms && (
          <div className="p-6 md:p-8 bg-sage/40 rounded-2xl border border-sage flex flex-col h-full">
            <h3 className="text-xl font-serif text-primary-700 flex items-center mb-5">
              <Stethoscope className="w-6 h-6 mr-3 text-primary-600 shrink-0" />
              Common Symptoms
            </h3>
            <ul className="space-y-3.5 flex-1">
              {treatment.symptoms.map((sym, idx) => (
                <li key={idx} className="flex items-start text-gray-700 text-sm md:text-base">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 shrink-0" />
                  <span className="leading-snug">{sym}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasApproaches && (
          <div className="p-6 md:p-8 bg-sage/40 rounded-2xl border border-sage flex flex-col h-full">
            <h3 className="text-xl font-serif text-primary-700 flex items-center mb-5">
              <Activity className="w-6 h-6 mr-3 text-primary-600 shrink-0" />
              Treatment Approach
            </h3>
            <ul className="space-y-3.5 flex-1">
              {treatment.approaches.map((app, idx) => (
                <li key={idx} className="flex items-start text-gray-700 text-sm md:text-base">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 shrink-0" />
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
