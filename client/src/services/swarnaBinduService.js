import api from './api';

export const getSwarnaBinduSchedule = (params = {}) => api.get('/swarna-bindu', { params });
export const createSwarnaBinduScheduleItem = (data) => api.post('/swarna-bindu', data);
export const updateSwarnaBinduScheduleItem = (id, data) => api.put(`/swarna-bindu/${id}`, data);
export const deleteSwarnaBinduScheduleItem = (id) => api.delete(`/swarna-bindu/${id}`);

// Aliases for compatibility
export const getSwarnaBinduEvents = getSwarnaBinduSchedule;
export const createSwarnaBinduEvent = createSwarnaBinduScheduleItem;
export const updateSwarnaBinduEvent = updateSwarnaBinduScheduleItem;
export const deleteSwarnaBinduEvent = deleteSwarnaBinduScheduleItem;
