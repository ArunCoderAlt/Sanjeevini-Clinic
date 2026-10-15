import api from './api';

/**
 * Send a chat message to the RAG AI bot
 * @param {string} message - User query
 * @param {Array} history - Previous conversation messages [{ role, content }]
 */
export const sendChatMessage = (message, history = []) => {
  return api.post('/bot/chat', { message, history });
};

/**
 * Get overall AI bot status, chunk counts, and Groq connection status
 */
export const getBotStatus = () => {
  return api.get('/bot/status');
};

/**
 * Get list of all indexed knowledge base PDF documents (Admin)
 */
export const getBotDocuments = () => {
  return api.get('/bot/documents');
};

/**
 * Upload a PDF document for RAG indexing (Admin)
 * @param {FormData} formData - Contains 'pdf' file
 */
export const uploadBotPdf = (formData) => {
  return api.post('/bot/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Delete a knowledge document (Admin)
 * @param {string} id - Document ID
 */
export const deleteBotDocument = (id) => {
  return api.delete(`/bot/documents/${id}`);
};

/**
 * Toggle document active/inactive state (Admin)
 * @param {string} id - Document ID
 * @param {boolean} isActive - New active state
 */
export const toggleBotDocument = (id, isActive) => {
  return api.patch(`/bot/documents/${id}/toggle`, { isActive });
};

/**
 * Update Groq API Key and Model settings (Admin)
 * @param {Object} settings - { apiKey, model }
 */
export const updateBotSettings = (settings) => {
  return api.put('/bot/settings', settings);
};

/**
 * Restore the default clinic portfolio guide document (Admin)
 */
export const restoreSeedDocument = () => {
  return api.post('/bot/restore-seed');
};

/**
 * Get Groq API key token usage, rate limits, and historical key periods (Admin)
 */
export const getBotUsage = () => {
  return api.get('/bot/usage');
};
