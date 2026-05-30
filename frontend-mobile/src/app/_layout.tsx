import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Onboarding } from '@/components/Onboarding';
import { AuthScreen } from '@/components/AuthScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { EmailConfirmationScreen } from '@/components/EmailConfirmationScreen';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [hasSeenAuth, setHasSeenAuth] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState<boolean>(false);

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
    if (isConfirmingEmail) {
      return (
        <EmailConfirmationScreen 
          onBack={() => {
            setIsConfirmingEmail(false);
            setIsRegistering(true);
          }}
          onComplete={async () => {
            await AsyncStorage.setItem('hasSeenAuth', 'true');
            setHasSeenAuth(true);
          }}
        />
      );
    }
    if (isRegistering) {
      return (
        <RegisterScreen 
          onBack={() => setIsRegistering(false)} 
          onComplete={() => {
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
