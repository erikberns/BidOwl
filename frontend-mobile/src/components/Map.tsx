// Muestra el mapa nativo de la ubicacion asociada a una subasta.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';

export default function MapComponent({ selectedLocation, addressText, onAddressChange }: any) {
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await Location.reverseGeocodeAsync(selectedLocation);
        if (!active) return;
        if (result && result.length > 0) {
          const address = result[0];
          const formatted = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || address.subregion || ''}`
            .trim()
            .replace(/^,|,$/g, '')
            .trim();
          onAddressChange(formatted || 'Dirección indicada por BidOwl');
        }
      } catch (error) {
        console.warn('[Map] No se pudo obtener la direccion:', error);
      }
    })();
    return () => { active = false; };
  }, [selectedLocation, onAddressChange]);

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker coordinate={selectedLocation} />
      </MapView>

      {/* Address Label Overlay */}
      <View style={styles.addressContainer}>
        {/* @ts-ignore */}
        <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }} size={20} tintColor="#2E8B57" />
        <Text style={styles.addressText} numberOfLines={1}>{addressText || 'Buscando...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  addressContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#051C2C',
    flex: 1,
  }
});
