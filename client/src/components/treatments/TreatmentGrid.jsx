import React, { useState, useEffect } from 'react';
import TreatmentCard from './TreatmentCard';
import { getTreatments } from '../../services/treatmentService';

// Comprehensive clinic treatments catalog
const defaultTreatments = [
  { id: 'gastritis', slug: 'gastritis', name: 'Gastritis & Ulcer', category: 'Gastrointestinal', icon: '🌿', desc: 'Natural relief for acidity, inflammation, and ulcers.' },
  { id: 'ibs', slug: 'ibs', name: 'Irritable Bowel Syndrome', category: 'Gastrointestinal', icon: '🍃', desc: 'Holistic management of digestion and bowel irregularity.' },
  { id: 'psoriasis', slug: 'psoriasis', name: 'Psoriasis & Eczema', category: 'Dermatology', icon: '✨', desc: 'Deep cellular healing for chronic skin conditions.' },
  { id: 'pcos', slug: 'pcos', name: 'PCOS & Menstrual Disorders', category: 'Women\'s Health', icon: '🌸', desc: 'Hormonal balancing through natural remedies.' },
  { id: 'arthritis', slug: 'arthritis', name: 'Arthritis & Joint Pain', category: 'Musculoskeletal', icon: '🦴', desc: 'Pain relief and cartilage health restoration.' },
  { id: 'kidney-stones', slug: 'kidney-stones', name: 'Kidney Stones', category: 'Kidney', icon: '💧', desc: 'Dissolving and expelling renal stones naturally.' },
  { id: 'asthma', slug: 'asthma', name: 'Asthma & Bronchitis', category: 'Respiratory', icon: '🫁', desc: 'Enhancing lung capacity and clearing airways.' },
  { id: 'migraine', slug: 'migraine', name: 'Migraine & Neurology', category: 'Neurology', icon: '🧠', desc: 'Nervous system soothing and trigger management.' },
  { id: 'piles', slug: 'piles', name: 'Piles, Fissure, Fistula', category: 'Anorectal', icon: '⚕️', desc: 'Non-surgical traditional interventions.' },
  { id: 'diabetes', slug: 'diabetes', name: 'Diabetes Management', category: 'Other', icon: '🩸', desc: 'Blood sugar regulation and metabolic correction.' }
];

const TreatmentGrid = ({ searchTerm, activeCategory }) => {
  const [items, setItems] = useState(defaultTreatments);

  useEffect(() => {
    const categoryParam = activeCategory === 'All' ? undefined : activeCategory;
    getTreatments(categoryParam)
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(t => {
            const def = defaultTreatments.find(d => d.slug === t.slug || d.name.toLowerCase() === t.name.toLowerCase()) || {};
            return {
              id: t._id || t.id || t.slug || def.id,
              slug: t.slug || def.slug || t._id,
              name: t.name,
              category: t.category,
              desc: t.description || def.desc,
              icon: t.icon || def.icon || '🌿'
            };
          });
          setItems(mapped);
        } else {
          setItems(defaultTreatments);
        }
      })
      .catch(() => {
        setItems(defaultTreatments);
      });
  }, [activeCategory]);

  const filtered = items.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No treatments found matching your criteria. Try adjusting your search or category filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
      {filtered.map(treatment => (
        <TreatmentCard key={treatment.id || treatment.slug} treatment={treatment} />
      ))}
    </div>
  );
};

export default TreatmentGrid;
