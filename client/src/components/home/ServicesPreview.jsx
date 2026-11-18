import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Activity, HeartHandshake, ArrowRight, HeartPulse, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import { useServices } from '../../hooks/useQueries';
import { getImageUrl, getDefaultServiceImage, isValidImage } from '../../utils/helpers';

const defaultServices = [
  { 
    id: 'varmam', 
    slug: 'varmam-therapy', 
    icon: Activity, 
    title: 'Varmam Therapy', 
    desc: 'Traditional Siddha therapeutic technique targeting vital energy points (Varmam) to release trapped energy, restore neuromuscular pathways, and relieve chronic pain.',
    image: '/images/hero/slide-4.png'
  },
  { 
    id: 'thokkanam', 
    slug: 'thokkanam-therapy', 
    icon: HeartHandshake, 
    title: 'Thokkanam Therapy', 
    desc: 'Classical physical manipulation and traditional medicated herbal oil body therapy for neurological recovery, joint mobility, and musculoskeletal restoration.',
    image: '/images/hero/slide-3.png'
  },
  { 
    id: 'wellness', 
    slug: 'wellness-support', 
    icon: Leaf, 
    title: 'Holistic Wellness Support', 
    desc: 'Comprehensive preventive health programs including personalized dietary counseling (Pathya Aaharam), seasonal cleansing regimens, and herbal rejuvenatives.',
    image: '/images/hero/slide-1.png'
  }
];

const iconMap = {
  Leaf,
  Activity,
  HeartHandshake,
  HeartPulse,
  Sparkles,
  varmam: Activity,
  thokkanam: HeartHandshake,
  wellness: Leaf
};

const ServicesPreview = () => {
  const { data: rawServices } = useServices();
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    setImgErrors({});
  }, [rawServices]);

  const services = useMemo(() => {
    if (!rawServices) return defaultServices;
    if (Array.isArray(rawServices) && rawServices.length === 0) return [];

    const filtered = rawServices.filter(s => s.slug !== 'consultation');
    if (filtered.length === 0) return [];

    return filtered.slice(0, 3).map((s) => {
      const slugKey = String(s.slug || '').toLowerCase();
      const def = defaultServices.find(d => 
        d.slug === slugKey || 
        d.id === slugKey || 
        slugKey.includes(d.id) || 
        d.slug.includes(slugKey) ||
        s.title?.toLowerCase().includes(d.id)
      ) || {};
      const IconComponent = iconMap[s.icon] || iconMap[s.slug] || def.icon || Activity;
      const fallbackImg = def.image || getDefaultServiceImage(s);
      const validImage = isValidImage(s.image) ? s.image : fallbackImg;

      return {
        id: s._id || s.id || def.id,
        slug: s.slug || def.slug,
        icon: IconComponent,
        title: s.title,
        desc: s.shortDescription || s.description || def.desc,
        image: validImage,
      };
    });
  }, [rawServices]);

  return (
    <section className="py-24 bg-cream">
      <Container>
        <SectionTitle 
          title="Our Core Services" 
          subtitle="Authentic treatments rooted in ancient Indian medicine systems."
        />
        
        {services.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto my-12">
            <p className="text-slate-600 text-sm">Services are currently being updated. Please contact the clinic for direct consultation and therapy options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12 max-w-5xl mx-auto">
            {services.map((service, idx) => {
              const fallbackImg = getDefaultServiceImage(service);
              const hasError = imgErrors[service.id || idx];
              const displayImg = !hasError && isValidImage(service.image)
                ? (getImageUrl(service.image) || fallbackImg)
                : fallbackImg;

              return (
                <motion.div
                  key={service.slug || service.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 hover:border-[#144979]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full overflow-hidden"
                >
                  <div>
                    <div className="aspect-[16/10] -mx-8 -mt-8 mb-6 overflow-hidden bg-slate-100 relative">
                      <img
                        src={displayImg}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                          if (!hasError) {
                            setImgErrors(prev => ({ ...prev, [service.id || idx]: true }));
                          }
                        }}
                      />
                    </div>

                    <h3 className="text-2xl font-serif text-[#0C2B4B] font-bold mb-3.5 group-hover:text-[#144979] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed line-clamp-3">
                      {service.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Link 
                      to={`/services/${service.slug}`} 
                      className="text-dark-blue-gradient font-semibold hover:opacity-80 transition-opacity inline-flex items-center text-sm"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <div className="text-center">
          <Button to="/services" variant="outline" className="px-8 py-3.5 rounded-full font-medium shadow-xs">
            View All Services
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default ServicesPreview;