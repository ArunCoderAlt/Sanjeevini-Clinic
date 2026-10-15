import React from 'react';

const DoctorSpecialization = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <span key={idx} className="bg-sage text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
          {tag}
        </span>
      ))}
    </div>
  );
};

export default DoctorSpecialization;
