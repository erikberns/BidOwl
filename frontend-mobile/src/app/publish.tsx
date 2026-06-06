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
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/constants/api';

export default function PublishScreen() {
  const router = useRouter();
  const [articleName, setArticleName] = useState('');
  const [articleDescription, setArticleDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [articleDate, setArticleDate] = useState('');
  const [articleHistory, setArticleHistory] = useState('');
  const [isArtpiece, setIsArtpiece] = useState(false);
  const [isBelonging, setIsBelonging] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnOk, setModalOnOk] = useState<(() => void) | null>(null);

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

  useEffect(() => {
    async function loadGuestStatus() {
      try {
        const isGuestStr = await AsyncStorage.getItem('isGuest');
        setIsGuest(isGuestStr === 'true' || isGuestStr === null);
      } catch {
        setIsGuest(true);
      }
    }
    loadGuestStatus();
  }, []);

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
        setImages(prev => (prev.length < 6 ? [...prev, uri] : prev));
      }
    } catch (err) {
      console.warn('Error seleccionando imagen', err);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    if (images.length < 3) {
      showAppModal('Atención', 'Se requieren al menos 3 imágenes para enviar la solicitud.');
      return;
    }

    showAppModal('Enviando', 'Enviando solicitud, por favor espere...');

    const form = new FormData();
    form.append('nombre', articleName);
    form.append('descripcion', articleDescription);
    form.append('esArteODisenador', JSON.stringify(isArtpiece));
    form.append('nombreCreador', creatorName);
    form.append('fechaCreacion', articleDate);
    form.append('historia', articleHistory);
    form.append('declaracionPropiedad', JSON.stringify(isBelonging));

    images.forEach((uri, idx) => {
      const filename = uri.split('/').pop() || `image_${idx}.jpg`;
      const match = filename.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
      const ext = match ? match[1] : 'jpg';
      const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      // @ts-ignore
      form.append('imagenes', { uri, name: filename, type });
    });

    try {
      const res = await fetch(`${API_URL}/solicitudes-items`, {
        method: 'POST',
        headers: {
          // Ajustar header de autorización según implementación real
          Autorizacion: 'token',
        },
        body: form,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        hideAppModal();
        showAppModal('Solicitud enviada', 'La solicitud se envió correctamente.', () => router.back());
      } else {
        hideAppModal();
        const msg = json?.error || json?.mensaje || 'Error al crear la solicitud';
        showAppModal('Error', String(msg));
      }
    } catch (err) {
      console.warn('Error enviando solicitud:', err);
      hideAppModal();
      showAppModal('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Solicitar Subasta de Articulo</ThemedText>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Section */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.mainTitle}>Cuentanos sobre su Articulo</ThemedText>
          <ThemedText style={styles.mainSubtitle}>
            Describe características, estado y cualidad relevante para atraer mejores ofertas
          </ThemedText>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Imágenes del Articulo (Mínimo 3 imágenes)
            </ThemedText>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>ⓘ</Text>
            </View>
          </View>
          <View style={styles.imagesGrid}>
            {images.map((uri, idx) => (
              <Pressable key={idx} onPress={() => handleRemoveImage(idx)}>
                <Image source={{ uri }} style={styles.imageThumb} />
              </Pressable>
            ))}
            {images.length < 6 && (
              <Pressable style={styles.addImageButton} onPress={handleAddImage}>
                <Text style={styles.addImageText}>+</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Nombre del Articulo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nombre del Articulo</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Zapatillas de Michael Jordan"
            placeholderTextColor="#999"
            value={articleName}
            onChangeText={setArticleName}
          />
        </View>

        {/* Descripción del Articulo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Descripción del Articulo</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Zapatillas con acabado estilo, con diseño tónico que resalta su diseño limpio de alta calidad, ofrecen gran comodidad. Perfecto para uso diario como para ocasiones especiales. Su estética..."
            placeholderTextColor="#999"
            value={articleDescription}
            onChangeText={setArticleDescription}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Artwork Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <ThemedText style={styles.toggleLabel}>
              ¿Es una pieza de arte u obra de algún maestro?
            </ThemedText>
            <Switch
              value={isArtpiece}
              onValueChange={setIsArtpiece}
              trackColor={{ false: '#E5E5E5', true: '#BEE757' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Nombre del Creador */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nombre del Creador</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Michael Jordan"
            placeholderTextColor="#999"
            value={creatorName}
            onChangeText={setCreatorName}
          />
        </View>

        {/* Fecha del Articulo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Fecha del Articulo</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#999"
            value={articleDate}
            onChangeText={setArticleDate}
          />
        </View>

        {/* Historia del Articulo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Historia del Articulo</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={'Las Air Jordan 12 del "Flu Game" se utilizaron icónicas en las Finales de 1997 cuando Jordán disputó el partido enfermo, anotó 38 puntos contra Utah Jazz. Este partido convertit a alta moda en un símbolo de esfuerzo y grandeza en el deporte.'}
            placeholderTextColor="#999"
            value={articleHistory}
            onChangeText={setArticleHistory}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Ownership Checkbox */}
        <View style={styles.section}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setIsBelonging(!isBelonging)}
          >
            <View style={[styles.checkbox, isBelonging && styles.checkboxChecked]}>
              {isBelonging && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <ThemedText style={styles.checkboxLabel}>
                Éste bien me pertenece
              </ThemedText>
              <ThemedText style={styles.checkboxDisclaimer}>
                Declaro que el bien a subastar mi pertenencia y no poseen ningún impedimiento para subastarlo.
              </ThemedText>
            </View>
          </Pressable>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.8}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Mandar</Text>
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
    borderBottomColor: '#E5E5E5',
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
  headerTitle: {
    fontSize: 14,
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
    paddingBottom: 100,
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
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BEE757',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FEFE',
  },
  addImageText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#BEE757',
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#F9FEFE',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#051C2C',
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#F9FEFE',
  },
  checkboxContent: {
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#051C2C',
    borderColor: '#051C2C',
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
