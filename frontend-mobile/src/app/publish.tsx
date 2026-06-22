import React, { useState, useEffect } from 'react';
import { Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, Tabs } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/constants/api';

export default function PublishScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [articleName, setArticleName] = useState('');
  const [articleDescription, setArticleDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [articleDate, setArticleDate] = useState('');
  const [articleHistory, setArticleHistory] = useState('');
  const [isArtpiece, setIsArtpiece] = useState(false);
  const [isBelonging, setIsBelonging] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnOk, setModalOnOk] = useState<(() => void) | null>(null);

  // Validation error states
  const [imagesError, setImagesError] = useState('');
  const [articleNameError, setArticleNameError] = useState('');
  const [articleDescriptionError, setArticleDescriptionError] = useState('');
  const [creatorNameError, setCreatorNameError] = useState('');
  const [articleDateError, setArticleDateError] = useState('');
  const [articleHistoryError, setArticleHistoryError] = useState('');
  const [isBelongingError, setIsBelongingError] = useState('');

  const showAppModal = (title: string, message: string, onOk?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOnOk(() => (onOk ? onOk : null));
    setModalVisible(true);
  };

  const hideAppModal = () => {
    setModalVisible(false);
    if (modalOnOk) {
      try { modalOnOk(); } catch (e) { /* ignore */ }
      setModalOnOk(null);
    }
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setArticleName('');
    setArticleDescription('');
    setCreatorName('');
    setArticleDate('');
    setArticleHistory('');
    setIsArtpiece(false);
    setIsBelonging(false);
    setImages([]);
    setImagesError('');
    setArticleNameError('');
    setArticleDescriptionError('');
    setCreatorNameError('');
    setArticleDateError('');
    setArticleHistoryError('');
    setIsBelongingError('');
  };

  useEffect(() => {
    if (isFocused) {
      async function loadGuestStatus() {
        try {
          const isGuestStr = await AsyncStorage.getItem('isGuest');
          const userStr = await AsyncStorage.getItem('user');
          setIsGuest(isGuestStr === 'true' || !userStr);
        } catch {
          setIsGuest(true);
        }
      }
      loadGuestStatus();

      if (isSubmitted) {
        handleResetForm();
      }
    }
  }, [isFocused]);

  const handleDateChange = (text: string) => {
    if (articleDateError) setArticleDateError('');
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)} / ${cleaned.slice(4, 8)}`;
    }
    setArticleDate(formatted);
  };

  const handleAddImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImages(prev => {
          const next = prev.length < 10 ? [...prev, uri] : prev;
          if (next.length >= 6) {
            setImagesError('');
          }
          return next;
        });
      }
    } catch (err) {
      console.warn('Error seleccionando imagen', err);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length >= 6) {
        setImagesError('');
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    console.log('handleSubmit invoked, images count:', images.length, 'isGuest:', isGuest);

    if (isGuest) {
      showAppModal(
        'Inicio de sesión requerido',
        'Para enviar una solicitud debes iniciar sesión primero. Ve al perfil y accede a tu cuenta.',
        () => router.push('/profile')
      );
      return;
    }

    // Clear previous errors
    setImagesError('');
    setArticleNameError('');
    setArticleDescriptionError('');
    setCreatorNameError('');
    setArticleDateError('');
    setArticleHistoryError('');
    setIsBelongingError('');

    let hasErrors = false;

    if (images.length < 6) {
      setImagesError('Se requieren al menos 6 imágenes para enviar la solicitud.');
      hasErrors = true;
    }

    if (!articleName || !articleName.trim()) {
      setArticleNameError('El nombre del artículo es obligatorio.');
      hasErrors = true;
    }

    if (!articleDescription || !articleDescription.trim()) {
      setArticleDescriptionError('La descripción del artículo es obligatoria.');
      hasErrors = true;
    }

    if (isArtpiece) {
      if (!creatorName || !creatorName.trim()) {
        setCreatorNameError('El nombre del creador es obligatorio.');
        hasErrors = true;
      }
      if (!articleDate || articleDate.length !== 14) {
        setArticleDateError('La fecha de creación es obligatoria y debe tener el formato DD / MM / YYYY.');
        hasErrors = true;
      }
      if (!articleHistory || !articleHistory.trim()) {
        setArticleHistoryError('La historia del artículo es obligatoria.');
        hasErrors = true;
      }
    }

    if (!isBelonging) {
      setIsBelongingError('Debe declarar que el bien le pertenece.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    let apiDate = '';
    if (isArtpiece && articleDate.length === 14) {
      const parts = articleDate.split(' / ');
      if (parts.length === 3) {
        apiDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const form = new FormData();
    form.append('nombre', articleName);
    form.append('descripcion', articleDescription);
    form.append('esArteODisenador', JSON.stringify(isArtpiece));
    form.append('nombreCreador', isArtpiece ? creatorName : 'N/A');
    form.append('fechaCreacion', isArtpiece ? apiDate : '');
    form.append('historia', isArtpiece ? articleHistory : '');
    form.append('declaracionPropiedad', JSON.stringify(isBelonging));

    for (let idx = 0; idx < images.length; idx++) {
      const uri = images[idx];
      const filename = uri.split('/').pop() || `image_${idx}.jpg`;
      const match = filename.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
      const ext = match ? match[1] : 'jpg';
      const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        form.append('imagenes', blob, filename);
      } else {
        // @ts-ignore
        form.append('imagenes', { uri, name: filename, type });
      }
    }

    let userId = '';
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.identificador) userId = String(user.identificador);
      }
    } catch (e) { }

    try {
      const res = await fetch(`${API_URL}/solicitudes-items`, {
        method: 'POST',
        headers: {
          Autorizacion: userId,
        },
        body: form,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const msg = json?.message || json?.error || json?.mensaje || 'Error al crear la solicitud';
        showAppModal('Error', String(msg));
      }
    } catch (err) {
      console.warn('Error enviando solicitud:', err);
      showAppModal('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />

        <View style={styles.successContainer}>
          <Image
            source={require('@/assets/images/logosintexto.png')}
            style={styles.successLogo}
            resizeMode="contain"
          />
          <Text style={styles.successTitle}>Su solicitud sera{'\n'}revisada por nuestro{'\n'}equipo.</Text>
          <Text style={styles.successSubtitle}>
            Tu solicitud ya está en proceso.{'\n'}Nuestro equipo la analizará para asegurarse de que todo esté listo y puedas avanzar con confianza dentro de la plataforma.
          </Text>
        </View>

        <View style={styles.successFooter}>
          <TouchableOpacity
            style={styles.successButton}
            activeOpacity={0.8}
            onPress={() => {
              handleResetForm();
              router.back();
            }}
          >
            <Text style={styles.successButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />
        {/* Header with Back Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Image
              source={require('../../assets/images/Chevron-Left.png')}
              style={styles.backButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitar Subasta de Articulo</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.successContainer}>
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48, color: '#8A8A8A', marginBottom: 24 }}>🔒</Text>
            <Text style={styles.successTitle}>Acceso Restringido</Text>
            <Text style={[styles.successSubtitle, { textAlign: 'center', marginTop: 12, paddingHorizontal: 16 }]}>
              Para poder solicitar una subasta y publicar tus artículos, debes tener una cuenta registrada en BidOwl.
            </Text>
          </View>
        </View>

        <View style={styles.successFooter}>
          <TouchableOpacity
            style={styles.successButton}
            activeOpacity={0.8}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.successButtonText}>Registrarse o Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={require('../../assets/images/Chevron-Left.png')}
            style={styles.backButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Subasta de Articulo</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Cuentanos sobre su Articulo</Text>
          <Text style={styles.mainSubtitle}>
            Describí sus características, estado y cualquier detalle relevante para atraer más interesados y lograr mejores ofertas.
          </Text>
        </View>
        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Imagenes del Articulo (Minimo 6 imagenes)
            </Text>
          </View>
          <View style={[styles.imagesContainer, !!imagesError && styles.imagesErrorContainer]}>
            <View style={styles.imagesGrid}>
              {images.map((uri, idx) => (
                <Pressable key={idx} onPress={() => handleRemoveImage(idx)}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                </Pressable>
              ))}
              {images.length < 10 && (
                <Pressable style={styles.addImageButton} onPress={handleAddImage}>
                  <Image
                    source={require('@/assets/images/botton de agregar.png')}
                    style={styles.addImageIcon}
                    resizeMode="contain"
                  />
                </Pressable>
              )}
            </View>
          </View>
          {!!imagesError && <Text style={[styles.errorText, { marginTop: 8, marginBottom: 0 }]}>{imagesError}</Text>}
        </View>

        {/* Nombre del Articulo */}
        <View style={[
          styles.inputGroup,
          !!articleNameError && styles.inputGroupError,
          !!articleNameError && { marginBottom: 8 }
        ]}>
          <Text style={styles.inputLabel}>Nombre del Articulo</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Zapatillas de Michael Jordan"
            placeholderTextColor="#ccc"
            value={articleName}
            onChangeText={(text) => {
              setArticleName(text);
              if (articleNameError) setArticleNameError('');
            }}
            underlineColorAndroid="transparent"
          />
        </View>
        {!!articleNameError && <Text style={styles.errorText}>{articleNameError}</Text>}

        {/* Descripción del Articulo */}
        <View style={[
          styles.inputGroup,
          { minHeight: 140 },
          !!articleDescriptionError && styles.inputGroupError,
          !!articleDescriptionError && { marginBottom: 8 }
        ]}>
          <Text style={styles.inputLabel}>Descripción del Articulo</Text>
          <TextInput
            style={[styles.inputField, { textAlignVertical: 'top', flex: 1 }]}
            placeholder="Zapatillas Jordan en excelente estado, con diseño icónico que combina estilo..."
            placeholderTextColor="#ccc"
            value={articleDescription}
            onChangeText={(text) => {
              setArticleDescription(text);
              if (articleDescriptionError) setArticleDescriptionError('');
            }}
            multiline
            numberOfLines={5}
            underlineColorAndroid="transparent"
          />
        </View>
        {!!articleDescriptionError && <Text style={styles.errorText}>{articleDescriptionError}</Text>}

        {/* Artwork Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            ¿Es una pieza de arte u obra de algun diseñador?
          </Text>
          <Switch
            value={isArtpiece}
            onValueChange={(val) => {
              setIsArtpiece(val);
              if (!val) {
                setCreatorNameError('');
                setArticleDateError('');
                setArticleHistoryError('');
              }
            }}
            trackColor={{ false: '#E5E5E5', true: '#051C2C' }}
            thumbColor="#fff"
          />
        </View>

        {/* Conditional inputs */}
        {isArtpiece && (
          <>
            {/* Nombre del Creador */}
            <View style={[
              styles.inputGroup,
              !!creatorNameError && styles.inputGroupError,
              !!creatorNameError && { marginBottom: 8 }
            ]}>
              <Text style={styles.inputLabel}>Nombre del Creador</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Michael Jordan"
                placeholderTextColor="#ccc"
                value={creatorName}
                onChangeText={(text) => {
                  setCreatorName(text);
                  if (creatorNameError) setCreatorNameError('');
                }}
                underlineColorAndroid="transparent"
              />
            </View>
            {!!creatorNameError && <Text style={styles.errorText}>{creatorNameError}</Text>}

            {/* Fecha de Creación */}
            <View style={[
              styles.inputGroup,
              !!articleDateError && styles.inputGroupError,
              !!articleDateError && { marginBottom: 8 }
            ]}>
              <Text style={styles.inputLabel}>Fecha de Creación</Text>
              <TextInput
                style={styles.inputField}
                placeholder="DD / MM / YYYY"
                placeholderTextColor="#ccc"
                value={articleDate}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={14}
                underlineColorAndroid="transparent"
              />
            </View>
            {!!articleDateError && <Text style={styles.errorText}>{articleDateError}</Text>}

            {/* Historia del Articulo */}
            <View style={[
              styles.inputGroup,
              { minHeight: 140 },
              !!articleHistoryError && styles.inputGroupError,
              !!articleHistoryError && { marginBottom: 8 }
            ]}>
              <Text style={styles.inputLabel}>Historia del Articulo</Text>
              <TextInput
                style={[styles.inputField, { textAlignVertical: 'top', flex: 1 }]}
                placeholder={'Las Air Jordan 12 del "Flu Game" se utilizaron icónicas en las Finales de 1997...'}
                placeholderTextColor="#ccc"
                value={articleHistory}
                onChangeText={(text) => {
                  setArticleHistory(text);
                  if (articleHistoryError) setArticleHistoryError('');
                }}
                multiline
                numberOfLines={5}
                underlineColorAndroid="transparent"
              />
            </View>
            {!!articleHistoryError && <Text style={styles.errorText}>{articleHistoryError}</Text>}
          </>
        )}

        {/* Ownership Checkbox */}
        <View style={styles.section}>
          <Pressable
            style={[
              styles.checkboxRow,
              !!isBelongingError && styles.checkboxRowError,
              !!isBelongingError && { marginBottom: 8 }
            ]}
            onPress={() => {
              const nextVal = !isBelonging;
              setIsBelonging(nextVal);
              if (nextVal && isBelongingError) setIsBelongingError('');
            }}
          >
            <View style={[
              styles.checkbox,
              isBelonging && styles.checkboxChecked,
              !!isBelongingError && { borderColor: '#E30613' }
            ]}>
              {isBelonging && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxLabel}>
                Éste bien me pertenece
              </Text>
              <Text style={styles.checkboxDisclaimer}>
                Declaro que el bien a subastar mi pertenencia y no poseen ningún impedimiento para subastarlo.
              </Text>
            </View>
          </Pressable>
          {!!isBelongingError && <Text style={[styles.errorText, { marginTop: 0, marginBottom: 0 }]}>{isBelongingError}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Enviando...' : 'Mandar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.modalBox}>
            <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
            <Text style={modalStyles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={hideAppModal}
            >
              <Text style={modalStyles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DCE0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#051C2C',
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#051C2C',
    flex: 1,
    textAlign: 'center',
  },
  backButtonPlaceholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  titleSection: {
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconText: {
    fontSize: 12,
    color: '#666',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  addImageIcon: {
    width: 30,
    height: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#051C2C',
    backgroundColor: '#F9FEFE',
    fontWeight: '500',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
    minHeight: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    flex: 1,
    paddingRight: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  checkboxContent: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#051C2C',
    borderColor: '#051C2C',
  },
  inputGroup: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '200',
    marginBottom: 4,
  },
  inputField: {
    fontSize: 15,
    color: '#051C2C',
    paddingVertical: 4,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 4,
  },
  checkboxDisclaimer: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: "center"

  },
  successLogo: {
    width: 75,
    height: 75,
    marginBottom: 42,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#051C2C',
    lineHeight: 42,
    marginBottom: 24,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#717375',
    lineHeight: 22,
    fontWeight: '500',
  },
  successFooter: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  successButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  imagesContainer: {
    width: '100%',
  },
  imagesErrorContainer: {
    borderWidth: 1.5,
    borderColor: '#E30613',
    borderRadius: 12,
    padding: 8,
  },
  inputGroupError: {
    borderColor: '#E30613',
  },
  checkboxRowError: {
    borderWidth: 1.5,
    borderColor: '#E30613',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#E30613',
    fontSize: 12,
    marginTop: 0,
    marginBottom: 16,
    paddingLeft: 4,
    fontWeight: '500',
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#051C2C',
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#051C2C',
    fontWeight: '700',
  },
});
