import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { InputField } from './ui/InputField';

interface Props {
  userId?: number;
  onBack: () => void;
  onComplete: () => void;
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

export function PasswordScreen({ userId, onBack, onComplete }: Props) {
  const [password, setPassword] = useState('contraseñafachera');
  const [confirmPassword, setConfirmPassword] = useState('contraseñafachera');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleContinue = async () => {
    setPasswordError('');
    setConfirmPasswordError('');

    let hasErrors = false;

    if (!password) {
      setPasswordError('Por favor, ingrese una contraseña.');
      hasErrors = true;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres de longitud.');
      hasErrors = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Por favor, confirme su contraseña.');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    try {
      let finalUserId = userId;
      let currentPassword = '';

      // Cargar la contraseña actual (temporal) desde storage para validar que no sea igual
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        finalUserId = userObj.identificador;
        currentPassword = userObj.contrasena;
      }

      if (currentPassword && password === currentPassword) {
        setPasswordError('La nueva contraseña no puede ser la misma que la contraseña temporal otorgada.');
        setIsLoading(false);
        return;
      }

      if (!finalUserId) {
        throw new Error('No se encontró el identificador del usuario para cambiar la contraseña.');
      }

      console.log(`Enviando cambio de contraseña para el usuario ${finalUserId}...`);
      const response = await fetch(`${API_URL}/personas/${finalUserId}/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contrasenaNueva: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la contraseña.');
      }

      console.log('Contraseña actualizada con éxito');
      
      // Actualizar la contraseña en el storage local
      const storedUserStr = await AsyncStorage.getItem('user');
      if (storedUserStr) {
        const userObj = JSON.parse(storedUserStr);
        userObj.contrasena = password;
        await AsyncStorage.setItem('user', JSON.stringify(userObj));
      }

      onComplete();
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      setPasswordError(error.message || 'Error al conectar con el servidor.');
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
        <Text style={styles.headerTitle}>Crear Contraseña</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Mantenga su cuenta segura con una buena contraseña.</Text>
        <Text style={styles.sectionDescription}>
          Esto protegerá tu información personal y garantizará que solo vos puedas acceder a tu cuenta en todo momento.
        </Text>

        <View style={styles.formContainer}>
          <InputField
            label="Crear Contraseña"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError('');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!isLoading}
            error={passwordError}
            headerRight={
              <Pressable onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            }
          />

          <InputField
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!isLoading}
            error={confirmPasswordError}
            headerRight={
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                <Text style={styles.toggleText}>{showConfirmPassword ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            }
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={handleContinue} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continuar</Text>
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
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
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
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
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
  continueButton: {
    backgroundColor: '#2A8E5D', // Darker green
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});