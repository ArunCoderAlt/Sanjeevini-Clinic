import React from 'react';
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
  } else if (!image || image.includes('unsplash.com')) {
    image = '/images/doctors/dr-thiagarajan.jpg';
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
          <h3 className="text-xl sm:text-2xl font-serif text-primary-700 mb-1 leading-snug">{doctor.name}</h3>
          <p className="text-gold font-medium mb-1 text-sm sm:text-base">{qualification}</p>
          <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">{specialization}</p>
        </div>
        <Button to={`/doctors/${linkSlug}`} variant="primary" className="w-full mt-auto py-2.5 sm:py-3 text-sm font-semibold">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default DoctorCard;
