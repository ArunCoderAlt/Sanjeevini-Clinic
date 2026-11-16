import { useQuery } from '@tanstack/react-query';
import { getDoctors, getDoctorBySlug, getDoctorById } from '../services/doctorService';
import { getServices, getServiceBySlug, getServiceById } from '../services/serviceService';
import { getTreatments, getTreatmentBySlug, getTreatmentById, getCategories } from '../services/treatmentService';
import { getGallery } from '../services/galleryService';
import { getReels, getReelById } from '../services/reelService';
import { getTestimonials } from '../services/testimonialService';
import { getSwarnaBinduSchedule } from '../services/swarnaBinduService';
import api from '../services/api';

/**
 * -----------------------------------------------------------------------------
 * DOCTORS QUERIES
 * -----------------------------------------------------------------------------
 */
export const useDoctors = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: async () => {
      const res = await getDoctors(params);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

export const useDoctor = (slugOrId, options = {}) => {
  return useQuery({
    queryKey: ['doctor', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const res = await getDoctorBySlug(slugOrId);
      return res.data?.data || res.data || null;
    },
    enabled: Boolean(slugOrId),
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * SERVICES QUERIES
 * -----------------------------------------------------------------------------
 */
export const useServices = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const res = await getServices(params);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

export const useService = (slugOrId, options = {}) => {
  return useQuery({
    queryKey: ['service', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const res = await getServiceBySlug(slugOrId);
      return res.data?.data || res.data || null;
    },
    enabled: Boolean(slugOrId),
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * TREATMENTS QUERIES
 * -----------------------------------------------------------------------------
 */
export const useTreatments = (category = null, options = {}) => {
  const normalizedCategory = category && category.trim().toLowerCase() !== 'all' ? category.trim() : null;
  const params = normalizedCategory ? { category: normalizedCategory } : {};
  return useQuery({
    queryKey: ['treatments', params],
    queryFn: async () => {
      const res = await getTreatments(normalizedCategory);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

export const useTreatment = (slugOrId, options = {}) => {
  return useQuery({
    queryKey: ['treatment', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const res = await getTreatmentBySlug(slugOrId);
      return res.data?.data || res.data || null;
    },
    enabled: Boolean(slugOrId),
    ...options,
  });
};

export const useTreatmentCategories = (options = {}) => {
  return useQuery({
    queryKey: ['treatment-categories'],
    queryFn: async () => {
      const res = await getCategories();
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * GALLERY QUERIES
 * -----------------------------------------------------------------------------
 */
export const useGallery = (category = 'all', options = {}) => {
  return useQuery({
    queryKey: ['gallery', category],
    queryFn: async () => {
      const res = await getGallery(category === 'all' ? undefined : category);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * REELS QUERIES
 * -----------------------------------------------------------------------------
 */
export const useReels = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['reels', params],
    queryFn: async () => {
      const res = await getReels(params);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * TESTIMONIALS QUERIES
 * -----------------------------------------------------------------------------
 */
export const useTestimonials = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['testimonials', params],
    queryFn: async () => {
      const res = await getTestimonials(params);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * SWARNA BINDU QUERIES
 * -----------------------------------------------------------------------------
 */
export const useSwarnaBindu = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['swarna-bindu', params],
    queryFn: async () => {
      const res = await getSwarnaBinduSchedule(params);
      return res.data?.data || res.data || [];
    },
    ...options,
  });
};

/**
 * -----------------------------------------------------------------------------
 * SETTINGS QUERIES
 * -----------------------------------------------------------------------------
 */
export const useSettings = (options = {}) => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data?.data || res.data || null;
    },
    ...options,
  });
};
