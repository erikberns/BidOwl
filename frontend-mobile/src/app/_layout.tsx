// Configura la navegacion raiz, el tema y la restauracion de la sesion local.
import '@/utils/themeHelper'; // Patch Text/TextInput components immediately
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator, Platform } from 'react-native';
import {
  useFonts,
  Urbanist_300Light,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import {
  Parkinsans_700Bold,
  Parkinsans_800ExtraBold,
} from '@expo-google-fonts/parkinsans';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { Onboarding } from '@/components/Onboarding';
import { API_URL } from '@/constants/api';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { RegisterScreen, RegisterData } from '@/components/auth/RegisterScreen';
import { EmailConfirmationScreen } from '@/components/auth/EmailConfirmationScreen';
import { PasswordScreen } from '@/components/auth/PasswordScreen';
import { PaymentMethodsScreen } from '@/components/payment/PaymentMethodsScreen';
import { CategoryGrantedScreen } from '@/components/auth/CategoryGrantedScreen';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { ProfilePhotoScreen } from '@/components/auth/ProfilePhotoScreen';
import { PasswordRecoveryScreen } from '@/components/auth/PasswordRecoveryScreen';

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    'Urbanist-Light': Urbanist_300Light,
    'Urbanist-Regular': Urbanist_400Regular,
    'Urbanist-Medium': Urbanist_500Medium,
    'Urbanist-SemiBold': Urbanist_600SemiBold,
    'Urbanist-Bold': Urbanist_700Bold,
    'Urbanist-ExtraBold': Urbanist_800ExtraBold,
    'NunitoSans-Regular': NunitoSans_400Regular,
    'NunitoSans-SemiBold': NunitoSans_600SemiBold,
    'NunitoSans-Bold': NunitoSans_700Bold,
    'Parkinsans-Bold': Parkinsans_700Bold,
    'Parkinsans-ExtraBold': Parkinsans_800ExtraBold,
  });

  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [hasSeenAuth, setHasSeenAuth] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState<boolean>(false);
  const [isSettingPassword, setIsSettingPassword] = useState<boolean>(false);
  const [isSettingProfilePhoto, setIsSettingProfilePhoto] = useState<boolean>(false);
  const [isSettingPaymentMethods, setIsSettingPaymentMethods] = useState<boolean>(false);
  const [isCategoryGranted, setIsCategoryGranted] = useState<boolean>(false);
  const [isShowingWelcome, setIsShowingWelcome] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState<boolean>(false);
  const [recoverySource, setRecoverySource] = useState<'auth' | 'login' | null>(null);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function checkState() {
      try {
        const hasSeenOnboardingStr = await AsyncStorage.getItem('hasSeenOnboarding');
        setIsFirstLaunch(hasSeenOnboardingStr === null);

        const userStr = await AsyncStorage.getItem('user');
        let userExists = true;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const checkRes = await fetch(`${API_URL}/personas/${user.identificador}`);
            if (checkRes.status === 404) {
              userExists = false;
            }
          } catch (e) {
            console.warn('[Layout] Failed to check user existence:', e);
          }
        }

        if (!userExists) {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('hasSeenAuth');
          await AsyncStorage.removeItem('isGuest');
          await AsyncStorage.removeItem('registrationStage2Status');
          await AsyncStorage.removeItem('registrationStage2Step');
          setCurrentUser(null);
          setHasSeenAuth(false);
          setIsSettingProfilePhoto(false);
          setIsSettingPaymentMethods(false);
          setIsSettingPassword(false);
        } else {
          const stage2Status = await AsyncStorage.getItem('registrationStage2Status');
          const stage2Step = await AsyncStorage.getItem('registrationStage2Step');

          if (stage2Status === 'in_progress' && userStr) {
            setHasSeenAuth(false);
            const userObj = JSON.parse(userStr);
            setCurrentUser(userObj);
            if (stage2Step === 'photo') {
              setIsSettingProfilePhoto(true);
            } else if (stage2Step === 'payment_methods') {
              setIsSettingPaymentMethods(true);
            } else {
              setIsSettingPassword(true);
            }
          } else {
            const hasSeenAuthStr = await AsyncStorage.getItem('hasSeenAuth');
            setHasSeenAuth(hasSeenAuthStr === 'true');
            if (userStr) {
              setCurrentUser(JSON.parse(userStr));
            }
          }
        }
      } catch (error) {
        setIsFirstLaunch(false); // Fallback if error
        setHasSeenAuth(true);
      }
    }
    checkState();
  }, []);

  // Monitor storage to sync logout and redirect state changes dynamically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const hasSeenAuthStr = await AsyncStorage.getItem('hasSeenAuth');
        const userStr = await AsyncStorage.getItem('user');
        const redirect = await AsyncStorage.getItem('authRedirect');

        const shouldBeAuth = hasSeenAuthStr === 'true';
        const userObj = userStr ? JSON.parse(userStr) : null;

        if (redirect === 'register') {
          setIsRegistering(true);
          setHasSeenAuth(shouldBeAuth);
          await AsyncStorage.removeItem('authRedirect');
        } else if (redirect === 'login') {
          setIsLoggingIn(true);
          setHasSeenAuth(shouldBeAuth);
          await AsyncStorage.removeItem('authRedirect');
        } else {
          if (hasSeenAuth !== null && shouldBeAuth !== hasSeenAuth) {
            setHasSeenAuth(shouldBeAuth);
          }
        }

        if (JSON.stringify(userObj) !== JSON.stringify(currentUser)) {
          setCurrentUser(userObj);
        }
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [hasSeenAuth, currentUser]);

  const isDarkScreen = !hasSeenAuth && 
    !isRegistering && 
    !isLoggingIn && 
    !isRecoveringPassword && 
    !isSettingPassword && 
    !isConfirmingEmail && 
    !isSettingProfilePhoto && 
    !isSettingPaymentMethods && 
    !isCategoryGranted && 
    !isShowingWelcome &&
    !isFirstLaunch;

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    async function updateSystemBars() {
      try {
        const NavigationBar = require('expo-navigation-bar');
        // Always force a white bottom navigation bar with dark buttons since all screens have a white bottom
        await NavigationBar.setBackgroundColorAsync('#FFFFFF');
        await NavigationBar.setButtonStyleAsync('dark');
      } catch (e) {
        console.warn('Failed to update NavigationBar:', e);
      }
    }
    updateSystemBars();
  }, []);

  if (isFirstLaunch === null || hasSeenAuth === null || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <StatusBar style="dark" />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
            <ActivityIndicator size="large" color="#BAEB51" />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  const renderContent = () => {
    if (isFirstLaunch) {
      return <Onboarding onComplete={() => setIsFirstLaunch(false)} />;
    }

    if (!hasSeenAuth) {
      if (isSettingPaymentMethods) {
        return (
          <PaymentMethodsScreen 
            userId={currentUser?.identificador}
            onBack={() => {
              setIsSettingPaymentMethods(false);
              setIsSettingProfilePhoto(true);
            }}
            onComplete={async () => {
              await AsyncStorage.removeItem('registrationStage2Status');
              await AsyncStorage.removeItem('registrationStage2Step');
              setIsSettingPaymentMethods(false);
              setIsCategoryGranted(true);
            }}
          />
        );
      }

      if (isCategoryGranted) {
        return (
          <CategoryGrantedScreen
            category={currentUser?.categoria ? currentUser.categoria.toUpperCase() : 'COMÚN'}
            onContinue={() => {
              setIsCategoryGranted(false);
              setIsShowingWelcome(true);
            }}
          />
        );
      }

      if (isShowingWelcome) {
        return (
          <WelcomeScreen
            onStart={async () => {
              await AsyncStorage.setItem('hasSeenAuth', 'true');
              await AsyncStorage.removeItem('isGuest');
              setIsShowingWelcome(false);
              setHasSeenAuth(true);
            }}
          />
        );
      }

      if (isSettingProfilePhoto) {
        return (
          <ProfilePhotoScreen
            userId={currentUser?.identificador}
            onBack={() => {
              setIsSettingProfilePhoto(false);
              setIsSettingPassword(true);
            }}
            onComplete={() => {
              setIsSettingProfilePhoto(false);
              setIsSettingPaymentMethods(true);
            }}
          />
        );
      }

      if (isSettingPassword) {
        return (
          <PasswordScreen 
            userId={currentUser?.identificador}
            onBack={() => {
              setIsSettingPassword(false);
              setIsLoggingIn(true);
            }}
            onComplete={() => {
              setIsSettingPassword(false);
              setIsSettingProfilePhoto(true);
            }}
          />
        );
      }

      if (isConfirmingEmail) {
        return (
          <EmailConfirmationScreen 
            registerData={registerData}
            onBack={() => {
              setIsConfirmingEmail(false);
              setIsRegistering(true);
            }}
            onComplete={async () => {
              await AsyncStorage.setItem('hasSeenAuth', 'true');
              await AsyncStorage.setItem('isGuest', 'true');
              setIsConfirmingEmail(false);
              setHasSeenAuth(true);
            }}
          />
        );
      }

      if (isRegistering) {
        return (
          <RegisterScreen 
            onBack={async () => {
              const isGuestStr = await AsyncStorage.getItem('isGuest');
              if (isGuestStr === 'true') {
                await AsyncStorage.setItem('hasSeenAuth', 'true');
                setIsRegistering(false);
                setHasSeenAuth(true);
              } else {
                setIsRegistering(false);
              }
            }} 
            onComplete={(data) => {
              setRegisterData(data);
              setIsRegistering(false);
              setIsConfirmingEmail(true);
            }} 
          />
        );
      }

      if (isLoggingIn) {
        return (
          <LoginScreen
            onBack={async () => {
              const isGuestStr = await AsyncStorage.getItem('isGuest');
              if (isGuestStr === 'true') {
                await AsyncStorage.setItem('hasSeenAuth', 'true');
                setIsLoggingIn(false);
                setHasSeenAuth(true);
              } else {
                setIsLoggingIn(false);
              }
            }}
            onSuccess={async (user, requiereConfiguracion) => {
              setCurrentUser(user);
              if (requiereConfiguracion) {
                setIsLoggingIn(false);
                setIsSettingPassword(true);
              } else {
                await AsyncStorage.setItem('hasSeenAuth', 'true');
                await AsyncStorage.removeItem('isGuest');
                setIsLoggingIn(false);
                setHasSeenAuth(true);
              }
            }}
            onForgotPassword={() => {
              setRecoverySource('login');
              setIsLoggingIn(false);
              setIsRecoveringPassword(true);
            }}
          />
        );
      }

      if (isRecoveringPassword) {
        return (
          <PasswordRecoveryScreen
            onBack={() => {
              setIsRecoveringPassword(false);
              if (recoverySource === 'login') {
                setIsLoggingIn(true);
              }
              setRecoverySource(null);
            }}
            onComplete={() => {
              setIsRecoveringPassword(false);
              if (recoverySource === 'login') {
                setIsLoggingIn(true);
              }
              setRecoverySource(null);
            }}
          />
        );
      }

      return (
        <AuthScreen 
          onComplete={() => setHasSeenAuth(true)} 
          onRegister={() => setIsRegistering(true)} 
          onLogin={() => setIsLoggingIn(true)}
          onForgotPassword={() => {
            setRecoverySource('auth');
            setIsRecoveringPassword(true);
          }}
          onLoginSuccess={async (user, requiereConfiguracion) => {
            setCurrentUser(user);
            if (requiereConfiguracion) {
              setIsSettingPassword(true);
            } else {
              await AsyncStorage.setItem('hasSeenAuth', 'true');
              await AsyncStorage.removeItem('isGuest');
              setHasSeenAuth(true);
            }
          }}
        />
      );
    }

    return <AppTabs />;
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style={isDarkScreen ? 'light' : 'dark'} />
        {renderContent()}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
