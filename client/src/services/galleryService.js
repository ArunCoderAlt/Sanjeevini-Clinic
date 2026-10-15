import api from './api';

export const getGallery = (category, params = {}) => {
  const query = { ...params };
  if (category && category !== 'all') query.category = category;
  return api.get('/gallery', { params: query });
};
export const createGalleryItem = (data) => api.post('/gallery', data);
export const updateGalleryItem = (id, data) => api.put(`/gallery/${id}`, data);
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`);
