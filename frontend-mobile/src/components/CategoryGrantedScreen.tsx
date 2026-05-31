import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  category?: string;
  onContinue: () => void;
}

export const CategoryGrantedScreen: React.FC<Props> = ({ category = 'COMÚN', onContinue }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.title}>Se le ha otorgado la siguiente categoria.</Text>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{category}</Text>
        </View>

        <Text style={styles.description}>
          Las categorías sirven para determinar a qué subastas puede acceder cada usuario según su nivel de autorización dentro de la plataforma.
          {"\n\n"}
          Estas pueden ser común, especial, plata, oro o platino. Una subasta también tiene su propia categoría, y el usuario solo puede participar si su categoría es igual o superior a la exigida por esa subasta.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Continuar</Text>
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#2E9F64',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkMark: {
    color: '#2E9F64',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 24,
  },
  badgeContainer: {
    backgroundColor: '#BEE757', // Matching the bright yellow-green from the screenshot/auth screen
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  badgeText: {
    color: '#051C2C',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  description: {
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#2E9F64', // Dark green to match screenshot
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

