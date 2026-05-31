import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  category?: string;
  onContinue: () => void;
}

export const CategoryGrantedScreen: React.FC<Props> = ({ category = 'COMÚN', onContinue }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>

      <Text style={styles.title}>Se le ha otorgado la siguiente categoria.</Text>

      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{category}</Text>
      </View>

      <Text style={styles.description}>
        Las categorías sirven para determinar a qué subastas puede acceder cada usuario según su nivel de autorización dentro de la
        plataforma. Estas pueden ser común, especial, plata, oro o platino. Una subasta también tiene su propia categoría, y el usuario
        solo puede participar si su categoría es igual o superior a la exigida por esa subasta.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 24, backgroundColor: '#fff' },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#1E9658',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  checkMark: { color: '#1E9658', fontSize: 30, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#001b2a', marginBottom: 18 },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#bcf259',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  badgeText: { color: '#001b2a', fontWeight: '800', fontSize: 16 },
  description: { color: '#8A8A8A', lineHeight: 20, marginBottom: 30 },
  button: { backgroundColor: '#1E9658', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 'auto', marginBottom: 30 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
