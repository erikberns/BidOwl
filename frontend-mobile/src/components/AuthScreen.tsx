import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onComplete: () => void;
  onRegister?: () => void;
  onLogin?: () => void;
}

export function AuthScreen({ onComplete, onRegister, onLogin }: Props) {
  const handleGuest = async () => {
    await AsyncStorage.setItem('hasSeenAuth', 'true');
    await AsyncStorage.setItem('isGuest', 'true');
    onComplete();
  };

  const handleAuth = async () => {
    if (onLogin) {
      onLogin();
    } else {
      await AsyncStorage.setItem('hasSeenAuth', 'true');
      onComplete();
    }
  };

  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister();
    } else {
      handleAuth();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Image 
          source={require('../../assets/images/SplashBidOwl.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            Bienvenido a <Text style={styles.brandTextPrimary}>Bid</Text><Text style={styles.brandTextSecondary}>Owl</Text>
          </Text>
          <Text style={styles.subtitle}>
            La mejor forma de competir{'\n'}por lo que querés
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.primaryButton} onPress={handleRegisterClick}>
              <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleAuth}>
              <Text style={styles.secondaryButtonText}>Iniciar Sesión</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleGuest} style={styles.guestContainer}>
            <Text style={styles.guestText}>Continuar como invitado</Text>
            <View style={styles.guestUnderline} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07151C', // Dark background from design
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    minHeight: '45%',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  brandTextPrimary: {
    color: '#BEE757', // Light green
  },
  brandTextSecondary: {
    color: '#2E9F64', // Dark green
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  guestContainer: {
    paddingVertical: 8,
  },
  guestText: {
    color: '#666',
    fontSize: 14,
  },
  guestUnderline: {
    height: 1,
    backgroundColor: '#666',
    marginTop: 2,
  },
});