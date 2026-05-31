import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface Props {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/expo.icon/Assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Oficialmente eres parte de la comunidad de BidOwl.</Text>
      <Text style={styles.subtitle}>
        Entrás a un espacio donde cada oferta tiene peso, donde podés descubrir oportunidades únicas, competir en tiempo real y
        transformar lo que tenés en valor. Tu experiencia en subastas empieza ahora.
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <Text style={styles.startButtonText}>¡Empezar!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 24, backgroundColor: '#fff', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '800', color: '#001b2a', textAlign: 'center', marginBottom: 12 },
  subtitle: { color: '#8A8A8A', textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  startButton: { backgroundColor: '#bcf259', padding: 16, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 'auto', marginBottom: 30 },
  startButtonText: { color: '#001b2a', fontWeight: '800', fontSize: 16 },
});
