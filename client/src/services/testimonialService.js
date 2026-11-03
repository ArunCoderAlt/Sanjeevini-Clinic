import api from './api';

export const getTestimonials = (params) => api.get('/testimonials', { params });
export const submitTestimonial = (data) => api.post('/testimonials', data);
export const updateTestimonial = (id, data) => api.put(`/testimonials/${id}`, data);
export const deleteTestimonial = (id) => api.delete(`/testimonials/${id}`);
