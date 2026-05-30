import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ScrollView } from 'react-native';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export function EmailConfirmationScreen({ onBack, onComplete }: Props) {
  const [email, setEmail] = useState('jgodio@uade.edu.ar');
  const [token, setToken] = useState(['', '', '', '', '']); // 5 digit token

  const handleTokenChange = (text: string, index: number) => {
    const newToken = [...token];
    newToken[index] = text;
    setToken(newToken);
    // Auto-advance logic would go here in a full implementation
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
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
          />
        </View>

        <Pressable style={styles.sendMailButton}>
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
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={onComplete}>
          <Text style={styles.continueButtonText}>Continuar</Text>
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