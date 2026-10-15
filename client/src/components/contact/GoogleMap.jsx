import React from 'react';
import { clinicInfo } from '../../data/clinicInfo';

const GoogleMap = () => {
  const embedUrl = clinicInfo.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.6012698626005!2d79.8311448!3d10.9178771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a55114c73bcb10f%3A0xa87a8127466e42ab!2sSanjeevini%20Siddha%20%26%20Ayurveda%20Medical%20centre!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin';

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
