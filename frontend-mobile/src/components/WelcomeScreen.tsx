// Ofrece la entrada inicial al registro, login o navegacion como invitado.
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
          source={require('@/assets/images/logosintexto.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>
          Oficialmente{'\u00A0'}eres parte de la comunidad de{" "}
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
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    width: 76,
    height: 76,
    marginBottom: 42,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#051C2C',
    lineHeight: 40,
    marginBottom: 24,
  },
  brandTextPrimary: {
    color: '#BAEB51',
    fontFamily: 'parkinsans',
    fontWeight: '500',
  },
  brandTextSecondary: {
    color: '#2B9463',
    fontFamily: 'parkinsans',
    fontWeight: '500',
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

