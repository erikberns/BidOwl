import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface JoinAuctionBarProps {
  auctionId: string;
  onBack?: () => void;
}

export default function JoinAuctionBar({ auctionId, onBack }: JoinAuctionBarProps) {
  const isDark = false;
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const activeColor = '#051C2C';
  const backgroundColor = '#FFFFFF';
  const borderColor = '#ECECEC';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor, 
        borderTopColor: borderColor,
        paddingBottom: Math.max(insets.bottom, 12) 
      }
    ]}>
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <SymbolView
          // @ts-ignore
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'chevron-left' }}
          tintColor="#FFFFFF"
          size={20}
          fallback={
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>&lt;</Text>
          }
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.joinBtn}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.joinBtnText}>Unirse a Subasta</Text>
      </TouchableOpacity>

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
                onPress={() => {
                  setIsModalVisible(false);
                  router.push(`/auction/${auctionId}/bidding` as any);
                }}
              >
                <Text style={styles.modalEnterButtonText}>¡Entrar!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    paddingHorizontal: 24,
    gap: 12,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#051C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#B5F639',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
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
    backgroundColor: '#B5F639',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  modalEnterButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '800',
  }
});
