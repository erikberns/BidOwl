import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { MaxContentWidth } from '@/constants/theme';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'bank' | 'check';
  label: string;
  details: string;
  isSelected: boolean;
}

interface PaymentMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PaymentMethodsModal({ visible, onClose }: PaymentMethodsModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      label: 'VISA',
      details: '**** **** **** 2345',
      isSelected: true,
    },
    {
      id: '2',
      type: 'bank',
      label: 'Cuenta Bancaria Cólosa',
      details: 'Cuentas Corrientes',
      isSelected: true,
    },
    {
      id: '3',
      type: 'check',
      label: 'Cheque Certificado',
      details: '00045801',
      isSelected: true,
    },
  ]);

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === id ? { ...method, isSelected: !method.isSelected } : method
      )
    );
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'visa':
        return { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' };
      case 'bank':
        return { ios: 'building.2.fill', android: 'account_balance', web: 'account_balance' };
      case 'check':
        return { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' };
      default:
        return { ios: 'questionmark.circle', android: 'help', web: 'help' };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <SymbolView
                tintColor="#051C2C"
                // @ts-ignore
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={24}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Métodos de Pago</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Payment Methods List */}
          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.methodItem}>
                <View style={styles.methodContent}>
                  <SymbolView
                    tintColor="#2C6E3F"
                    // @ts-ignore
                    name={getIconName(method.type)}
                    size={24}
                  />
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodLabel}>{method.label}</Text>
                    <Text style={styles.methodDetails}>{method.details}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => togglePaymentMethod(method.id)}
                  style={[styles.checkbox, method.isSelected && styles.checkboxChecked]}
                >
                  {method.isSelected && (
                    <SymbolView
                      tintColor="#fff"
                      // @ts-ignore
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={16}
                    />
                  )}
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add Payment Method Button */}
          <TouchableOpacity style={styles.addButton}>
            <SymbolView
              tintColor="#2C6E3F"
              // @ts-ignore
              name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
              size={20}
            />
            <Text style={styles.addButtonText}>Agregar Método de Pago</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onClose}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#051C2C',
    flex: 1,
    textAlign: 'center',
  },
  methodsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 12,
  },
  methodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#051C2C',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    color: '#8A8A8A',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8A8A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C6E3F',
    borderColor: '#2C6E3F',
  },
  addButton: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#2C6E3F',
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C6E3F',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  continueButton: {
    backgroundColor: '#2C6E3F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
