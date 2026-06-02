import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

interface Props {
  onBack: () => void;
  onSuccess: (user: any, requiereConfiguracion: boolean) => void;
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

export function LoginScreen({ onBack, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      showAlert('Error', 'Por favor, ingrese un email válido.');
      return;
    }
    if (!password) {
      showAlert('Error', 'Por favor, ingrese su contraseña.');
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

      onSuccess(result.persona, result.requiereConfiguracion);
    } catch (error: any) {
      console.error('Error de login:', error);
      showAlert('Error de Login', error.message || 'Ha ocurrido un error al conectar con el servidor.');
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

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            placeholder="ejemplo@uade.edu.ar"
          />
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.passwordHeader}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <Pressable onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
              <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!isLoading}
            placeholder="Contraseña"
          />
        </View>
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
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
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
