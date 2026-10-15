import React from 'react';

const categories = [
  'All', 'Gastrointestinal', 'Dermatology', "Women's Health", 'Kidney', 
  'Musculoskeletal', 'Pediatrics', 'Respiratory', 'Neurology', 'Anorectal', "Men's Health", 'Other'
];

const TreatmentCategory = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat 
              ? 'bg-primary-700 text-white' 
              : 'bg-white text-gray-600 hover:bg-sage border border-transparent'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default TreatmentCategory;
