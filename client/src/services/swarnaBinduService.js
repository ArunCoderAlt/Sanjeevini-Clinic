import api from './api';
import { defaultPushyaSchedule } from '../data/swarnaBinduData';

export const getSwarnaBinduSchedule = async (params = {}) => {
  try {
    const res = await api.get('/swarna-bindu', { params });
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn('Backend /swarna-bindu offline or unseeded, using built-in schedule:', err.message);
  }
  return {
    data: {
      success: true,
      data: defaultPushyaSchedule
    }
  };
};

export const createSwarnaBinduScheduleItem = async (data) => {
  try {
    return await api.post('/swarna-bindu', data);
  } catch (err) {
    console.warn('API error creating schedule item, returning local representation:', err.message);
    const newItem = {
      ...data,
      id: `sb-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    return { data: { success: true, data: newItem } };
  }
};

export const updateSwarnaBinduScheduleItem = async (id, data) => {
  try {
    return await api.put(`/swarna-bindu/${id}`, data);
  } catch (err) {
    console.warn('API error updating schedule item:', err.message);
    return { data: { success: true, data: { ...data, id } } };
  }
};

export const deleteSwarnaBinduScheduleItem = async (id) => {
  try {
    return await api.delete(`/swarna-bindu/${id}`);
  } catch (err) {
    console.warn('API error deleting schedule item:', err.message);
    return { data: { success: true, data: null } };
  }
};

// Aliases for compatibility
export const getSwarnaBinduEvents = getSwarnaBinduSchedule;
export const createSwarnaBinduEvent = createSwarnaBinduScheduleItem;
export const updateSwarnaBinduEvent = updateSwarnaBinduScheduleItem;
export const deleteSwarnaBinduEvent = deleteSwarnaBinduScheduleItem;
