import React, { useEffect, useState } from 'react';
import DoctorCard from './DoctorCard';
import { getDoctors } from '../../services/doctorService';
import Loading from '../common/Loading';

const defaultDoctors = [
  {
    id: 'dr-thiagarajan-saminadane',
    slug: 'dr-thiagarajan-saminadane',
    name: 'Dr. Thiagarajan Saminadane',
    qualification: 'MD (Siddha)',
    specialization: 'Siddha Medicine',
    image: 'https://ui-avatars.com/api/?name=Thiagarajan+Saminadane&background=1B5E3B&color=fff&size=500'
  },
  {
    id: 'dr-subashini-ganesan',
    slug: 'dr-subashini-ganesan',
    name: 'Dr. Subashini Ganesan',
    qualification: 'BAMS (Ayurveda)',
    specialization: 'Ayurveda',
    image: 'https://ui-avatars.com/api/?name=Subashini+Ganesan&background=C9A227&color=fff&size=500'
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
          setDoctors(data);
        }
      })
      .catch(() => {
        // Keep default doctors on API failure
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
      {doctors.map((doc) => (
        <DoctorCard key={doc._id || doc.id || doc.slug} doctor={doc} />
      ))}
    </div>
  );
};

export default DoctorGrid;
