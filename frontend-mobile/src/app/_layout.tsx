import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function checkState() {
      try {
        const hasSeenOnboardingStr = await AsyncStorage.getItem('hasSeenOnboarding');
        setIsFirstLaunch(hasSeenOnboardingStr === null);

        const hasSeenAuthStr = await AsyncStorage.getItem('hasSeenAuth');
        setHasSeenAuth(hasSeenAuthStr === 'true');

        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          setCurrentUser(JSON.parse(userStr));
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
        const shouldBeAuth = hasSeenAuthStr === 'true';
        if (hasSeenAuth !== null && shouldBeAuth !== hasSeenAuth) {
          setHasSeenAuth(shouldBeAuth);
        }

        const userStr = await AsyncStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : null;
        if (JSON.stringify(userObj) !== JSON.stringify(currentUser)) {
          setCurrentUser(userObj);
        }

        const redirect = await AsyncStorage.getItem('authRedirect');
        if (redirect === 'register') {
          setIsRegistering(true);
          await AsyncStorage.removeItem('authRedirect');
        } else if (redirect === 'login') {
          setIsLoggingIn(true);
          await AsyncStorage.removeItem('authRedirect');
        }
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [hasSeenAuth, currentUser]);

  if (isFirstLaunch === null || hasSeenAuth === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
          onComplete={() => {
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
            setIsShowingWelcome(false);
            await AsyncStorage.setItem('hasSeenAuth', 'true');
            await AsyncStorage.removeItem('isGuest');
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
            setIsConfirmingEmail(false);
            // Al finalizar el registro, el usuario continúa en la aplicación en modo invitado
            await AsyncStorage.setItem('hasSeenAuth', 'true');
            await AsyncStorage.setItem('isGuest', 'true');
            setHasSeenAuth(true);
          }}
        />
      );
    }

    if (isRegistering) {
      return (
        <RegisterScreen 
          onBack={async () => {
            setIsRegistering(false);
            const isGuestStr = await AsyncStorage.getItem('isGuest');
            if (isGuestStr === 'true') {
              await AsyncStorage.setItem('hasSeenAuth', 'true');
              setHasSeenAuth(true);
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
            setIsLoggingIn(false);
            const isGuestStr = await AsyncStorage.getItem('isGuest');
            if (isGuestStr === 'true') {
              await AsyncStorage.setItem('hasSeenAuth', 'true');
              setHasSeenAuth(true);
            }
          }}
          onSuccess={async (user, requiereConfiguracion) => {
            setCurrentUser(user);
            setIsLoggingIn(false);
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
      <AuthScreen 
        onComplete={() => setHasSeenAuth(true)} 
        onRegister={() => setIsRegistering(true)} 
        onLogin={() => setIsLoggingIn(true)}
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
