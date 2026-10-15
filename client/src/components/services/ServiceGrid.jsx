import React, { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import { getServices } from '../../services/serviceService';
import Loading from '../common/Loading';

const defaultServices = [
  { id: 'varmam', slug: 'varmam-therapy', iconName: 'Activity', title: 'Varmam Therapy', desc: 'A traditional therapeutic technique targeting vital energy points (Varmam points) to relieve pain, balance energy, and stimulate healing.' },
  { id: 'thokkanam', slug: 'thokkanam-therapy', iconName: 'HeartHandshake', title: 'Thokkanam Therapy', desc: 'A physical manipulation therapy and traditional massage using medicated oils to treat neuromuscular and musculoskeletal disorders.' },
  { id: 'wellness', slug: 'wellness-support', iconName: 'Leaf', title: 'Wellness Support', desc: 'Holistic wellness programs including dietary counseling, lifestyle modifications, and customized herbal regimens for preventive care.' }
];

const ServiceGrid = () => {
  const [services, setServices] = useState(defaultServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          // Filter out consultation if returned and merge with defaults
          const filtered = data.filter(item => item.slug !== 'consultation');
          const merged = filtered.map(item => {
            const def = defaultServices.find(d => d.slug === item.slug) || {};
            return {
              id: item._id || item.id || def.id,
              slug: item.slug || def.slug,
              title: item.title,
              desc: item.shortDescription || def.desc,
              iconName: def.iconName || 'Activity'
            };
          });
          setServices(merged);
        }
      })
      .catch(() => {
        // Fallback on error
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map(service => (
        <ServiceCard key={service.id || service.slug} service={service} />
      ))}
    </div>
  );
};

export default ServiceGrid;
