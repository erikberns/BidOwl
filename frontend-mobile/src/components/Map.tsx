// Muestra el mapa nativo de la ubicacion asociada a una subasta.
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';

export default function MapComponent({ selectedLocation, onLocationChange, addressText, onAddressChange }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapView>(null);

  const fetchAddress = async (coordinate: any) => {
    try {
      const result = await Location.reverseGeocodeAsync(coordinate);
      if (result && result.length > 0) {
        const addr = result[0];
        const formattedAddress = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || addr.subregion || ''}`.trim().replace(/^,|,$/g, '').trim();
        onAddressChange(formattedAddress || 'Dirección desconocida');
      } else {
        onAddressChange('Ubicación sin dirección registrada');
      }
    } catch (e) {
      console.log('Error reverse geocoding:', e);
      onAddressChange('Ubicación personalizada');
    }
  };

  useEffect(() => {
    // Solo pedir permisos de ubicación la primera vez si se quisiera centrar el GPS,
    // pero para geocode inverso a veces no es estricto, aunque es buena práctica:
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
      }
      fetchAddress(selectedLocation);
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await Location.geocodeAsync(searchQuery);
      if (result && result.length > 0) {
        const { latitude, longitude } = result[0];
        const newCoord = { latitude, longitude };
        onLocationChange(newCoord);
        fetchAddress(newCoord);
        
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      } else {
        alert('No se encontró la dirección. Intenta agregar la ciudad.');
      }
    } catch (e) {
      console.log('Error geocoding:', e);
      alert('Error al buscar la dirección');
    }
    setIsSearching(false);
  };

  const handleDragEnd = (e: any) => {
    const newCoord = e.nativeEvent.coordinate;
    onLocationChange(newCoord);
    fetchAddress(newCoord);
  };

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleDragEnd}
      >
        <Marker 
          coordinate={selectedLocation}
          draggable
          onDragEnd={handleDragEnd}
        />
      </MapView>

      {/* Search Bar Overlay */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar calle, número, ciudad..."
          placeholderTextColor="#8A8A8A"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          {isSearching ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            // @ts-ignore
            <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={20} tintColor="#fff" />
          )}
        </TouchableOpacity>
      </View>

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
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#051C2C',
  },
  searchButton: {
    backgroundColor: '#2E8B57',
    padding: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
