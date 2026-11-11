import React, { useState, useEffect } from 'react';
import TreatmentCard from './TreatmentCard';
import { getTreatments } from '../../services/treatmentService';

// Comprehensive clinic treatments catalog
const defaultTreatments = [
  { id: 'gastritis', slug: 'gastrointestinal', name: 'Gastrointestinal Treatments - வயிறு / குடல் சார்ந்த நோய்கள்', category: 'Gastrointestinal', icon: '🌿', desc: 'Holistic treatments for Gastrointestinal conditions.', image: '/uploads/GlowingGlassGastrointestinalSystem-1794425513998-591383.png' },
  { id: 'dermatology', slug: 'dermatology', name: 'Dermatology Treatments - தோல் நோய்கள்', category: 'Dermatology', icon: '✨', desc: 'Holistic treatments for Dermatology conditions.' },
  { id: 'womens-health', slug: 'womens-health', name: 'Women\'s Health Treatments', category: 'Women\'s Health', icon: '🌸', desc: 'Holistic treatments for Women\'s Health conditions.' },
  { id: 'kidney', slug: 'kidney', name: 'Kidney Treatments', category: 'Kidney', icon: '💧', desc: 'Holistic treatments for Kidney conditions.' },
  { id: 'musculoskeletal', slug: 'musculoskeletal', name: 'Musculoskeletal Treatments', category: 'Musculoskeletal', icon: '🦴', desc: 'Holistic treatments for Musculoskeletal conditions.' },
  { id: 'pediatrics', slug: 'pediatrics', name: 'Pediatrics Treatments', category: 'Pediatrics', icon: '👶', desc: 'Holistic treatments for Pediatrics conditions.' },
  { id: 'respiratory', slug: 'respiratory', name: 'Respiratory Treatments', category: 'Respiratory', icon: '🫁', desc: 'Holistic treatments for Respiratory conditions.' },
  { id: 'neurology', slug: 'neurology', name: 'Neurology Treatments', category: 'Neurology', icon: '🧠', desc: 'Holistic treatments for Neurology conditions.' },
  { id: 'anorectal', slug: 'anorectal', name: 'Anorectal Treatments', category: 'Anorectal', icon: '⚕️', desc: 'Holistic treatments for Anorectal conditions.' },
  { id: 'mens-health', slug: 'mens-health', name: 'Men\'s Health Treatments', category: 'Men\'s Health', icon: '⚡', desc: 'Holistic treatments for Men\'s Health conditions.' },
  { id: 'other', slug: 'other', name: 'Other Treatments', category: 'Other', icon: '🌿', desc: 'Holistic treatments for general wellness.' }
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
            const def = defaultTreatments.find(d => d.slug === t.slug || d.category?.toLowerCase() === t.category?.toLowerCase() || d.name.toLowerCase() === t.name.toLowerCase()) || {};
            return {
              id: t._id || t.id || t.slug || def.id,
              slug: t.slug || def.slug || t._id,
              name: t.name || def.name,
              category: t.category || def.category,
              desc: t.description || t.desc || def.desc,
              icon: t.icon || def.icon || '🌿',
              image: t.image || def.image || null,
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
