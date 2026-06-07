import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { InputField } from './ui/InputField';

interface Props {
  onBack: () => void;
  onSuccess: (user: any, requiereConfiguracion: boolean) => void;
  onForgotPassword?: () => void;
}

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.log(`[Alert] ${title}: ${message}`);
    alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

export function LoginScreen({ onBack, onSuccess, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
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

      console.log('Login exitoso. Nombre:', result.persona?.nombre, 'ID:', result.persona?.identificador, 'Configuración requerida:', result.requiereConfiguracion);

      // Guardar usuario en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(result.persona));
      await AsyncStorage.removeItem('isGuest');
      if (result.requiereConfiguracion) {
        await AsyncStorage.setItem('registrationStage2Status', 'in_progress');
        await AsyncStorage.setItem('registrationStage2Step', 'password');
      }

      onSuccess(result.persona, result.requiereConfiguracion);
    } catch (error: any) {
      console.error('Error de login:', error);
      setEmailError(error.message || 'Ha ocurrido un error al conectar con el servidor.');
      setPasswordError(' ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} disabled={isLoading}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Iniciar Sesión</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Ingresá tus credenciales.</Text>
        <Text style={styles.sectionDescription}>
          Ingresá tu email y la contraseña asignada o tu contraseña personalizada para continuar.
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
          placeholder="ejemplo@uade.edu.ar"
          error={emailError}
          containerStyle={{ marginBottom: 20 }}
        />

        <InputField
          label="Contraseña"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (passwordError) setPasswordError('');
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!isLoading}
          placeholder="Contraseña"
          error={passwordError}
          headerRight={
            <Pressable onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
              <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          }
          containerStyle={{ marginBottom: 8 }}
        />

        {onForgotPassword && (
          <Pressable style={styles.forgotContainer} onPress={onForgotPassword} disabled={isLoading}>
            <Text style={styles.forgotText}>Olvide mi contraseña</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.loginButton, isLoading && { opacity: 0.6 }]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  placeholderBox: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  outerContainer: {
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  inputWrapperError: {
    borderColor: '#E30613',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#E30613',
    fontSize: 14,
    marginTop: 6,
    paddingLeft: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  toggleText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
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
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    margin: 0,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  loginButton: {
    backgroundColor: '#2A8E5D', // Dark green matching project theme
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
