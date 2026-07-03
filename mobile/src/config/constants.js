import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Derive the backend base URL automatically so it survives IP changes.
 *
 * Strategy (in priority order):
 *  1. Web browser (Expo Web / localhost:8081)  → always localhost
 *  2. Native device/simulator in Expo Go       → same host as the Metro
 *     bundler (Constants.expoConfig.hostUri), which equals your machine's
 *     current LAN IP — no manual update needed when the IP changes
 *  3. Hard-coded fallback if Metro host is unavailable
 *
 * Your phone and your computer must be on the SAME Wi-Fi network.
 */
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  // Expo Go exposes the Metro bundler host which equals your machine's LAN IP
  const metroHost =
    Constants.expoConfig?.hostUri?.split(':')[0] ||
    Constants.manifest?.debuggerHost?.split(':')[0];
  if (metroHost) {
    return `http://${metroHost}:5000/api`;
  }
  // Fallback — update this if auto-detect ever fails
  return 'http://10.247.174.23:5000/api';
};

export const BASE_URL = getBaseUrl();

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
