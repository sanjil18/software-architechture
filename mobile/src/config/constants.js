/**
 * App-wide configuration constants.
 *
 * IMPORTANT: Phones (real or emulated) cannot reach "localhost" — that
 * resolves to the phone itself, not your development machine. You must
 * use your computer's LAN IP address instead.
 *
 * To find your IP:
 *   Windows : ipconfig        (look for "IPv4 Address" under your Wi-Fi adapter)
 *   Mac/Linux: ifconfig | grep inet
 *
 * Your phone and your computer must be on the SAME Wi-Fi network.
 */
export const BASE_URL = 'http://192.168.8.171:5000/api';

export const COLORS = {
  primary: '#003580',
  primaryDark: '#002a66',
  success: '#16a34a',
  error: '#dc2626',
  warning: '#eab308',
  background: '#f5f7fa',
  white: '#ffffff',
  textDark: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
};
