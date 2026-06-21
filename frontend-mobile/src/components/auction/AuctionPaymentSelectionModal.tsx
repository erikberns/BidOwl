import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

interface AuctionPaymentSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  paymentMethods: any[];
  selectedPayment: string;
  setSelectedPayment: (id: string) => void;
  confirmPaymentAndJoin: () => void;
}

export const AuctionPaymentSelectionModal: React.FC<AuctionPaymentSelectionModalProps> = ({
  visible,
  onClose,
  paymentMethods,
  selectedPayment,
  setSelectedPayment,
  confirmPaymentAndJoin,
}) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            {/* @ts-ignore */}
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Unirse a Subasta</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Seleccione el método{"\n"}de pago a utilizar.</Text>
          <Text style={styles.modalSubtitle}>Este método se usará para procesar tu puja en caso de que ganes la subasta.</Text>
          
          <View style={styles.paymentOptionsContainer}>
            {paymentMethods.map(method => (
              <TouchableOpacity 
                key={method.id}
                style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]} 
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentOptionLeft}>
                  {method.type === 'card' && (
                    /* @ts-ignore */
                    <SymbolView name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }} size={24} tintColor="#051C2C" style={styles.paymentIcon} />
                  )}
                  {method.type === 'bank' && (
                    /* @ts-ignore */
                    <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} size={24} tintColor="#051C2C" style={styles.paymentIcon} />
                  )}
                  <Text style={styles.paymentOptionText}>{method.name}</Text>
                </View>
                <View style={[styles.radioCircle, selectedPayment === method.id && styles.radioCircleSelected]}>
                  {selectedPayment === method.id && <View style={styles.radioInnerCircle} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.modalButton} onPress={confirmPaymentAndJoin}>
            <Text style={styles.modalButtonText}>Confirmar y Unirse</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalBackButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 22,
    marginBottom: 24,
  },
  paymentOptionsContainer: {
    marginTop: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
  },
  paymentOptionSelected: {
    borderColor: '#E5E5E5',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 16,
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#051C2C',
    fontWeight: '500',
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#BEE757',
    borderWidth: 2,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#BEE757',
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
  },
  modalButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '700',
  },
});
