// Muestra el perfil, metodos de pago, deuda pendiente y cierre de sesion.
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Stack, Tabs, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { PaymentMethodsScreen } from '@/components/payment/PaymentMethodsScreen';
import { API_URL } from '@/constants/api';
import { PasswordScreen } from '@/components/auth/PasswordScreen';
import { authHeaders } from '@/services/authSession';

const formatDebtAmount = (value: number | string | null | undefined) => {
  const numeric = Number(value || 0);
  return numeric.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ARS';
};

const formatDebtDate = (value: string | null | undefined) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ProfileScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingDebt, setPendingDebt] = useState<any>(null);
  const [photoError, setPhotoError] = useState(false);

  const loadPendingDebt = async () => {
    try {
      const res = await fetch(`${API_URL}/inbox/deudas/pendiente`, {
        headers: await authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPendingDebt(data?.pendiente ? data : null);
      } else {
        setPendingDebt(null);
      }
    } catch (err) {
      console.warn('Error fetching pending debt:', err);
      setPendingDebt(null);
    }
  };

  const regularizeDebt = async () => {
    if (!pendingDebt?.deudaId) return;
    try {
      const res = await fetch(`${API_URL}/inbox/deudas/${pendingDebt.deudaId}/regularizar`, {
        method: 'POST',
        headers: await authHeaders(),
      });
      if (res.ok) {
        setPendingDebt(null);
        if (Platform.OS === 'web') {
          alert('Deuda regularizada. Ya podes volver a participar en subastas.');
        } else {
          Alert.alert('Deuda regularizada', 'Ya podes volver a participar en subastas.');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.error || 'No se pudo regularizar la deuda.';
        if (Platform.OS === 'web') {
          alert(message);
        } else {
          Alert.alert('Error', message);
        }
      }
    } catch (err) {
      console.error('Error regularizing debt:', err);
      if (Platform.OS === 'web') {
        alert('No se pudo conectar con el servidor.');
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor.');
      }
    }
  };


  useEffect(() => {
    if (isFocused) {
      async function loadProfileState() {
        try {
          const isGuestStr = await AsyncStorage.getItem('isGuest');
          const userStr = await AsyncStorage.getItem('user');
          if (isGuestStr === 'true' || !userStr) {
            setIsGuest(true);
            setCurrentUser(null);
            setPendingDebt(null);
          } else {
            setIsGuest(false);
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);
            setPhotoError(false); // Reset photo loading state on refresh

            try {
              console.log(`Cargando datos frescos del usuario ${parsedUser.identificador} de la API...`);
              const res = await fetch(`${API_URL}/personas/${parsedUser.identificador}`);
              if (res.ok) {
                const latestUser = await res.json();
                setCurrentUser(latestUser);
                await AsyncStorage.setItem('user', JSON.stringify(latestUser));
              }
            } catch (err) {
              console.warn('Error fetching latest user details:', err);
            }
            await loadPendingDebt();
          }
        } catch (e) {
          setIsGuest(true);
        }
      }
      loadProfileState();
    }
  }, [isFocused]);

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('tokenSesion');
        await AsyncStorage.removeItem('isGuest');
        await AsyncStorage.setItem('hasSeenAuth', 'false');
        if (Platform.OS === 'web') {
          alert('Se ha cerrado la sesión correctamente');
        } else {
          Alert.alert('Sesión cerrada', 'Se ha cerrado la sesión correctamente');
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('¿Está seguro de que desea cerrar sesión?');
      if (confirmLogout) {
        await performLogout();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Está seguro de que desea cerrar sesión?',
        [
          { text: 'Cancelar', onPress: () => { } },
          {
            text: 'Cerrar Sesión',
            onPress: async () => {
              await performLogout();
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const handleGuestRedirect = async (target: 'register' | 'login') => {
    try {
      await AsyncStorage.setItem('authRedirect', target);
      await AsyncStorage.setItem('hasSeenAuth', 'false');
    } catch (e) {
      console.error(e);
    }
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Image
            source={require('@/assets/images/SplashBidOwl.png')}
            style={styles.logo}
          />
        </View>

        {/* Guest Content */}
        <ScrollView contentContainerStyle={styles.guestContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.guestContentBox}>
            <Text style={styles.guestMainTitle}>
              Completá tu acceso{'\n'}a <Text style={styles.brandTextPrimary}>Bid</Text><Text style={styles.brandTextSecondary}>Owl</Text>
            </Text>

            <Text style={styles.guestSubtitle}>
              Para acceder a tu perfil y seguir usando la app como usuario, creá tu cuenta o iniciá sesión.
            </Text>

            <View style={styles.guestButtonGroup}>
              <TouchableOpacity
                style={styles.guestCreateButton}
                onPress={() => handleGuestRedirect('register')}
              >
                <Text style={styles.guestCreateButtonText}>Crear Cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestLoginButton}
                onPress={() => handleGuestRedirect('login')}
              >
                <Text style={styles.guestLoginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.guestLoginButton, { marginTop: 12, borderWidth: 0 }]}
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('hasSeenOnboarding');
                    await AsyncStorage.removeItem('hasSeenAuth');
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('tokenSesion');
                    await AsyncStorage.removeItem('isGuest');
                    if (Platform.OS === 'web') {
                      alert('Onboarding restablecido. Por favor, reinicia la aplicación.');
                    } else {
                      Alert.alert(
                        'Restablecer Tutorial',
                        'Se ha restablecido el tutorial. Por favor, recarga o reinicia la app para volver a ver el onboarding.',
                        [{ text: 'Entendido' }]
                      );
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <Text style={[styles.guestLoginButtonText, { color: '#8A8A8A', textDecorationLine: 'underline', fontSize: 14 }]}>
                  Volver a ver el Onboarding
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isChangingPassword) {
    return (
      <PasswordScreen
        userId={currentUser?.identificador}
        isEditing={true}
        onBack={() => setIsChangingPassword(false)}
        onComplete={() => {
          setIsChangingPassword(false);
          if (Platform.OS === 'web') {
            alert('Contraseña actualizada con éxito.');
          } else {
            const { Alert } = require('react-native');
            Alert.alert('Éxito', 'Contraseña actualizada con éxito.');
          }
        }}
      />
    );
  }

  // Normal logged in profile screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Image
            source={require('@/assets/images/logosolotexto.png')}
            style={styles.logo}
          />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatar}>
            {!photoError && currentUser?.identificador ? (
              <Image
                source={{ uri: `${API_URL}/personas/${currentUser.identificador}/foto?t=${new Date().getTime()}` }}
                style={styles.avatarImage}
                onError={(e) => {
                  console.log('Error al cargar la foto de perfil en el frontend:', e.nativeEvent.error);
                  setPhotoError(true);
                }}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {currentUser?.nombre ? currentUser.nombre[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <Text style={styles.userName}>
            {currentUser?.nombre} {currentUser?.apellido || ''}
          </Text>

          <View style={styles.divider} />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {(currentUser?.categoria || 'comun').toUpperCase()}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Las categorías permiten al acceso a diferentes niveles de remates.
          </Text>
          <TouchableOpacity>
            <Text style={styles.learnMore}>Conocer más</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
        </View>

        {pendingDebt && (
          <View style={styles.debtSection}>
            <View style={styles.debtCard}>
              <View style={styles.debtIconCircle}>
                <SymbolView
                  tintColor="#BA4B4B"
                  // @ts-ignore
                  name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                  size={22}
                />
              </View>
              <View style={styles.debtContent}>
                <Text style={styles.debtTitle}>Participacion suspendida</Text>
                <Text style={styles.debtText}>
                  Tenes una multa pendiente. Regularizala para volver a participar en subastas.
                </Text>
                <Text style={styles.debtAmount}>Total: {formatDebtAmount(pendingDebt.montoTotal)}</Text>
                <Text style={styles.debtText}>Vence: {formatDebtDate(pendingDebt.fechaVencimiento)}</Text>
                <TouchableOpacity style={styles.debtButton} onPress={regularizeDebt}>
                  <Text style={styles.debtButtonText}>Regularizar deuda</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Image
                source={require('@/assets/images/rematesAsistidosLogo.png')}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>
                {currentUser?.rematesAsistidos !== undefined ? currentUser.rematesAsistidos : 0}
              </Text>
              <Text style={styles.statLabel}>Remates Asistidos</Text>
            </View>

            <View style={styles.statCard}>
              <Image
                source={require('@/assets/images/rematesGanadosLogo.png')}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>
                {currentUser?.rematesGanados !== undefined ? currentUser.rematesGanados : 0}
              </Text>
              <Text style={styles.statLabel}>Remates Ganados</Text>
            </View>

            <View style={styles.statCard}>
              <Image
                source={require('@/assets/images/articulosPublicadosLogo.png')}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>
                {currentUser?.articulosPublicados !== undefined ? currentUser.articulosPublicados : 0}
              </Text>
              <Text style={styles.statLabel}>Artículos Publicados</Text>
            </View>

            <View style={styles.statCard}>
              <Image
                source={require('@/assets/images/pujasRealizadasLogo.png')}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>
                {currentUser?.pujasRealizadas !== undefined ? currentUser.pujasRealizadas : 0}
              </Text>
              <Text style={styles.statLabel}>Pujas Realizadas</Text>
            </View>
          </View>
        </View>

        {/* Personal Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Opciones Personales</Text>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setIsPaymentModalVisible(true)}
          >
            <View style={styles.optionLeft}>
              <Image
                source={require('@/assets/images/logoMetodoDePago.png')}
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Ajustar Métodos de Pagos</Text>
            </View>
            <Image
              source={require('@/assets/images/Chevron-Right.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          {currentUser?.contrasenaCambiada && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => setIsChangingPassword(true)}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('@/assets/images/logoCambioContraseña.png')}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Cambiar Contraseña</Text>
              </View>
              <Image
                source={require('@/assets/images/Chevron-Right.png')}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.optionItem}
            onPress={async () => {
              try {
                await AsyncStorage.removeItem('hasSeenOnboarding');
                await AsyncStorage.removeItem('hasSeenAuth');
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('tokenSesion');
                await AsyncStorage.removeItem('isGuest');
                if (Platform.OS === 'web') {
                  alert('Onboarding y sesión restablecidos. Por favor, reinicia la aplicación.');
                } else {
                  Alert.alert(
                    'Restablecer Aplicación',
                    'Se han limpiado los datos de la aplicación. Por favor, recarga o reinicia la app para ver el onboarding de nuevo.',
                    [{ text: 'Entendido' }]
                  );
                }
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <View style={styles.optionLeft}>
              <SymbolView
                tintColor="#8A8A8A"
                // @ts-ignore
                name={{ ios: 'arrow.counterclockwise.circle.fill', android: 'restart_alt', web: 'restart_alt' }}
                size={20}
              />
              <Text style={styles.optionText}>Reiniciar Onboarding y Sesión</Text>
            </View>
            <Image
              source={require('@/assets/images/Chevron-Right.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <PaymentMethodsScreen
          userId={currentUser?.identificador}
          onBack={() => setIsPaymentModalVisible(false)}
          onComplete={() => setIsPaymentModalVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#051C2C',
  },
  logo: {
    width: 90,
    height: 35,
    resizeMode: 'contain',
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    alignSelf: 'stretch',
    marginVertical: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#BEE757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 16,
    marginTop: 12,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#051C2C',
  },
  description: {
    fontSize: 15,
    color: '#717375',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  learnMore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#051C2C',
    textDecorationLine: 'underline',
  },
  debtSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  debtCard: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#FFCBCB',
    backgroundColor: '#FFF6F6',
    borderRadius: 8,
    padding: 16,
  },
  debtIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtContent: {
    flex: 1,
  },
  debtTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BA4B4B',
    marginBottom: 6,
  },
  debtText: {
    fontSize: 13,
    color: '#5F3333',
    lineHeight: 19,
    marginBottom: 6,
  },
  debtAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 4,
  },
  debtButton: {
    marginTop: 10,
    backgroundColor: '#BA4B4B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  debtButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#717375',
    textAlign: 'left',
    lineHeight: 16,
    fontWeight: '500',
  },
  optionsSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  chevronIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    tintColor: '#03161A',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#051C2C',
  },
  logoutButton: {
    backgroundColor: '#E63946',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Guest Screen Styles
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  guestContentBox: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  guestMainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  brandTextPrimary: {
    color: '#BAEB51', // Light green / yellow
    fontFamily: 'logo',
  },
  brandTextSecondary: {
    color: '#2B9463', // Dark green
    fontFamily: 'logo',
  },
  guestSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  guestButtonGroup: {
    width: '100%',
    gap: 16,
  },
  guestCreateButton: {
    backgroundColor: '#BEE757', // Bright lime yellow-green matching screenshot
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  guestCreateButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestLoginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#03161A',
  },
  guestLoginButtonText: {
    color: '#03161A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
