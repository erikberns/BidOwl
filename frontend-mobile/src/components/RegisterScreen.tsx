import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView, Image, Platform } from 'react-native';
import { API_URL } from '../constants/api';
import { InputField } from './ui/InputField';
import * as ImagePicker from 'expo-image-picker';

export interface RegisterData {
  nombre: string;
  apellido: string;
  pais: string;
  dni: string;
  domicilio: string;
  fotoFrente?: any;
  fotoDorso?: any;
}

interface Props {
  onBack: () => void;
  onComplete: (data: RegisterData) => void;
}

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.log(`[Alert] ${title}: ${message}`);
    alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

export function RegisterScreen({ onBack, onComplete }: Props) {
  const [nombre, setNombre] = useState('Jose');
  const [apellido, setApellido] = useState('Godio Claudio');
  const [pais, setPais] = useState('Argentina');
  const [dni, setDni] = useState('32145678');
  const [domicilio, setDomicilio] = useState('Lima 757');

  // Error states for inputs
  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [paisError, setPaisError] = useState('');
  const [dniError, setDniError] = useState('');
  const [domicilioError, setDomicilioError] = useState('');
  const [dniFotosError, setDniFotosError] = useState('');

  const handleContinue = () => {
    // Clear previous errors
    setNombreError('');
    setApellidoError('');
    setPaisError('');
    setDniError('');
    setDomicilioError('');
    setDniFotosError('');

    let hasErrors = false;

    if (!nombre || !nombre.trim()) {
      setNombreError('El nombre es obligatorio.');
      hasErrors = true;
    }

    if (!apellido || !apellido.trim()) {
      setApellidoError('El apellido es obligatorio.');
      hasErrors = true;
    }

    if (!pais) {
      setPaisError('El país es obligatorio.');
      hasErrors = true;
    }

    if (!dni) {
      setDniError('El DNI es obligatorio.');
      hasErrors = true;
    }

    if (!domicilio) {
      setDomicilioError('El domicilio es obligatorio.');
      hasErrors = true;
    }

    const hasNumber = /\d/;
    if (nombre && hasNumber.test(nombre)) {
      setNombreError('El nombre no puede contener números.');
      hasErrors = true;
    }

    if (apellido && hasNumber.test(apellido)) {
      setApellidoError('El apellido no puede contener números.');
      hasErrors = true;
    }

    const isDigitsOnly = /^\d+$/;
    if (dni && (!isDigitsOnly.test(dni) || dni.length !== 8)) {
      setDniError('El DNI tiene que tener 8 numeros');
      hasErrors = true;
    }

    if (!fotoFrenteFile || !fotoDorsoFile) {
      setDniFotosError('Debe cargar las fotos de frente y dorso del DNI.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    onComplete({ 
      nombre, 
      apellido, 
      pais, 
      dni, 
      domicilio, 
      fotoFrente: fotoFrenteFile, 
      fotoDorso: fotoDorsoFile 
    });
  };

  const [fotoFrenteUri, setFotoFrenteUri] = useState<string | null>(null);
  const [fotoFrenteFile, setFotoFrenteFile] = useState<any>(null);
  const [fotoDorsoUri, setFotoDorsoUri] = useState<string | null>(null);
  const [fotoDorsoFile, setFotoDorsoFile] = useState<any>(null);

  const fileInputFrenteRef = useRef<any>(null);
  const fileInputDorsoRef = useRef<any>(null);

  const handleSelectFrente = async () => {
    setDniFotosError('');
    if (Platform.OS === 'web') {
      if (fileInputFrenteRef.current) {
        fileInputFrenteRef.current.click();
      }
    } else {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permiso Requerido', 'Se necesita acceso a la galería para poder cargar las fotos del DNI.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setFotoFrenteUri(asset.uri);
          setFotoFrenteFile({
            uri: asset.uri,
            name: asset.fileName || 'dni-frente.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
        }
      } catch (error: any) {
        console.error(error);
        showAlert('Error', 'No se pudo seleccionar la foto del frente.');
      }
    }
  };

  const handleSelectDorso = async () => {
    setDniFotosError('');
    if (Platform.OS === 'web') {
      if (fileInputDorsoRef.current) {
        fileInputDorsoRef.current.click();
      }
    } else {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permiso Requerido', 'Se necesita acceso a la galería para poder cargar las fotos del DNI.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setFotoDorsoUri(asset.uri);
          setFotoDorsoFile({
            uri: asset.uri,
            name: asset.fileName || 'dni-dorso.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
        }
      } catch (error: any) {
        console.error(error);
        showAlert('Error', 'No se pudo seleccionar la foto del dorso.');
      }
    }
  };

  const handleFrenteFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setDniFotosError('');
      setFotoFrenteFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFotoFrenteUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDorsoFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setDniFotosError('');
      setFotoDorsoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFotoDorsoUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          <InputField
            label="Nombre"
            value={nombre}
            onChangeText={(val) => {
              setNombre(val);
              if (nombreError) setNombreError('');
            }}
            error={nombreError}
          />

          <InputField
            label="Apellido/s"
            value={apellido}
            onChangeText={(val) => {
              setApellido(val);
              if (apellidoError) setApellidoError('');
            }}
            error={apellidoError}
          />

          <View style={[styles.outerContainer, { zIndex: isDropdownOpen ? 1000 : 1, overflow: 'visible' }]}>
            <View style={[styles.inputWrapper, { overflow: 'visible' }, !!paisError && styles.inputWrapperError]}>
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
                  <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150, backgroundColor: '#ffffff' }}>
                    {availablePaises.map((item) => (
                      <Pressable
                        key={item.numero}
                        style={[styles.dropdownItem, { backgroundColor: '#ffffff' }]}
                        onPress={() => {
                          setPais(item.nombre);
                          setPaisError('');
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
            {!!paisError && <Text style={styles.errorText}>{paisError}</Text>}
          </View>

          <InputField
            label="DNI"
            value={dni}
            onChangeText={(val) => {
              setDni(val);
              if (dniError) setDniError('');
            }}
            keyboardType="numeric"
            error={dniError}
          />

          <InputField
            label="Domicilio Legal"
            value={domicilio}
            onChangeText={(val) => {
              setDomicilio(val);
              if (domicilioError) setDomicilioError('');
            }}
            error={domicilioError}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Necesitaremos Verificarte.</Text>
        <Text style={styles.sectionDescription}>
          En BidOwl tomamos muy enserio a la verificación de nuestros usuarios, para que nuestro ambiente sea lo mas seguro posible.
        </Text>

        <View style={styles.dniSection}>
          <Text style={styles.dniLabel}>Foto de DNI <Text style={styles.dniLabelItalic}>(Frente y Dorso)</Text></Text>
          
          {/* Invisible file inputs for Web */}
          {Platform.OS === 'web' && (
            <>
              <input
                type="file"
                ref={fileInputFrenteRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFrenteFileChange}
              />
              <input
                type="file"
                ref={fileInputDorsoRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleDorsoFileChange}
              />
            </>
          )}

          <View style={styles.dniImagesRow}>
            {/* Frente Box */}
            <Pressable 
              style={[styles.uploadBox, fotoFrenteUri ? styles.uploadBoxHasImage : null]} 
              onPress={handleSelectFrente}
            >
              {fotoFrenteUri ? (
                <Image source={{ uri: fotoFrenteUri }} style={styles.dniPreviewImage} />
              ) : (
                <View style={styles.uploadContent}>
                  <View style={styles.plusCircle}>
                    <Text style={styles.plusText}>+</Text>
                  </View>
                  <Text style={styles.uploadBoxLabel}>Frente</Text>
                </View>
              )}
            </Pressable>

            {/* Dorso Box */}
            <Pressable 
              style={[styles.uploadBox, fotoDorsoUri ? styles.uploadBoxHasImage : null]} 
              onPress={handleSelectDorso}
            >
              {fotoDorsoUri ? (
                <Image source={{ uri: fotoDorsoUri }} style={styles.dniPreviewImage} />
              ) : (
                <View style={styles.uploadContent}>
                  <View style={styles.plusCircle}>
                    <Text style={styles.plusText}>+</Text>
                  </View>
                  <Text style={styles.uploadBoxLabel}>Dorso</Text>
                </View>
              )}
            </Pressable>
          </View>
          {!!dniFotosError && <Text style={[styles.errorText, { marginTop: 12 }]}>{dniFotosError}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.continueButton} 
          onPress={handleContinue}
        >
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
  outerContainer: {
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapperError: {
    borderColor: '#E30613',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#E30613',
    fontSize: 14,
    marginTop: 6,
    paddingLeft: 4,
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
    flex: 1,
    height: 100,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadBoxHasImage: {
    borderStyle: 'solid',
    borderColor: '#2A8E5D',
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
  dniPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    resizeMode: 'cover',
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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