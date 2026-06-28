// Resuelve las URLs HTTP y WebSocket para Railway, web y dispositivos moviles.
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Obtiene la IP de la computadora de desarrollo (donde corre Metro) de forma dinámica
const getLocalIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  console.log('[API_URL] hostUri de Expo detectado:', hostUri);
  if (!hostUri) {
    console.log('[API_URL] No se detectó hostUri, usando fallback: 192.168.1.8');
    return '192.168.1.8';
  }
  const ip = hostUri.split(':')[0];
  // Si la IP detectada es localhost o 127.0.0.1, no servirá para un dispositivo físico externo
  if (ip === 'localhost' || ip === '127.0.0.1') {
    console.log('[API_URL] Se detectó localhost/127.0.0.1, usando fallback físico: 192.168.1.8');
    return '192.168.1.8';
  }
  console.log('[API_URL] IP dinámica resuelta con éxito:', ip);
  return ip;
};

const LOCAL_IP = getLocalIp();

// TODO: Pega aquí la URL que te generó Railway (asegúrate de que empiece con https:// y termine con /api)
const CLOUD_API_URL = 'https://bidowl-production.up.railway.app/api';

// Cambia esto a "true" cuando quieras que tu app apunte a Railway, y "false" para usar tu PC local
const USE_CLOUD = true;

export const API_URL = USE_CLOUD
  ? CLOUD_API_URL
  : Platform.select({
    web: 'http://localhost:8080/api',
    default: `http://${LOCAL_IP}:8080/api`,
  });

export const WS_URL = API_URL.replace('/api', '').replace(/^http/, 'ws') + '/ws-bidowl';

console.log('[API_URL] API_URL configurado en:', API_URL);
console.log('[API_URL] WS_URL configurado en:', WS_URL);


