import React from 'react';
import { Award, BookOpen, Clock } from 'lucide-react';
import Button from '../common/Button';

const DoctorProfile = ({ doctor }) => {
  const isThiagarajan = doctor.name?.includes('Thiagarajan');
  const isSubashini = doctor.name?.includes('Subashini');
  const fallbackAvatar = isThiagarajan
    ? '/images/doctors/dr-thiagarajan.jpg'
    : (isSubashini ? '/images/doctors/dr-subashini.jpg' : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&background=C9A227&color=fff&size=500`);

  let doctorPhoto = doctor.image;
  if (isThiagarajan && (!doctorPhoto || doctorPhoto.includes('ui-avatars') || doctorPhoto.includes('unsplash.com'))) {
    doctorPhoto = '/images/doctors/dr-thiagarajan.jpg';
  } else if (isSubashini && (!doctorPhoto || doctorPhoto.includes('ui-avatars') || doctorPhoto.includes('unsplash.com'))) {
    doctorPhoto = '/images/doctors/dr-subashini.jpg';
  } else if (!doctorPhoto || doctorPhoto.includes('unsplash.com')) {
    doctorPhoto = fallbackAvatar;
  }

  const expDisplay = doctor.experience
    ? typeof doctor.experience === 'number' || !String(doctor.experience).toLowerCase().includes('year')
      ? `${doctor.experience} Years`
      : doctor.experience
    : 'Experienced';

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden">
      <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12">
        {/* Doctor Image Container with fixed proportional aspect ratio */}
        <div className="w-full max-w-[280px] sm:max-w-none sm:w-72 md:w-80 lg:w-96 shrink-0 mx-auto md:mx-0">
          <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-100 md:sticky md:top-28">
            <img 
              src={doctorPhoto} 
              alt={doctor.name} 
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Doctor Details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-serif text-primary-700 mb-2">{doctor.name}</h1>
          <p className="text-xl text-gold font-medium mb-2">{doctor.qualification}</p>
          <p className="text-gray-500 mb-8">{doctor.specialization}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary-600 mr-3 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Experience</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{expDisplay}</p>
              </div>
            </div>
            {doctor.consultationHours && (
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-primary-600 mr-3 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Consultation Hours</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">{doctor.consultationHours}</p>
                </div>
              </div>
            )}
          </div>

          {doctor.bio && (
            <div className="mb-8">
              <h3 className="text-xl font-serif text-primary-700 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                About Doctor
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{doctor.bio}</p>
            </div>
          )}

          {doctor.achievements && doctor.achievements.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-serif text-primary-700 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary-600" />
                Achievements & Awards
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-base">
                {doctor.achievements.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </div>
          )}

          <Button to="/contact#contact-form" variant="primary" className="px-8 py-3.5 rounded-full shadow-md font-semibold">
            Contact Clinic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
