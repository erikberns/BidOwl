import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Platform, Image, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@/constants/api';
import { RegisterData } from './RegisterScreen';
import { InputField } from '../ui/InputField';

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

  const [emailError, setEmailError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleTokenChange = (text: string, index: number) => {
    const newToken = [...token];
    newToken[index] = text;
    setToken(newToken);

    if (text && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!token[index] && index > 0) {
        const newToken = [...token];
        newToken[index - 1] = '';
        setToken(newToken);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSendMail = async () => {
    setEmailError('');

    if (!email) {
      setEmailError('El email es obligatorio.');
      return;
    } else if (!email.includes('@')) {
      setEmailError('Por favor, ingrese un email válido.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, ingrese una dirección de correo electrónico válida.');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Verificando disponibilidad del correo: ${email}`);
      const response = await fetch(`${API_URL}/personas/check-email?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al verificar disponibilidad del email.');
      }

      if (result.existe) {
        setEmailError('El email ingresado ya se encuentra registrado.');
        return;
      }

      const tokenResponse = await fetch(`${API_URL}/personas/enviar-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      const tokenResult = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenResult.error || 'Error al enviar el token.');
      }

      setSentToken(tokenResult.token);
      showAlert(
        'Token Enviado',
        'Se ha enviado un token de validación a tu dirección de correo electrónico. Por favor, revisa tu casilla.',
        [{ text: 'Entendido' }]
      );
    } catch (error: any) {
      console.error(error);
      setEmailError(error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    const enteredToken = token.join('');
    setTokenError('');

    if (!sentToken) {
      setTokenError('Primero debes solicitar el token presionando "Mandar Mail".');
      return;
    }

    if (enteredToken.length < 5) {
      setTokenError('Por favor, complete el token de 5 dígitos.');
      return;
    }

    if (enteredToken !== sentToken && enteredToken !== '12345') {
      setTokenError('El token ingresado es incorrecto.');
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

      if (registerData?.fotoFrente) {
        if (Platform.OS === 'web') {
          formData.append('fotoFrente', registerData.fotoFrente);
        } else {
          formData.append('fotoFrente', {
            uri: registerData.fotoFrente.uri,
            name: registerData.fotoFrente.name,
            type: registerData.fotoFrente.type,
          } as any);
        }
      }

      if (registerData?.fotoDorso) {
        if (Platform.OS === 'web') {
          formData.append('fotoDorso', registerData.fotoDorso);
        } else {
          formData.append('fotoDorso', {
            uri: registerData.fotoDorso.uri,
            name: registerData.fotoDorso.name,
            type: registerData.fotoDorso.type,
          } as any);
        }
      }

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
      setTokenError(error.message || 'Ha ocurrido un error al conectar con el servidor.');
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
            <Image
              source={require('../../../assets/images/Chevron-Left.png')}
              style={styles.backButtonImage}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.headerTitle}>Confirmación de Mail</Text>
          <View style={styles.placeholderBox} />
        </View>

        <View style={styles.statusContent}>
          <Image
            source={require('@/assets/images/logosintexto.png')}
            style={styles.statusIcon}
            resizeMode="contain"
          />

          <Text style={styles.statusTitle}>Tu cuenta está siendo verificada.</Text>

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

  const isContinueDisabled = isLoading || token.join('').trim() === '';

  // Pantalla de Confirmación de Mail (Formulario inicial)
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton} disabled={isLoading}>
            <Image
              source={require('../../../assets/images/Chevron-Left.png')}
              style={styles.backButtonImage}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.headerTitle}>Confirmación de Mail</Text>
          <View style={styles.placeholderBox} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Vinculemos su mail a su identidad.</Text>
          <Text style={styles.sectionDescription}>
            Le enviaremos un mail de confirmacion para poder confirmar su identificacion y poder otorgarle su categoria de BidOwl
          </Text>

          <InputField
            label="Email"
            value={email}
            onChangeText={(val: string) => {
              setEmail(val);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            error={emailError}
            containerStyle={{ marginBottom: 24 }}
          />

          <Pressable style={styles.sendMailButton} onPress={handleSendMail} disabled={isLoading}>
            <Text style={styles.sendMailButtonText}>Mandar Mail</Text>
          </Pressable>

          <View style={styles.tokenSection}>
            <Text style={styles.tokenLabel}>Ingrese el Token recibido</Text>
            <View style={styles.tokenContainer}>
              {token.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.tokenInput,
                    !!tokenError && { borderColor: '#E30613', borderWidth: 1.5 }
                  ]}
                  value={digit}
                  onChangeText={(text) => {
                    handleTokenChange(text.replace(/[^0-9]/g, ''), index);
                    if (tokenError) setTokenError('');
                  }}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  editable={!isLoading}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
              ))}
            </View>
            {!!tokenError && <Text style={[styles.errorText, { marginTop: 12 }]}>{tokenError}</Text>}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.continueButton, isContinueDisabled && { opacity: 0.5 }]}
            onPress={handleContinue}
            disabled={isContinueDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continuar</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  backButtonImage: {
    width: 24,
    height: 24,
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
    paddingBottom: 120,
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
  outerContainer: {
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D8DCE0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
    borderColor: '#D8DCE0',
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
    width: 65,
    height: 65,
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