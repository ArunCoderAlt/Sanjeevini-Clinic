import api from './api';

export const getTreatments = (category, params = {}) => {
  const query = { ...params };
  if (category) query.category = category;
  return api.get('/treatments', { params: query });
};
export const getTreatmentBySlug = (slug) => api.get(`/treatments/slug/${slug}`);
export const getTreatmentById = (id) => api.get(`/treatments/${id}`);
export const getCategories = () => api.get('/treatments/categories');
export const createTreatment = (data) => api.post('/treatments', data);
export const updateTreatment = (id, data) => api.put(`/treatments/${id}`, data);
export const deleteTreatment = (id) => api.delete(`/treatments/${id}`);
