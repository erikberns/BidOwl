import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveLoginSession(result: any) {
  if (result?.persona) {
    const persona = {
      ...result.persona,
      tokenSesion: result.tokenSesion || result.token,
    };
    await AsyncStorage.setItem('user', JSON.stringify(persona));
  }
  if (result?.tokenSesion || result?.token) {
    await AsyncStorage.setItem('tokenSesion', result.tokenSesion || result.token);
  }
  await AsyncStorage.removeItem('isGuest');
}

export async function getStoredUser() {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export async function getSessionToken() {
  const storedToken = await AsyncStorage.getItem('tokenSesion');
  if (storedToken) {
    return storedToken;
  }
  const user = await getStoredUser();
  return user?.tokenSesion || user?.token || null;
}

export async function getAuthorizationValue() {
  const token = await getSessionToken();
  if (token) {
    return token;
  }
  const user = await getStoredUser();
  return user?.identificador ? String(user.identificador) : '';
}

export async function authHeaders(extra?: Record<string, string>) {
  const autorizacion = await getAuthorizationValue();
  return {
    ...(extra || {}),
    ...(autorizacion ? { Autorizacion: autorizacion } : {}),
  };
}

export async function clearLoginSession() {
  await AsyncStorage.removeItem('tokenSesion');
  await AsyncStorage.removeItem('user');
  await AsyncStorage.removeItem('isGuest');
}
