// Muestra una alternativa de mapa compatible con navegadores web.
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function MapComponent({ selectedLocation, onLocationChange }: any) {
  return (
    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Image 
        source={require('@/assets/images/map_placeholder.png')} 
        style={{ width: '100%', height: '100%', opacity: 0.5, resizeMode: 'cover', position: 'absolute' }}
      />
      <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#051C2C', fontWeight: 'bold' }}>Mapa Interactivo</Text>
        <Text style={{ color: '#8A8A8A', fontSize: 12 }}>Disponible en la App Móvil</Text>
      </View>
    </View>
  );
}
