import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView, Image } from 'react-native';
import { API_URL } from '../constants/api';

export interface RegisterData {
  nombre: string;
  apellido: string;
  pais: string;
  dni: string;
  domicilio: string;
}

interface Props {
  onBack: () => void;
  onComplete: (data: RegisterData) => void;
}

export function RegisterScreen({ onBack, onComplete }: Props) {
  const [nombre, setNombre] = useState('Jose');
  const [apellido, setApellido] = useState('Godio Claudio');
  const [pais, setPais] = useState('Argentina');
  const [dni, setDni] = useState('32145678');
  const [domicilio, setDomicilio] = useState('Lima 757');

  const [availablePaises, setAvailablePaises] = useState<any[]>([
    { numero: 54, nombre: 'Argentina' },
    { numero: 598, nombre: 'Uruguay' },
    { numero: 55, nombre: 'Brasil' },
    { numero: 56, nombre: 'Chile' }
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadPaises() {
      try {
        console.log('Cargando países desde:', `${API_URL}/personas/paises`);
        const response = await fetch(`${API_URL}/personas/paises`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAvailablePaises(data);
          }
        }
      } catch (error) {
        console.error('Error cargando países:', error);
      }
    }
    loadPaises();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Creación de Cuenta</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Ingrese los siguientes datos.</Text>
        <Text style={styles.sectionDescription}>
          Esto nos permitira realizar una investigacion que nos indicara en que categoria de remates podra a empezar a participar al comenzar.
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Apellido/s</Text>
            <TextInput
              style={styles.input}
              value={apellido}
              onChangeText={setApellido}
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputWrapper, { zIndex: isDropdownOpen ? 1000 : 1, overflow: 'visible' }]}>
            <Text style={styles.inputLabel}>País de Residencia</Text>
            <Pressable 
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              style={styles.dropdownTrigger}
            >
              <Text style={styles.dropdownValue}>{pais}</Text>
              <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
            </Pressable>
            
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }}>
                  {availablePaises.map((item) => (
                    <Pressable
                      key={item.numero}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPais(item.nombre);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.nombre}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>DNI</Text>
            <TextInput
              style={styles.input}
              value={dni}
              onChangeText={setDni}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Domicilio Legal</Text>
            <TextInput
              style={styles.input}
              value={domicilio}
              onChangeText={setDomicilio}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Necesitaremos Verificarte.</Text>
        <Text style={styles.sectionDescription}>
          En BidOwl tomamos muy enserio a la verificación de nuestros usuarios, para que nuestro ambiente sea lo mas seguro posible.
        </Text>

        <View style={styles.dniSection}>
          <Text style={styles.dniLabel}>Foto de DNI <Text style={styles.dniLabelItalic}>(Frente y Dorso)</Text></Text>
          
          <View style={styles.dniImagesRow}>
            {/* Upload Button Box */}
            <Pressable style={styles.uploadBox}>
              <View style={styles.plusCircle}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </Pressable>

            {/* DNI File Placeholder using view since we don't have asset */}
            <View style={styles.dniImagePlaceholder}>
              <Text style={{fontSize: 10, color: '#666', textAlign: 'center'}}>DNI Placeholder</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={() => onComplete({ nombre, apellido, pais, dni, domicilio })}>
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
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  dniSection: {
    marginTop: 8,
  },
  dniLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  dniLabelItalic: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#666',
  },
  dniImagesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  uploadBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  plusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 16,
    lineHeight: 18,
    color: '#000',
  },
  dniImagePlaceholder: {
    width: 160,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#EBEBEB',
    borderColor: '#D4D4D4',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  continueButton: {
    backgroundColor: '#2A8E5D', // Darker green to match UI
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#000',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 160,
    zIndex: 9999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
});