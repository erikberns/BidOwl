import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';

export default function CatalogScreen() {
  const { id } = useLocalSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const mockItems = [
    { id: 'item-1', number: '1º', title: 'Guitarra de Keith Richards', price: '1.000.000 ARS' },
    { id: 'item-2', number: '2º', title: 'Guitarra de Keith Richards', price: '1.000.000 ARS' },
    { id: 'item-3', number: '3º', title: 'Guitarra de Keith Richards', price: '1.000.000 ARS' },
    { id: 'item-4', number: '4º', title: 'Guitarra de Keith Richards', price: '1.000.000 ARS' },
    { id: 'item-5', number: '5º', title: 'Guitarra de Keith Richards', price: '1.000.000 ARS' },
  ];

  const handleEnterAuction = () => {
    setIsModalVisible(false);
    router.push((`/auction/${id}/bidding`) as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView
            tintColor="#051C2C"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={22}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catálogo Entero</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Main Content (Scrollable) */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Catalogo de Artículos</Text>
        <Text style={styles.sectionSubtitle}>Está conformado por {mockItems.length} artículos en total.</Text>

        {/* Item Cards List */}
        <View style={styles.itemsList}>
          {mockItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image 
                source={require('@/assets/images/rolling_stone_auction.png')} 
                style={styles.itemThumbnail} 
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemNumber}>{item.number} Articulo</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemPrice}>Valor Base: {item.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBackButton} onPress={() => router.back()}>
          <SymbolView
            tintColor="#fff"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={20}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.joinButtonText}>Unirse a Subasta</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Method Dialog Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Metodo de Pago</Text>
              <View style={styles.modalHeaderPlaceholder} />
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Metodo de Pago a Utilizar a Futuro</Text>
              
              {/* Custom Selector Dropdown */}
              <TouchableOpacity style={styles.selectorDropdown} activeOpacity={0.8}>
                <View style={styles.selectorLeftRow}>
                  <SymbolView
                    tintColor="#051C2C"
                    // @ts-ignore
                    name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
                    size={24}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.selectorText}>VISA **** **** **** 2345</Text>
                </View>
                <SymbolView
                  tintColor="#051C2C"
                  // @ts-ignore
                  name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'chevron_down' }}
                  size={16}
                />
              </TouchableOpacity>

              {/* ¡Entrar! Action Button */}
              <TouchableOpacity 
                style={styles.modalEnterButton}
                onPress={handleEnterAuction}
              >
                <Text style={styles.modalEnterButtonText}>¡Entrar!</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: BottomTabInset + 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  itemThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E9F64',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    gap: 12,
  },
  bottomBackButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#051C2C', // Black square back button
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    flex: 1,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#BEE757', // Lime yellow join button
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '800',
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#051C2C',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
  },
  modalHeaderPlaceholder: {
    width: 24,
  },
  modalBody: {
    width: '100%',
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 12,
  },
  selectorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  selectorLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 12,
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  modalEnterButton: {
    backgroundColor: '#BEE757', // Lime yellow
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  modalEnterButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '800',
  },
});
