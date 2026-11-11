import React from 'react';

const categories = [
  'All', 'Gastrointestinal', 'Dermatology', "Women's Health", 'Kidney', 
  'Musculoskeletal', 'Pediatrics', 'Respiratory', 'Neurology', 'Anorectal', "Men's Health", 'Other'
];

const TreatmentCategory = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            activeCategory === cat 
              ? 'bg-primary-700 text-white shadow-sm' 
              : 'bg-white text-gray-600 hover:bg-sage border border-slate-200/70'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default TreatmentCategory;
