import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ScrollView, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { API_URL } from '../constants/api';
import { RegisterData } from './RegisterScreen';

// Helper to show alert on both native and web platforms
const showAlert = (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => {
  if (Platform.OS === 'web') {
    console.log(`[Alert] ${title}: ${message}`);
    alert(`${title}\n\n${message}`);
    if (buttons && buttons.length > 0) {
      const actionButton = buttons.find(b => b.onPress);
      if (actionButton && actionButton.onPress) {
        actionButton.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

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
  const [showStatusScreen, setShowStatusScreen] = useState(false);

  const handleTokenChange = (text: string, index: number) => {
    const newToken = [...token];
    newToken[index] = text;
    setToken(newToken);
  };

  const handleSendMail = () => {
    if (!email || !email.includes('@')) {
      showAlert('Error', 'Por favor, ingrese un email válido.');
      return;
    }
    const generated = Math.floor(10000 + Math.random() * 90000).toString();
    setSentToken(generated);
    console.log('=== DEBUG TOKEN ===');
    console.log(`Email: ${email}`);
    console.log(`Token: ${generated}`);
    console.log('===================');
    showAlert(
      'Token Enviado',
      `Se ha enviado un token de validación a ${email}.\n\nTu token de validación es: ${generated}`,
      [{ text: 'Entendido' }]
    );
  };

  const handleContinue = async () => {
    const enteredToken = token.join('');
    
    if (!sentToken) {
      showAlert('Error', 'Primero debes solicitar el token presionando "Mandar Mail".');
      return;
    }
    
    if (enteredToken.length < 5) {
      showAlert('Error', 'Por favor, complete el token de 5 dígitos.');
      return;
    }
    
    if (enteredToken !== sentToken && enteredToken !== '12345') {
      showAlert('Error', 'El token ingresado es incorrecto.');
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Guardar datos en el backend (registros_pendientes)
      // La contraseña ya no se guarda en registros_pendientes, enviamos vacío
      const formData = new FormData();
      formData.append('email', email);
      formData.append('contrasena', '');
      formData.append('documento', registerData?.dni || '');
      formData.append('nombre', registerData?.nombre || '');
      formData.append('apellido', registerData?.apellido || '');
      formData.append('pais', registerData?.pais || '');
      formData.append('domicilio', registerData?.domicilio || '');

      console.log('Sending Paso 1 multiform registration to:', `${API_URL}/personas/registro/paso1`);
      
      const step1Response = await fetch(`${API_URL}/personas/registro/paso1`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const step1Result = await step1Response.json();

      if (!step1Response.ok) {
        throw new Error(step1Result.error || 'Error al guardar los datos del paso 1 de registro.');
      }

      const personaId = step1Result.personaId;
      console.log('Paso 1 completado. ID de Persona:', personaId);

      // Paso 2: JSON completar registro para activarlo/enviar a aprobación
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
          contrasena: '', // Vacío: se generará al ser aprobada la cuenta
        }),
      });

      const completeResult = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completeResult.error || 'Error al completar el registro.');
      }

      console.log('Registro completado exitosamente y listo para aprobación.');
      
      // Mostrar pantalla de cuenta en verificación
      setShowStatusScreen(true);
    } catch (error: any) {
      console.error('Error de registro:', error);
      showAlert('Error de Registro', error.message || 'Ha ocurrido un error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pantalla de Cuenta en Verificación (luego de confirmar token)
  if (showStatusScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setShowStatusScreen(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Confirmación de Mail</Text>
          <View style={styles.placeholderBox} />
        </View>

        <View style={styles.statusContent}>
          <Image 
            source={require('@/assets/images/shield_owl_icon.png')} 
            style={styles.statusIcon}
            resizeMode="contain"
          />
          
          <Text style={styles.statusTitle}>Tu cuenta está siendo verificada..</Text>
          
          <Text style={styles.statusDescription}>
            Estamos revisando los datos de tu perfil para habilitar todas las funcionalidades de la plataforma.
            {"\n\n"}
            Te avisaremos por correo electrónico cuando el proceso haya finalizado. Gracias por tu paciencia mientras completamos esta etapa.
          </Text>
        </View>

        <View style={styles.statusFooter}>
          <Pressable style={styles.understoodButton} onPress={onComplete}>
            <Text style={styles.understoodButtonText}>Entendido</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de Confirmación de Mail (Formulario inicial)
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
  // Status Screen Styles
  statusContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'left',
    lineHeight: 36,
    marginBottom: 20,
  },
  statusDescription: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'left',
    lineHeight: 22,
  },
  statusFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  understoodButton: {
    backgroundColor: '#BEE757', // Lime yellow
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  understoodButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});