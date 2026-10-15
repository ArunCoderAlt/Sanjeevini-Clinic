import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const DoctorCard = ({ doctor }) => {
  // Support both API field names (qualification, specialization) and legacy (qual, spec)
  const qualification = doctor.qualification || doctor.qual;
  const specialization = doctor.specialization || doctor.spec;
  const linkSlug = doctor.slug || doctor.id;
  const image = doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=1B5E3B&color=fff&size=400`;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-sage">
      <div className="aspect-square bg-sage relative overflow-hidden">
        <img src={image} alt={doctor.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-8 text-center">
        <h3 className="text-2xl font-serif text-primary-700 mb-1">{doctor.name}</h3>
        <p className="text-gold font-medium mb-1">{qualification}</p>
        <p className="text-gray-500 mb-6">{specialization}</p>
        <Button to={`/doctors/${linkSlug}`} variant="outline" className="w-full">
          View Full Profile
        </Button>
      </div>
    </div>
  );
};

export default DoctorCard;
