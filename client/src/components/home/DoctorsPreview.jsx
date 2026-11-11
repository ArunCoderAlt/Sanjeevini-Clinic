import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import { getDoctors } from '../../services/doctorService';

const defaultDoctors = [
  {
    id: 'thiagarajan-saminadane',
    slug: 'thiagarajan-saminadane',
    name: 'Dr. Thiagarajan Saminadane',
    qual: 'MD (Siddha)',
    spec: 'Siddha Medicine',
    img: '/images/doctors/dr-thiagarajan.jpg'
  },
  {
    id: 'subashini-ganesan',
    slug: 'subashini-ganesan',
    name: 'Dr. Subashini Ganesan',
    qual: 'BAMS (Ayurveda)',
    spec: 'Ayurveda',
    img: '/images/doctors/dr-subashini.jpg'
  }
];

const DoctorsPreview = () => {
  const [team, setTeam] = useState(defaultDoctors);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(d => {
            let img = d.image;
            if (d.name?.includes('Thiagarajan') && (!d.image || d.image.includes('ui-avatars') || d.image.includes('unsplash.com'))) {
              img = '/images/doctors/dr-thiagarajan.jpg';
            } else if (d.name?.includes('Subashini') && (!d.image || d.image.includes('ui-avatars') || d.image.includes('unsplash.com'))) {
              img = '/images/doctors/dr-subashini.jpg';
            } else if (!img || img.includes('unsplash.com')) {
              img = '/images/doctors/dr-thiagarajan.jpg';
            }
            return {
              id: d._id || d.id || d.slug,
              slug: d.slug || d.id,
              name: d.name,
              qual: d.qualification || d.qual,
              spec: d.specialization || d.spec,
              img
            };
          });
          setTeam(mapped);
        }
      })
      .catch(() => {
        // Fallback on error
      });
  }, []);

  return (
    <section className="py-24 bg-dark-section">
      <Container>
        <SectionTitle 
          title="Our Medical Team" 
          subtitle="Expert practitioners dedicated to your well-being."
          light
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-10 md:mt-16 max-w-4xl mx-auto items-stretch">
          {team.map((doc, idx) => (
            <motion.div
              key={doc.slug || doc.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-white/50 h-full flex flex-col justify-between"
            >
              <div className="aspect-[4/5] overflow-hidden bg-slate-800 relative">
                <img 
                  src={doc.img} 
                  alt={doc.name} 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-6 sm:p-8 text-center flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif text-primary-700 mb-2 leading-snug">{doc.name}</h3>
                  <p className="text-gold font-medium mb-1 text-sm sm:text-base">{doc.qual}</p>
                  <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">{doc.spec}</p>
                </div>
                <Button to={`/doctors/${doc.slug || doc.id}`} variant="primary" className="w-full mt-auto py-2.5 sm:py-3 text-sm font-semibold">
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
