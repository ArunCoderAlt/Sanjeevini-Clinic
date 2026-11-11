import React, { useEffect, useState } from 'react';
import DoctorCard from './DoctorCard';
import { getDoctors } from '../../services/doctorService';
import Loading from '../common/Loading';

const defaultDoctors = [
  {
    id: 'thiagarajan-saminadane',
    slug: 'thiagarajan-saminadane',
    name: 'Dr. Thiagarajan Saminadane',
    qualification: 'MD (Siddha)',
    specialization: 'Siddha Medicine',
    image: '/images/doctors/dr-thiagarajan.jpg'
  },
  {
    id: 'subashini-ganesan',
    slug: 'subashini-ganesan',
    name: 'Dr. Subashini Ganesan',
    qualification: 'BAMS (Ayurveda)',
    specialization: 'Ayurveda',
    image: '/images/doctors/dr-subashini.jpg'
  }
];

const DoctorGrid = () => {
  const [doctors, setDoctors] = useState(defaultDoctors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        const data = res.data.data || [];
        if (data.length > 0) {
          const mapped = data.map(d => {
            let image = d.image;
            if (d.name?.includes('Thiagarajan') && (!d.image || d.image.includes('ui-avatars') || d.image.includes('unsplash.com'))) {
              image = '/images/doctors/dr-thiagarajan.jpg';
            } else if (d.name?.includes('Subashini') && (!d.image || d.image.includes('ui-avatars') || d.image.includes('unsplash.com'))) {
              image = '/images/doctors/dr-subashini.jpg';
            } else if (!image || image.includes('unsplash.com')) {
              image = '/images/doctors/dr-thiagarajan.jpg';
            }
            return {
              ...d,
              image
            };
          });
          setDoctors(mapped);
        }
      })
      .catch(() => {
        // Keep default doctors on API failure
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-stretch">
      {doctors.map((doc) => (
        <DoctorCard key={doc._id || doc.id || doc.slug} doctor={doc} />
      ))}
    </div>
  );
};

export default DoctorGrid;
