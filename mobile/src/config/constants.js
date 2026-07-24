import Constants from 'expo-constants';
import { Platform } from 'react-native';


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
