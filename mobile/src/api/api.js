import axios from 'axios';
import { BASE_URL } from '../config/constants';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

/**
 * Fetch all active fine categories from the server.
 * @returns {Promise<Array>} list of category objects ({ categoryId, name, amount, ... })
 */
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.categories;
};

/**
 * Look up a single traffic fine by its reference number and category ID.
 * @param {string} referenceNumber e.g. "TF-2024-ABCD1234"
 * @param {string} categoryId e.g. "TF001"
 * @returns {Promise<Object>} the fine object
 */
export const lookupFine = async (referenceNumber, categoryId) => {
  const response = await api.get('/fines/lookup', {
    params: { referenceNumber, categoryId },
  });
  return response.data.fine;
};

/**
 * Pay a traffic fine by its database ID. Always sent as the "mobile"
 * payment channel so the admin dashboard attributes it correctly.
 * @param {string} fineId Mongo ObjectId of the fine
 * @param {string} paymentReference client-generated reference, e.g. "MOB-1719400000000"
 * @returns {Promise<Object>} the updated fine object returned by the server
 */
export const payFine = async (fineId, paymentReference) => {
  const response = await api.post(`/fines/${fineId}/pay`, {
    paymentMethod: 'mobile',
    paymentReference,
  });
  return response.data.fine;
};

export default api;
