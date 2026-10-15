import React from 'react';
import { Award, BookOpen, Clock, Globe } from 'lucide-react';
import Button from '../common/Button';

const DoctorProfile = ({ doctor }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-1/3 bg-sage">
        <img 
          src={doctor.name.includes('Thiagarajan') ? 'https://ui-avatars.com/api/?name=Thiagarajan+Saminadane&background=1B5E3B&color=fff&size=500' : 'https://ui-avatars.com/api/?name=Subashini+Ganesan&background=C9A227&color=fff&size=500'} 
          alt={doctor.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="md:w-2/3 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-serif text-primary-700 mb-2">{doctor.name}</h1>
        <p className="text-xl text-gold font-medium mb-2">{doctor.qualification}</p>
        <p className="text-gray-500 mb-8">{doctor.specialization}</p>

        <div className="grid grid-cols-2 gap-6 mb-8 border-y border-sage py-8">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-medium text-gray-800">{doctor.experience}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Languages</p>
              <p className="font-medium text-gray-800">{doctor.languages?.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-serif text-primary-700 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            About
          </h3>
          <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-serif text-primary-700 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Achievements
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {doctor.achievements?.map((ach, idx) => (
              <li key={idx}>{ach}</li>
            ))}
          </ul>
        </div>

        <Button to="/contact" variant="primary">
          Contact Clinic
        </Button>
      </div>
    </div>
  );
};

export default DoctorProfile;
