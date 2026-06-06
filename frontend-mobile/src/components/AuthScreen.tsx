import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { InputField } from './ui/InputField';

interface Props {
  onComplete: () => void;
  onRegister?: () => void;
  onLogin?: () => void;
  onLoginSuccess?: (user: any, requiereConfiguracion: boolean) => void;
  onForgotPassword?: () => void;
}

export function AuthScreen({ onComplete, onRegister, onLogin, onLoginSuccess, onForgotPassword }: Props) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGuest = async () => {
    await AsyncStorage.setItem('hasSeenAuth', 'true');
    await AsyncStorage.setItem('isGuest', 'true');
    onComplete();
  };

  const handleAuth = async () => {
    // If accessed from pre-menu, show bottom sheet login form instead of full screen
    setShowLoginForm(true);
  };

  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister();
    } else {
      // Fallback
      onComplete();
    }
  };

  const handleLoginSubmit = async () => {
    setEmailError('');
    setPasswordError('');

    let hasErrors = false;

    if (!email) {
      setEmailError('El email es obligatorio.');
      hasErrors = true;
    } else if (!email.includes('@')) {
      setEmailError('Por favor, ingrese un email válido.');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Por favor, ingrese su contraseña.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Enviando petición de login a:', `${API_URL}/personas/login`);
      const response = await fetch(`${API_URL}/personas/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          contrasena: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al iniciar sesión.');
      }

      console.log('Login exitoso:', result);

      // Guardar usuario en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(result.persona));
      await AsyncStorage.removeItem('isGuest');

      if (result.requiereConfiguracion) {
        await AsyncStorage.setItem('registrationStage2Status', 'in_progress');
        await AsyncStorage.setItem('registrationStage2Step', 'password');
      }

      if (onLoginSuccess) {
        onLoginSuccess(result.persona, result.requiereConfiguracion);
      } else {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error de login:', error);
      setEmailError(error.message || 'Ha ocurrido un error al conectar con el servidor.');
      setPasswordError(' ');
    } finally {
      setIsLoading(false);
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
          {!showLoginForm ? (
            <>
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
            </>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.title}>
                Bienvenido a <Text style={styles.brandTextPrimary}>BidOwl</Text>
              </Text>
              <Text style={styles.subtitleForm}>
                La mejor forma de competir por lo que querés
              </Text>

              <InputField
                label="Email"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                error={emailError}
                containerStyle={{ marginBottom: 16 }}
              />

              <InputField
                label="Contraseña"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={true}
                autoCapitalize="none"
                editable={!isLoading}
                error={passwordError}
                containerStyle={{ marginBottom: 8 }}
              />

              <Pressable style={styles.forgotContainer} onPress={onForgotPassword}>
                <Text style={styles.forgotText}>Olvide mi contraseña</Text>
              </Pressable>

              <View style={styles.bottomRow}>
                <Pressable style={styles.backBtn} onPress={() => setShowLoginForm(false)} disabled={isLoading}>
                  <Text style={styles.backBtnText}>{'<'}</Text>
                </Pressable>
                <Pressable style={styles.loginBtn} onPress={handleLoginSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
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
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
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
  subtitleForm: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
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
  formContainer: {
    width: '100%',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotText: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 16,
  },
  backBtn: {
    backgroundColor: '#07151C',
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loginBtn: {
    backgroundColor: '#BEE757',
    flex: 1,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});