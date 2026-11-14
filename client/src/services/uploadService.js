import api from './api';

export const uploadImage = async (file, folder = 'general') => {
  if (!file) return null;
  const formData = new FormData();
  formData.append('image', file);
  if (folder) {
    formData.append('folder', folder);
  }
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.data?.url;
};

export default {
  uploadImage,
};
