import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import { getDoctors } from '../../services/doctorService';

const defaultDoctors = [
  {
    id: 'dr-thiagarajan-saminadane',
    slug: 'dr-thiagarajan-saminadane',
    name: 'Dr. Thiagarajan Saminadane',
    qual: 'MD (Siddha)',
    spec: 'Siddha Medicine',
    img: 'https://ui-avatars.com/api/?name=Thiagarajan+Saminadane&background=1B5E3B&color=fff&size=400'
  },
  {
    id: 'dr-subashini-ganesan',
    slug: 'dr-subashini-ganesan',
    name: 'Dr. Subashini Ganesan',
    qual: 'BAMS (Ayurveda)',
    spec: 'Ayurveda',
    img: 'https://ui-avatars.com/api/?name=Subashini+Ganesan&background=C9A227&color=fff&size=400'
  }
];

const DoctorsPreview = () => {
  const [team, setTeam] = useState(defaultDoctors);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(d => ({
            id: d._id || d.id || d.slug,
            slug: d.slug || d.id,
            name: d.name,
            qual: d.qualification || d.qual,
            spec: d.specialization || d.spec,
            img: d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=1B5E3B&color=fff&size=400`
          }));
          setTeam(mapped);
        }
      })
      .catch(() => {
        // Fallback on error
      });
  }, []);

  return (
    <section className="py-24 bg-cream">
      <Container>
        <SectionTitle 
          title="Our Medical Team" 
          subtitle="Expert practitioners dedicated to your well-being."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 max-w-4xl mx-auto">
          {team.map((doc, idx) => (
            <motion.div
              key={doc.slug || doc.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md group border border-sage"
            >
              <div className="aspect-square overflow-hidden bg-sage">
                <img 
                  src={doc.img} 
                  alt={doc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-serif text-primary-700 mb-2">{doc.name}</h3>
                <p className="text-gold font-medium mb-1">{doc.qual}</p>
                <p className="text-gray-500 mb-6">{doc.spec}</p>
                <Button to={`/doctors/${doc.slug || doc.id}`} variant="outline" className="w-full">
                  View Profile
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default DoctorsPreview;
