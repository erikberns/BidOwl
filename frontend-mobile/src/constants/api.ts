import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Obtiene la IP de la computadora de desarrollo (donde corre Metro) de forma dinámica
const getLocalIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return '192.168.1.8'; // Fallback a la IP configurada previamente
  }
  return hostUri.split(':')[0];
};

const LOCAL_IP = getLocalIp();

export const API_URL = Platform.select({
  web: 'http://localhost:8080/api',
  default: `http://${LOCAL_IP}:8080/api`,
});

