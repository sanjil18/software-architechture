import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Payment Portal (public) ──────────────────────────────────────────────────
export const lookupFine   = (ref, cat) => API.get('/fines/lookup', { params:{ referenceNumber:ref, categoryId:cat } }).then(r=>r.data);
export const payFine      = (id, data) => API.post(`/fines/${id}/pay`, data).then(r=>r.data);
export const getCategories = ()        => API.get('/categories').then(r=>r.data);

// ── Admin Portal (protected) ─────────────────────────────────────────────────
export const getAnalytics  = ()       => API.get('/fines/analytics').then(r=>r.data);
export const getAllFines    = (params) => API.get('/fines', { params }).then(r=>r.data);
export const issueFine     = (data)   => API.post('/fines', data).then(r=>r.data);
export const updateFine    = (id,data)=> API.put(`/fines/${id}`, data).then(r=>r.data);
export const createOfficer = (data)   => API.post('/auth/register', data).then(r=>r.data);

