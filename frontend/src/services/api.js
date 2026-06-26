import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Attach JWT automatically for admin routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Payment Portal APIs (Public) ────────────────────────────────────────────
export const lookupFine = async (referenceNumber, categoryId) => {
  const res = await API.get('/fines/lookup', { params: { referenceNumber, categoryId } });
  return res.data;
};

export const payFine = async (fineId, paymentData) => {
  const res = await API.post(`/fines/${fineId}/pay`, paymentData);
  return res.data;
};

export const getCategories = async () => {
  const res = await API.get('/categories');
  return res.data;
};

// ─── Admin Portal APIs (Protected) ───────────────────────────────────────────
export const getAnalytics = () => API.get('/fines/analytics').then((r) => r.data);
export const getAllFines = (params) => API.get('/fines', { params }).then((r) => r.data);
export const issueFine = (data) => API.post('/fines', data).then((r) => r.data);
export const updateFine = (id, data) => API.put(`/fines/${id}`, data).then((r) => r.data);
export const createOfficer = (data) => API.post('/auth/register', data).then((r) => r.data);
