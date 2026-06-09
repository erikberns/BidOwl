import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Onboarding } from '@/components/Onboarding';
import { AuthScreen } from '@/components/AuthScreen';
import { RegisterScreen, RegisterData } from '@/components/RegisterScreen';
import { EmailConfirmationScreen } from '@/components/EmailConfirmationScreen';
import { PasswordScreen } from '@/components/PasswordScreen';
import { PaymentMethodsScreen } from '@/components/PaymentMethodsScreen';
import { CategoryGrantedScreen } from '@/components/CategoryGrantedScreen';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { LoginScreen } from '@/components/LoginScreen';
import { ProfilePhotoScreen } from '@/components/ProfilePhotoScreen';
import { PasswordRecoveryScreen } from '@/components/PasswordRecoveryScreen';

export default function TabLayout() {
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

  if (isFirstLaunch === null || hasSeenAuth === null) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <StatusBar style="dark" />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
            <ActivityIndicator size="large" />
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

    return (
      <>
        <AnimatedSplashOverlay />
        <AppTabs />
      </>
    );
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
