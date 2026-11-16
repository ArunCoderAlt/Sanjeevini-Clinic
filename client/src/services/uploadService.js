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

export const deleteImage = async (urlOrFileId) => {
  if (!urlOrFileId) return false;
  try {
    const response = await api.delete('/upload', {
      data: { url: urlOrFileId },
    });
    return response.data?.success;
  } catch (err) {
    console.warn('Failed to delete image:', err);
    return false;
  }
};

export default {
  uploadImage,
  deleteImage,
};
