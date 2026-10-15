export const API_URL = import.meta.env.VITE_API_URL || '/api';

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
