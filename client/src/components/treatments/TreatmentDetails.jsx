import React from 'react';
import { CheckCircle2, HeartPulse, Activity, Stethoscope } from 'lucide-react';

const imageMap = {
  'Gastrointestinal': '/images/treatments/digestive.jpg',
  'Dermatology': '/images/treatments/skin.jpg',
};

const TreatmentDetails = ({ treatment }) => {
  if (!treatment) return null;

  const displayImage = treatment.image || imageMap[treatment.category] || '/images/treatments/digestive.jpg';

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
      
      <div className="grid md:grid-cols-2 gap-12 mb-10">
        {treatment.conditions && treatment.conditions.length > 0 && (
          <div>
            <h3 className="text-xl font-serif text-primary-700 flex items-center mb-4">
              <HeartPulse className="w-6 h-6 mr-2 text-primary-600" />
              Common Conditions
            </h3>
            <ul className="space-y-3">
              {treatment.conditions.map((cond, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-gold mr-3 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {treatment.approaches && treatment.approaches.length > 0 && (
          <div>
            <h3 className="text-xl font-serif text-primary-700 flex items-center mb-4">
              <Activity className="w-6 h-6 mr-2 text-primary-600" />
              Treatment Approach
            </h3>
            <ul className="space-y-3">
              {treatment.approaches.map((app, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 shrink-0"></div>
                  <span className="text-gray-700">{app}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {treatment.symptoms && treatment.symptoms.length > 0 && (
        <div className="mb-10 p-6 bg-sage/40 rounded-2xl border border-sage">
          <h3 className="text-xl font-serif text-primary-700 flex items-center mb-4">
            <Stethoscope className="w-6 h-6 mr-2 text-primary-600" />
            Common Symptoms
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {treatment.symptoms.map((sym, idx) => (
              <li key={idx} className="flex items-center text-gray-700 text-sm">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2.5 shrink-0" />
                <span>{sym}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="p-6 bg-cream rounded-2xl border border-sage">
        <h4 className="font-serif text-lg text-primary-700 mb-2">Our Healing Philosophy & Description</h4>
        <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
          {treatment.description ||
            `At Sanjeevini, we do not just treat the disease; we treat the patient. For ${treatment.name}, our doctors utilize specialized Siddha and Ayurveda diagnostic tools to uncover the root cause. A personalized care plan is then developed involving pure herbal formulations, targeted therapies like Varmam, and lifestyle modifications to ensure lasting health.`}
        </p>
      </div>
    </div>
  );
};

export default TreatmentDetails;
