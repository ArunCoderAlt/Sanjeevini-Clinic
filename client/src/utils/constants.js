const resolveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.trim().replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_URL = resolveApiUrl();

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TREATMENT_CATEGORIES = [
  'Gastrointestinal', 'Dermatology', "Women's Health", 
  'Kidney', 'Musculoskeletal', 'Pediatrics', 
  'Respiratory', 'Neurology', 'Anorectal', 
  "Men's Health", 'Other'
];
