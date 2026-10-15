import api from './api';

export const getReels = async (params = {}) => {
  return await api.get('/reels', { params });
};

export const getReelById = async (id) => {
  return await api.get(`/reels/${id}`);
};

export const createReel = async (data) => {
  return await api.post('/reels', data);
};

export const updateReel = async (id, data) => {
  return await api.put(`/reels/${id}`, data);
};

export const deleteReel = async (id) => {
  return await api.delete(`/reels/${id}`);
};

export default {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
};
