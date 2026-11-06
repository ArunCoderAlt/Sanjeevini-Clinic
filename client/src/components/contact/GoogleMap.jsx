import React from 'react';
import { clinicInfo } from '../../data/clinicInfo';

const GoogleMap = () => {
  const embedUrl = clinicInfo.mapEmbedUrl || 'https://maps.google.com/maps?q=10.9178771,79.8311448+(Sanjeevini+Siddha+%26+Ayurveda+Medical+Centre)&t=&z=17&ie=UTF8&iwloc=B&output=embed';

  return (
    <iframe
      title="Sanjeevini Siddha & Ayurveda Medical Centre, Karaikal"
      src={embedUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
};

export default GoogleMap;
