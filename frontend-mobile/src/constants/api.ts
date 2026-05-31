import { Platform } from 'react-native';

// Si se corre en emulador Android se usa 10.0.2.2, si es iOS o web se usa localhost.
// O se puede cambiar por la IP local de la computadora para pruebas en dispositivo físico.
export const API_URL = Platform.select({
  android: 'http://10.0.2.2:8080/api',
  default: 'http://localhost:8080/api',
});
