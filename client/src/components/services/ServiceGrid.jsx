import { useMemo } from 'react';
import ServiceCard from './ServiceCard';
import { useServices } from '../../hooks/useQueries';
import Loading from '../common/Loading';

const defaultServices = [
  { id: 'varmam', slug: 'varmam-therapy', iconName: 'Activity', title: 'Varmam Therapy', desc: 'A traditional therapeutic technique targeting vital energy points (Varmam points) to relieve pain, balance energy, and stimulate healing.' },
  { id: 'thokkanam', slug: 'thokkanam-therapy', iconName: 'HeartHandshake', title: 'Thokkanam Therapy', desc: 'A physical manipulation therapy and traditional massage using medicated oils to treat neuromuscular and musculoskeletal disorders.' },
  { id: 'wellness', slug: 'wellness-support', iconName: 'Leaf', title: 'Wellness Support', desc: 'Holistic wellness programs including dietary counseling, lifestyle modifications, and customized herbal regimens for preventive care.' }
];

const ServiceGrid = () => {
  const { data: rawServices, isLoading } = useServices();

  const services = useMemo(() => {
    if (!rawServices) return defaultServices;
    if (Array.isArray(rawServices) && rawServices.length === 0) return [];

    const filtered = rawServices.filter(item => item.slug !== 'consultation');
    return filtered.map(item => {
      const def = defaultServices.find(d => d.slug === item.slug) || {};
      return {
        id: item._id || item.id || def.id,
        slug: item.slug || def.slug,
        title: item.title,
        desc: item.shortDescription || def.desc,
        iconName: item.icon || def.iconName || 'Activity'
      };
    });
  }, [rawServices]);

  if (isLoading && (!rawServices || rawServices.length === 0)) return <Loading />;

  if (!isLoading && Array.isArray(rawServices) && services.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-xl mx-auto shadow-sm">
        <h3 className="text-xl font-serif text-slate-800 font-semibold mb-2">No Services Currently Available</h3>
        <p className="text-slate-500 text-sm">Services are currently being updated. Please check back soon or contact the clinic directly.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map(service => (
        <ServiceCard key={service.id || service.slug} service={service} />
      ))}
    </div>
  );
};

export default ServiceGrid;
