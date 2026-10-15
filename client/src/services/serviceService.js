import api from './api';

export const getServices = (params) => api.get('/services', { params });
export const getServiceById = (id) => api.get(`/services/${id}`);
export const getServiceBySlug = (slug) => api.get(`/services/slug/${slug}`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);
