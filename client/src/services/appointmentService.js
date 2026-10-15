import api from './api';

export const createAppointment = (data) => api.post('/appointments', data);
export const getAppointments = (status) => api.get('/appointments', { params: { status } });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const updateStatus = (id, status) => api.put(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
