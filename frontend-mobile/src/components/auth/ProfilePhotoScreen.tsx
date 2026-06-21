import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  userId?: number;
  onBack: () => void;
  onComplete: () => void;
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

export function ProfilePhotoScreen({ userId, onBack, onComplete }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<any>(null);

  const handleSelectPhoto = async () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permiso Requerido', 'Se necesita acceso a la galería para poder subir una foto.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setImageUri(asset.uri);
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName || 'profile.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
        }
      } catch (error: any) {
        console.error(error);
        showAlert('Error', 'No se pudo seleccionar la foto.');
      }
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      return;
    }

    setIsLoading(true);
    try {
      if (!userId) {
        // Fallback si no tenemos ID de usuario
        onComplete();
        return;
      }

      console.log(`Subiendo foto de perfil para el usuario ${userId}...`);
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        formData.append('foto', selectedFile);
      } else {
        formData.append('foto', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        } as any);
      }

      const response = await fetch(`${API_URL}/personas/${userId}/foto`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al subir la foto de perfil.');
      }

      console.log('Foto de perfil subida con éxito:', result);
      const storedUserStr = await AsyncStorage.getItem('user');
      if (storedUserStr) {
        const userObj = JSON.parse(storedUserStr);
        userObj.foto = 'profile_uploaded';
        await AsyncStorage.setItem('user', JSON.stringify(userObj));
      }
      await AsyncStorage.setItem('registrationStage2Step', 'payment_methods');
      onComplete();
    } catch (error: any) {
      console.error(error);
      showAlert('Error de Foto', error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Invisible file input for Web */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={isLoading}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foto de Perfil</Text>
        <View style={styles.placeholderBox} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Elegí tu foto de perfil.</Text>
        <Text style={styles.subtitle}>
          Personalizá tu cuenta con una foto que te represente y permita que otros usuarios te identifiquen fácilmente dentro de la comunidad.
        </Text>

        {/* Circular photo container */}
        <View style={styles.photoContainerWrapper}>
          <TouchableOpacity 
            style={styles.photoCircle} 
            onPress={handleSelectPhoto}
            disabled={isLoading}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoImage} />
            ) : (
              <View style={styles.plusContainer}>
                <Text style={styles.plusText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (!selectedFile || isLoading) && styles.disabledButton,
            isLoading && { opacity: 0.6 }
          ]} 
          onPress={handleContinue}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.continueButtonText,
              !selectedFile && styles.disabledButtonText
            ]}>Continuar</Text>
          )}
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 40,
  },
  photoContainerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  photoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plusContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  plusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  continueButton: {
    backgroundColor: '#2A8E5D', // Solid green to match continue buttons
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  disabledButtonText: {
    color: '#888',
  },
});
