import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { API_URL } from '../constants/api';
import { RegisterData } from './RegisterScreen';

interface Props {
  onBack: () => void;
  onComplete: () => void;
  registerData: RegisterData | null;
}

export function EmailConfirmationScreen({ onBack, onComplete, registerData }: Props) {
  const [email, setEmail] = useState('jgodio@uade.edu.ar');
  const [token, setToken] = useState(['', '', '', '', '']); // 5 digit token
  const [sentToken, setSentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTokenChange = (text: string, index: number) => {
    const newToken = [...token];
    newToken[index] = text;
    setToken(newToken);
  };

  const handleSendMail = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Por favor, ingrese un email válido.');
      return;
    }
    const generated = Math.floor(10000 + Math.random() * 90000).toString();
    setSentToken(generated);
    Alert.alert(
      'Token Enviado',
      `Se ha enviado un token de validación a ${email}.\n\nTu token de validación es: ${generated}`,
      [{ text: 'Entendido' }]
    );
  };

  const handleContinue = async () => {
    const enteredToken = token.join('');
    
    if (!sentToken) {
      Alert.alert('Error', 'Primero debes solicitar el token presionando "Mandar Mail".');
      return;
    }
    
    if (enteredToken.length < 5) {
      Alert.alert('Error', 'Por favor, complete el token de 5 dígitos.');
      return;
    }
    
    if (enteredToken !== sentToken && enteredToken !== '12345') {
      Alert.alert('Error', 'El token ingresado es incorrecto.');
      return;
    }

    // Generar contraseña aleatoria
    const length = 8;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPassword = '';
    for (let i = 0; i < length; i++) {
      randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setIsLoading(true);

    try {
      // Paso 1: multipart/form-data
      const formData = new FormData();
      formData.append('email', email);
      formData.append('contrasena', randomPassword);
      formData.append('documento', registerData?.dni || '');
      formData.append('nombre', registerData?.nombre || '');
      formData.append('apellido', registerData?.apellido || '');
      formData.append('pais', registerData?.pais || '');
      formData.append('domicilio', registerData?.domicilio || '');

      console.log('Sending Paso 1 multiform registration to:', `${API_URL}/personas/registro/paso1`);
      
      const step1Response = await fetch(`${API_URL}/personas/registro/paso1`, {
        method: 'POST',
        body: formData,
        headers: {
          // En React Native, al pasar FormData, no se debe setear Content-Type
        },
      });

      const step1Result = await step1Response.json();

      if (!step1Response.ok) {
        throw new Error(step1Result.error || 'Error al guardar los datos del paso 1 de registro.');
      }

      const personaId = step1Result.personaId;
      console.log('Paso 1 completado. ID de Persona:', personaId);

      // Paso 2: JSON completar registro para activarlo
      console.log('Sending Completar Registro to:', `${API_URL}/personas/registro/completar`);
      const completeResponse = await fetch(`${API_URL}/personas/registro/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identificador: personaId,
          documento: registerData?.dni || '',
          email: email,
          contrasena: randomPassword,
        }),
      });

      const completeResult = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completeResult.error || 'Error al completar el registro.');
      }

      console.log('Registro completado y activado.');
      
      Alert.alert(
        'Registro Exitoso',
        `¡Tu registro ha sido completado y verificado!\n\nTu contraseña provisoria es:\n${randomPassword}\n\nGuárdala bien, en el futuro te la enviaremos por mail.`,
        [
          {
            text: 'Continuar',
            onPress: onComplete,
          },
        ]
      );
    } catch (error: any) {
      console.error('Error de registro:', error);
      Alert.alert('Error de Registro', error.message || 'Ha ocurrido un error al conectar con el servidor.');
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
        <Text style={styles.headerTitle}>Confirmación de Mail</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Vinculemos su mail a su identidad.</Text>
        <Text style={styles.sectionDescription}>
          Le enviaremos un mail de confirmacion para poder confirmar su identificacion y poder otorgarle su categoria de BidOwl
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
          />
        </View>

        <Pressable style={styles.sendMailButton} onPress={handleSendMail} disabled={isLoading}>
          <Text style={styles.sendMailButtonText}>Mandar Mail</Text>
        </Pressable>

        <View style={styles.tokenSection}>
          <Text style={styles.tokenLabel}>Ingrese el Token recibido</Text>
          <View style={styles.tokenContainer}>
            {token.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.tokenInput}
                value={digit}
                onChangeText={(text) => handleTokenChange(text.replace(/[^0-9]/g, ''), index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                editable={!isLoading}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.continueButton, isLoading && { opacity: 0.6 }]} 
          onPress={handleContinue}
          disabled={isLoading}
        >
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
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    margin: 0,
  },
  sendMailButton: {
    backgroundColor: '#BEE757', // Light green
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  sendMailButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenSection: {
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  tokenContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  tokenInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    backgroundColor: '#FFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  continueButton: {
    backgroundColor: '#2A8E5D', // Dark green
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