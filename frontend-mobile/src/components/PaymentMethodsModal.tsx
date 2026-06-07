import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { MaxContentWidth } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { PaymentMethodsScreen } from './PaymentMethodsScreen';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'bank' | 'check';
  label: string;
  details: string;
}

interface PaymentMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PaymentMethodsModal({ visible, onClose }: PaymentMethodsModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPaymentMethods();
    }
  }, [visible]);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setPaymentMethods([]);
        return;
      }
      const user = JSON.parse(userStr);
      const uId = user.identificador;
      setUserId(uId);
      if (!uId) {
        setPaymentMethods([]);
        return;
      }

      console.log(`Fetching payment methods for user ${uId} from ${API_URL}/personas/${uId}/metodos-pago`);
      const response = await fetch(`${API_URL}/personas/${uId}/metodos-pago`);
      if (!response.ok) {
        throw new Error('Error al obtener los métodos de pago.');
      }
      const data = await response.json();
      console.log('Fetched payment methods:', data);

      const mapped: PaymentMethod[] = data.map((item: any) => {
        if (item.tarjetaCredito) {
          const num = item.tarjetaCredito.numeroTarjeta || '';
          const last4 = num.length >= 4 ? num.slice(-4) : num;
          return {
            id: String(item.identificador),
            type: 'visa',
            label: 'Tarjeta de Crédito',
            details: `**** **** **** ${last4}`,
          };
        } else if (item.cuentaBancaria) {
          return {
            id: String(item.identificador),
            type: 'bank',
            label: `Cuenta Bancaria ${item.cuentaBancaria.nombreBanco || ''}`,
            details: `CBU/IBAN: ${item.cuentaBancaria.cbuIban || ''}`,
          };
        } else if (item.chequeCertificado) {
          return {
            id: String(item.identificador),
            type: 'check',
            label: `Cheque Certificado ${item.chequeCertificado.numeroCheque || ''}`,
            details: `Banco: ${item.chequeCertificado.bancoEmisor || ''}`,
          };
        }
        return {
          id: String(item.identificador),
          type: 'check',
          label: 'Método desconocido',
          details: '',
        };
      });
      setPaymentMethods(mapped);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/personas/metodo-pago/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.error || 'Error al eliminar el método de pago.');
      }
      setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      if (Platform.OS === 'web') {
        alert(error.message || 'No se pudo eliminar el método de pago.');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', error.message || 'No se pudo eliminar el método de pago.');
      }
    }
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'visa':
        return { ios: 'creditcard', android: 'credit_card', web: 'credit_card' };
      case 'bank':
        return { ios: 'building.2', android: 'account_balance', web: 'account_balance' };
      case 'check':
        return { ios: 'doc.plaintext', android: 'description', web: 'description' };
      default:
        return { ios: 'questionmark.circle', android: 'help', web: 'help' };
    }
  };

  if (isAdding) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setIsAdding(false)}
      >
        <PaymentMethodsScreen
          userId={userId || undefined}
          onBack={() => {
            setIsAdding(false);
            fetchPaymentMethods();
          }}
          onComplete={() => {
            setIsAdding(false);
            fetchPaymentMethods();
          }}
        />
      </Modal>
    );
  }

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
            {isLoading ? (
              <ActivityIndicator size="large" color="#2C6E3F" style={{ marginVertical: 30 }} />
            ) : paymentMethods.length === 0 ? (
              <Text style={styles.emptyText}>No tienes métodos de pago registrados.</Text>
            ) : (
              paymentMethods.map((method) => (
                <View key={method.id} style={styles.methodItem}>
                  <View style={styles.methodContent}>
                    {/* Left edit pencil badge */}
                    <View style={styles.editButton}>
                      <Image
                        source={require('../../assets/images/editar.png')}
                        style={styles.buttonImage}
                        resizeMode="contain"
                      />
                    </View>
                    
                    {/* Outline icon */}
                    <SymbolView
                      tintColor="#051C2C"
                      // @ts-ignore
                      name={getIconName(method.type)}
                      size={24}
                    />

                    <View style={styles.methodInfo}>
                      <Text style={styles.methodLabel}>
                        <Text style={styles.methodLabelBold}>{method.label}</Text>
                      </Text>
                      {!!method.details && (
                        <Text style={styles.methodDetails}>{method.details}</Text>
                      )}
                    </View>
                  </View>
                  
                  {/* Red cross delete button */}
                  <Pressable
                    onPress={() => removePaymentMethod(method.id)}
                    style={styles.deleteButton}
                    disabled={isLoading}
                  >
                    <Image
                      source={require('../../assets/images/borrar.png')}
                      style={styles.buttonImage}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {/* Add Payment Method Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
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
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    marginBottom: 12,
  },
  methodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#051C2C',
  },
  methodLabelBold: {
    fontWeight: '700',
  },
  methodDetails: {
    fontSize: 14,
    color: '#8A8A8A',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: 20,
    height: 20,
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
  emptyText: {
    fontSize: 16,
    color: '#8A8A8A',
    textAlign: 'center',
    marginVertical: 20,
  },
});
