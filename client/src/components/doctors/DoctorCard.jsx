import { Link } from 'react-router-dom';
import Button from '../common/Button';

const DoctorCard = ({ doctor }) => {
  // Support both API field names (qualification, specialization) and legacy (qual, spec)
  const qualification = doctor.qualification || doctor.qual;
  const specialization = doctor.specialization || doctor.spec;
  const linkSlug = doctor.slug || doctor.id;
  let image = doctor.image;
  if (doctor.name?.includes('Thiagarajan') && (!image || image.includes('ui-avatars') || image.includes('unsplash.com'))) {
    image = '/images/doctors/dr-thiagarajan.jpg';
  } else if (doctor.name?.includes('Subashini') && (!image || image.includes('ui-avatars') || image.includes('unsplash.com'))) {
    image = '/images/doctors/dr-subashini.jpg';
  } else if (!image) {
    image = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&background=0C2B4B&color=fff&size=512`;
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-200/80 h-full flex flex-col justify-between group">
      <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
        <img 
          src={image} 
          alt={doctor.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <div className="p-5 sm:p-7 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif text-primary-700 mb-1.5 leading-snug">{doctor.name}</h3>
          <p className="text-dark-blue-gradient font-bold mb-2 text-sm sm:text-base tracking-wide">{qualification}</p>
          <div className="mb-5 sm:mb-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD] font-semibold text-xs sm:text-sm">
              {specialization}
            </span>
          </div>
        </div>
        <Button to={`/doctors/${linkSlug}`} variant="primary" className="w-full mt-auto py-2.5 sm:py-3 text-sm font-semibold">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default DoctorCard;
