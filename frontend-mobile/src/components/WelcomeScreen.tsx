import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/SplashBidOwl.png')} 
          style={styles.logo} 
        />
        
        <Text style={styles.title}>
          Oficialmente eres parte de la comunidad de{" "}
          <Text style={styles.brandTextPrimary}>Bid</Text>
          <Text style={styles.brandTextSecondary}>Owl</Text>.
        </Text>

        <Text style={styles.subtitle}>
          Entrás a un espacio donde cada oferta tiene peso, donde podés descubrir oportunidades únicas, competir en tiempo real y transformar lo que tenés en valor.
          {"\n\n"}
          Tu experiencia en subastas empieza ahora.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>¡Empezar!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'flex-start',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'left',
    lineHeight: 40,
    marginBottom: 24,
  },
  brandTextPrimary: {
    color: '#BEE757',
  },
  brandTextSecondary: {
    color: '#2E9F64',
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  startButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#051C2C',
    fontWeight: '800',
    fontSize: 16,
  },
});

