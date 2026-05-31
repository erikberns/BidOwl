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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [hasSeenAuth, setHasSeenAuth] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState<boolean>(false);
  const [isSettingPassword, setIsSettingPassword] = useState<boolean>(false);
  const [isSettingPaymentMethods, setIsSettingPaymentMethods] = useState<boolean>(false);
  const [isCategoryGranted, setIsCategoryGranted] = useState<boolean>(false);
  const [isShowingWelcome, setIsShowingWelcome] = useState<boolean>(false);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);

  useEffect(() => {
    async function checkState() {
      try {
        const hasSeenOnboardingStr = await AsyncStorage.getItem('hasSeenOnboarding');
        setIsFirstLaunch(hasSeenOnboardingStr === null);

        const hasSeenAuthStr = await AsyncStorage.getItem('hasSeenAuth');
        setHasSeenAuth(hasSeenAuthStr === 'true');
      } catch (error) {
        setIsFirstLaunch(false); // Fallback if error
        setHasSeenAuth(true);
      }
    }
    checkState();
  }, []);

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
          onBack={() => {
            setIsSettingPaymentMethods(false);
            setIsSettingPassword(true);
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
            setHasSeenAuth(true);
          }}
        />
      );
    }
    if (isSettingPassword) {
      return (
        <PasswordScreen 
          onBack={() => {
            setIsSettingPassword(false);
            setIsConfirmingEmail(true);
          }}
          onComplete={() => {
            setIsSettingPassword(false);
            setIsSettingPaymentMethods(true);
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
          onComplete={() => {
            setIsConfirmingEmail(false);
            setIsSettingPaymentMethods(true);
          }}
        />
      );
    }
    if (isRegistering) {
      return (
        <RegisterScreen 
          onBack={() => setIsRegistering(false)} 
          onComplete={(data) => {
            setRegisterData(data);
            setIsRegistering(false);
            setIsConfirmingEmail(true);
          }} 
        />
      );
    }
    return <AuthScreen onComplete={() => setHasSeenAuth(true)} onRegister={() => setIsRegistering(true)} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
