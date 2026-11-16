import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import { useTreatments } from '../../hooks/useQueries';
import { getImageUrl } from '../../utils/helpers';

const categoryIcons = {
  'Gastrointestinal': '🌿',
  'Dermatology': '✨',
  "Women's Health": '🌸',
  'Musculoskeletal': '🦴',
  'Neurology': '🧠',
  'Respiratory': '🫁',
  'Kidney': '💧',
  'Pediatrics': '👶',
  'Anorectal': '⚕️',
  "Men's Health": '⚡',
  'Other': '🌿',
};

const defaultCategories = [
  { name: 'Gastrointestinal', count: 5, icon: '🌿', image: '/uploads/GlowingGlassGastrointestinalSystem-1794425513998-591383.png' },
  { name: 'Dermatology', count: 6, icon: '✨', image: '/uploads/dermatology-treatment-1794426000000.png' },
  { name: "Women's Health", count: 4, icon: '🌸', image: null },
  { name: 'Musculoskeletal', count: 4, icon: '🦴', image: '/uploads/musculoskeletal-treatment-1794426000000.png' },
  { name: 'Kidney', count: 4, icon: '💧', image: null },
  { name: 'Pediatrics', count: 4, icon: '👶', image: null }
];

const TreatmentsPreview = () => {
  const { data: rawTreatments } = useTreatments();

  const categories = useMemo(() => {
    if (!rawTreatments) return defaultCategories;
    if (Array.isArray(rawTreatments) && rawTreatments.length === 0) return [];

    const map = new Map();
    rawTreatments.forEach((t) => {
      if (!t.category) return;
      const existing = map.get(t.category);
      const count = (existing?.count || 0) + 1;
      const image = existing?.image || t.image || null;
      map.set(t.category, { count, image });
    });

    if (map.size === 0) return [];

    return Array.from(map.entries()).slice(0, 6).map(([name, data]) => ({
      name,
      count: data.count,
      image: data.image,
      icon: categoryIcons[name] || '🌿'
    }));
  }, [rawTreatments]);

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif text-primary-700 mb-4">Specialized Treatments</h2>
            <p className="text-gray-600">We offer specialized care for a wide range of chronic and acute conditions using natural formulations.</p>
          </div>
          <Button to="/treatments" variant="primary" className="whitespace-nowrap">
            View All Treatments
          </Button>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto my-8">
            <p className="text-slate-600 text-sm">Treatment protocols are currently being updated. Please contact the clinic for direct condition consultations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const imgSrc = cat.image ? getImageUrl(cat.image) : null;
              return (
                <motion.div
                  key={cat.name || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <Link
                    to={`/treatments?category=${encodeURIComponent(cat.name)}`}
                    className="block bg-white hover:bg-primary-50/50 rounded-2xl border border-slate-200/80 hover:border-primary-500/40 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden h-full flex flex-col justify-between"
                  >
                    <div>
                      {imgSrc ? (
                        <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                          <img
                            src={imgSrc}
                            alt={`${cat.name} Care`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="text-xs font-semibold text-[#0C2B4B] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-white/60">
                              {cat.count} {cat.count === 1 ? 'Condition' : 'Conditions'}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      <div className="p-6">
                        {!imgSrc && (
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">{cat.icon}</span>
                            <span className="text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                              {cat.count} {cat.count === 1 ? 'Condition' : 'Conditions'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-serif text-primary-700 group-hover:text-primary-600 transition-colors">
                            {cat.name} Care
                          </h3>
                          {imgSrc && (
                            <span className="text-2xl" role="img" aria-label={cat.name}>
                              {cat.icon}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 flex items-center text-primary-600 font-semibold text-sm group-hover:text-primary-700">
                      <span>Explore Conditions</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
};

export default TreatmentsPreview;
