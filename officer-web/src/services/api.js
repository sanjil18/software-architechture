import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('officerToken')}`,
});

export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get(`${API_BASE}/officer/profile`, { headers: authHeaders() });
  return res.data;
};

export const getCategories = async () => {
  const res = await axios.get(`${API_BASE}/categories`);
  return res.data;
};

export const issueFine = async (data) => {
  const res = await axios.post(`${API_BASE}/fines`, data, { headers: authHeaders() });
  return res.data;
};

export const getMyFines = async () => {
  const res = await axios.get(`${API_BASE}/officer/my-fines`, { headers: authHeaders() });
  return res.data;
};
