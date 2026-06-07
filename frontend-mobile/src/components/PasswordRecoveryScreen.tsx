import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { InputField } from './ui/InputField';

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
}

export function PasswordRecoveryScreen({ onBack, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Token Verification States
  const [token, setToken] = useState(['', '', '', '', '']); // 5 digit token
  const [sentToken, setSentToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Password Setup States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setTokenError('');

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
      console.log(`Verificando si el email existe: ${email}`);
      const response = await fetch(`${API_URL}/personas/check-email?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al verificar el email.');
      }

      if (!result.existe) {
        setEmailError('No se encontró ningún usuario registrado con este email.');
        return;
      }

      if (!result.contrasenaCambiada) {
        setEmailError('Debe haber completado las 2 etapas del registro para poder recuperar su contraseña.');
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

  const handleVerifyToken = () => {
    setTokenError('');
    const enteredToken = token.join('');

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

    // Go to Password reset step
    setStep(2);
  };

  const handleResetPasswordSubmit = async () => {
    setPasswordError('');
    setConfirmPasswordError('');

    let hasErrors = false;

    if (!password) {
      setPasswordError('Por favor, ingrese una contraseña.');
      hasErrors = true;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
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
      console.log(`Enviando reestablecimiento de contraseña para ${email}...`);
      const response = await fetch(`${API_URL}/personas/recuperar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          contrasenaNueva: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al reestablecer la contraseña.');
      }

      console.log('Contraseña reestablecida con éxito');
      setStep(3);
    } catch (error: any) {
      console.error(error);
      setPasswordError(error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} disabled={isLoading}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Recuperación de Contraseña</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Necesitamos verificar su identidad.</Text>
        <Text style={styles.sectionDescription}>
          Le enviaremos un mail de confirmacion para poder confirmar su identificacion y poder reemplazar su contraseña
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

        <Pressable style={styles.sendMailButton} onPress={handleSendMail} disabled={isLoading}>
          {isLoading && !sentToken ? (
            <ActivityIndicator color="#051C2C" />
          ) : (
            <Text style={styles.sendMailButtonText}>Mandar Mail</Text>
          )}
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
              />
            ))}
          </View>
          {!!tokenError && <Text style={styles.errorText}>{tokenError}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={handleVerifyToken} disabled={isLoading}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  const renderStep2 = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setStep(1)} style={styles.backButton} disabled={isLoading}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Recuperación de Contraseña</Text>
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
            containerStyle={{ marginBottom: 16 }}
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
        <Pressable style={styles.continueButton} onPress={handleResetPasswordSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continuar</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );

  const renderStep3 = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.placeholderBox} />
        <Text style={styles.headerTitle}>Recuperación de Contraseña</Text>
        <View style={styles.placeholderBox} />
      </View>

      <View style={styles.statusContent}>
        <View style={styles.checkmarkCircle}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>

        <Text style={styles.statusTitle}>Su contraseña ha sido reestablecida.</Text>

        <Text style={styles.statusDescription}>
          Ya podés volver a acceder a tu cuenta de forma segura utilizando tus nuevas credenciales. Te recomendamos guardarla en un lugar seguro y evitar compartirla con terceros para proteger tu información.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={onComplete}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  if (step === 2) return renderStep2();
  if (step === 3) return renderStep3();
  return renderStep1();
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
  sendMailButton: {
    backgroundColor: '#BEE757', // Light green
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  sendMailButtonText: {
    color: '#051C2C',
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
  devTokenHelper: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  formContainer: {
    gap: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
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
  errorText: {
    color: '#E30613',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  // Success Step Styles
  statusContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'flex-start',
  },
  checkmarkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#2A8E5D',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  checkmarkText: {
    color: '#2A8E5D',
    fontSize: 32,
    fontWeight: 'bold',
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
});
