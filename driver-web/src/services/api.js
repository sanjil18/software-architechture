import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const lookupFine = async (referenceNumber, categoryCode) => {
  const response = await axios.get(`${API_BASE}/fines/lookup`, {
    params: { referenceNumber, categoryCode }
  });
  return response.data;
};

export const processPayment = async (paymentData) => {
  const response = await axios.post(`${API_BASE}/payments/pay`, paymentData);
  return response.data;
};
