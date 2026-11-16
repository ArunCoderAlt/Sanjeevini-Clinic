import { useMemo } from 'react';
import { UserX } from 'lucide-react';
import DoctorCard from './DoctorCard';
import { useDoctors } from '../../hooks/useQueries';
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
  const { data: rawDoctors, isLoading } = useDoctors();

  const doctors = useMemo(() => {
    if (!rawDoctors) return defaultDoctors;
    if (Array.isArray(rawDoctors) && rawDoctors.length === 0) return [];

    return rawDoctors.map((d) => {
      let image = d.image;
      if (d.name?.includes('Thiagarajan') && (!d.image || d.image.includes('ui-avatars') || d.image.includes('unsplash.com'))) {
        image = '/images/doctors/dr-thiagarajan.jpg';
      } else if (d.name?.includes('Subashini') && (!d.image || d.image.includes('ui-avatars') || d.image.includes('unsplash.com'))) {
        image = '/images/doctors/dr-subashini.jpg';
      }
      return {
        ...d,
        image
      };
    });
  }, [rawDoctors]);

  if (isLoading && (!rawDoctors || rawDoctors.length === 0)) return <Loading />;

  if (!isLoading && Array.isArray(rawDoctors) && rawDoctors.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-xl mx-auto shadow-sm">
        <UserX className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-xl font-serif text-slate-800 font-semibold mb-2">No Doctors Currently Listed</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Doctor profiles will be updated shortly. Please contact the clinic directly for consultation appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-stretch">
      {doctors.map((doc) => (
        <DoctorCard key={doc._id || doc.id || doc.slug} doctor={doc} />
      ))}
    </div>
  );
};

export default DoctorGrid;
