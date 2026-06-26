/**
 * Format a numeric amount as Sri Lankan Rupees, e.g. 2500 -> "LKR 2,500".
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'LKR 0';
  }
  const formatted = new Intl.NumberFormat('en-LK', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `LKR ${formatted}`;
};

/**
 * Format a date string/Date into a readable "DD MMM YYYY" style string.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a 16-digit card number string into groups of 4, e.g. "4242 4242 4242 4242".
 * @param {string} value raw input value
 * @returns {string}
 */
export const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').substring(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Format an expiry input into "MM/YY" as the user types.
 * @param {string} value raw input value
 * @returns {string}
 */
export const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').substring(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.substring(0, 2)}/${digits.substring(2)}`;
};

/**
 * Generate a fake client-side payment reference for the simulated gateway.
 * @returns {string} e.g. "MOB-1719400000000"
 */
export const generatePaymentReference = () => `MOB-${Date.now()}`;
