// Valida elegibilidad, pago y multas antes de conectar al usuario.
import React, { useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, Modal, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';
import { authHeaders } from '@/services/authSession';

const CATEGORY_RANKS: Record<string, number> = {
  'COMUN': 0,
  'ESPECIAL': 1,
  'PLATA': 2,
  'ORO': 3,
  'PLATINO': 4
};

const auctionPaymentStorageKey = (auctionId: string) => `auctionPaymentMethod:${auctionId}`;

function normalizeCategory(value: string) {
  if (!value) return 'COMUN';
  return value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

interface JoinAuctionBarProps {
  auctionId: string;
  onBack?: () => void;
  isActive?: boolean;
}

export default function JoinAuctionBar({ auctionId, onBack, isActive: propIsActive }: JoinAuctionBarProps) {
  const isDark = false;
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(propIsActive !== undefined ? propIsActive : true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [auctionCategory, setAuctionCategory] = useState<string>('COMUN');
  const [userCategory, setUserCategory] = useState<string>('COMUN');
  const [auctionCurrency, setAuctionCurrency] = useState<string>('pesos');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('No se pudo entrar');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const showErrorModal = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  const normalizeJoinError = (message?: string) => {
    if (!message) return 'No se pudo unir a la subasta.';
    const normalized = message.toLowerCase();
    if (normalized.includes('deuda') || normalized.includes('multa') || normalized.includes('suspendida')) {
      return 'Tenes una multa o deuda pendiente. Debes pagarla desde tu perfil antes de poder participar en otra subasta.';
    }
    return message;
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'visa':
        return { ios: 'creditcard', android: 'credit_card', web: 'credit_card' };
      case 'bank':
        return { ios: 'building.columns', android: 'account_balance', web: 'account_balance' };
      case 'check':
        return { ios: 'doc.plaintext', android: 'description', web: 'description' };
      default:
        return { ios: 'questionmark.circle', android: 'help', web: 'help' };
    }
  };

  // Load payment methods from backend
  const loadPaymentMethods = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const uId = user.identificador;
      if (!uId) return;

      const response = await fetch(`${API_URL}/personas/${uId}/metodos-pago`);
      if (response.ok) {
        const data = await response.json();
        const compatible = data.filter((item: any) => {
          const methodCurrency = item.tarjetaCredito
            ? 'pesos'
            : item.cuentaBancaria?.moneda || item.chequeCertificado?.moneda || 'pesos';
          return methodCurrency === auctionCurrency;
        });
        const mapped = compatible.map((item: any) => {
          if (item.tarjetaCredito) {
            const num = item.tarjetaCredito.numeroTarjeta || '';
            const last4 = num.length >= 4 ? num.slice(-4) : num;
            return {
              id: String(item.identificador),
              type: 'visa',
              label: 'Tarjeta de Crédito',
              details: `**** **** **** ${last4} · Pesos`,
            };
          } else if (item.cuentaBancaria) {
            const cbu = item.cuentaBancaria.cbuIban || '';
            const last4 = cbu.length >= 4 ? cbu.slice(-4) : cbu;
            return {
              id: String(item.identificador),
              type: 'bank',
              label: `Cuenta Bancaria ${item.cuentaBancaria.nombreBanco || ''}`,
              details: `CBU/IBAN: ****${last4} · ${item.cuentaBancaria.moneda === 'dolares' ? 'Dolares' : 'Pesos'}`,
            };
          } else if (item.chequeCertificado) {
            return {
              id: String(item.identificador),
              type: 'check',
              label: `Cheque Certificado ${item.chequeCertificado.numeroCheque || ''}`,
              details: `Banco: ${item.chequeCertificado.bancoEmisor || ''} · ${item.chequeCertificado.moneda === 'dolares' ? 'Dolares' : 'Pesos'}`,
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
        if (mapped.length > 0) {
          setSelectedMethod(mapped[0]);
        } else {
          setSelectedMethod(null);
        }
      }
    } catch (e) {
      console.error('[JoinAuctionBar] Error fetching payment methods:', e);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      loadPaymentMethods();
    } else {
      setIsDropdownOpen(false);
    }
  }, [isModalVisible, auctionCurrency]);

  const activeColor = '#051C2C';
  const backgroundColor = '#FFFFFF';
  const borderColor = '#ECECEC';

  // Helper to parse dates from API or Mock
  function parseAuctionDateTime(dateStr: string, timeStr: string): Date {
    try {
      if (!dateStr) return new Date();
      const cleanDate = dateStr.replace(/\s+/g, '');
      const cleanTime = timeStr ? timeStr.split(' ')[0].replace(/\s+/g, '') : "00:00";

      const dateParts = cleanDate.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);

        const timeParts = cleanTime.split(':');
        const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
        const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
        const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

        return new Date(year, month, day, hours, minutes, seconds);
      }

      const isoParts = cleanDate.split('-');
      if (isoParts.length === 3) {
        const year = parseInt(isoParts[0], 10);
        const month = parseInt(isoParts[1], 10) - 1;
        const day = parseInt(isoParts[2], 10);

        const timeParts = cleanTime.split(':');
        const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
        const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
        const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

        return new Date(year, month, day, hours, minutes, seconds);
      }
    } catch (e) {
      console.error("Error parsing date-time:", e);
    }
    return new Date();
  }

  useEffect(() => {
    async function loadGuestStatus() {
      try {
        const isGuestStr = await AsyncStorage.getItem('isGuest');
        const userStr = await AsyncStorage.getItem('user');
        const isGuestUser = (isGuestStr === 'true' || isGuestStr === null) && !userStr;
        setIsGuest(isGuestUser);
        if (!isGuestUser && userStr) {
          const user = JSON.parse(userStr);
          setUserCategory(user.categoria || 'COMUN');
        }
      } catch (error) {
        setIsGuest(true);
      }
    }
    loadGuestStatus();
  }, []);

  useEffect(() => {
    async function checkAuctionStatus() {
      try {
        const res = await fetch(`${API_URL}/subastas/${auctionId}?detalle=true`);
        if (res.ok) {
          const detail = await res.json();
          if (detail) {
            if (detail.categoria) {
              setAuctionCategory(detail.categoria);
            } else if (detail.category) {
              setAuctionCategory(detail.category);
            }
            if (detail.moneda) {
              setAuctionCurrency(detail.moneda);
            }
            if (propIsActive !== undefined) {
              setIsActive(propIsActive);
            } else if (detail.fecha) {
              const startDate = parseAuctionDateTime(detail.fecha, detail.hora);
              const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
              const now = new Date();
              const active = now.getTime() >= startDate.getTime() &&
                now.getTime() < endDate.getTime() &&
                detail.estado !== 'finalizada' &&
                detail.estado !== 'carrada' &&
                detail.estado !== 'cerrada';
              setIsActive(active);
            }
          }
        }
      } catch (e) {
        console.error('[JoinAuctionBar] Error checking status:', e);
        if (propIsActive !== undefined) {
          setIsActive(propIsActive);
        }
      }
    }
    checkAuctionStatus();
  }, [auctionId, propIsActive]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleJoinPressLegacy = () => {
    if (isGuest) {
      Alert.alert(
        'Acceso requerido',
        'Debes iniciar sesión para entrar a la subasta.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a perfil', onPress: () => router.push('/profile') },
        ]
      );
      return;
    }

    setIsModalVisible(true);
  };
  void handleJoinPressLegacy;

  const handleJoinPress = async () => {
    if (isGuest) {
      showErrorModal('Acceso requerido', 'Debes iniciar sesion para entrar a la subasta.');
      return;
    }

    try {
      const elegRes = await fetch(`${API_URL}/subastas/${auctionId}/elegibilidad?_=${Date.now()}`, {
        headers: await authHeaders()
      });
      if (elegRes.ok) {
        const elegibilidad = await elegRes.json();
        if (elegibilidad && elegibilidad.puedeUnirse === false) {
          showErrorModal('Participacion suspendida', normalizeJoinError(elegibilidad.motivoRechazo));
          return;
        }
      }
    } catch (e) {
      console.warn('[JoinAuctionBar] No se pudo verificar elegibilidad antes de entrar:', e);
    }

    setIsModalVisible(true);
  };

  const normUserCat = normalizeCategory(userCategory);
  const normAuctionCat = normalizeCategory(auctionCategory);
  const userRank = CATEGORY_RANKS[normUserCat] ?? 0;
  const auctionRank = CATEGORY_RANKS[normAuctionCat] ?? 0;
  const isCategoryTooLow = !isGuest && (auctionRank > userRank);

  let buttonText = 'Unirse a Subasta';
  if (!isActive) {
    buttonText = 'Subasta Inactiva';
  } else if (isCategoryTooLow) {
    buttonText = 'Categoría Insuficiente';
  }

  const isBtnDisabled = !isActive || isCategoryTooLow;
  const applyDisabledStyle = !isActive || isGuest || isCategoryTooLow;

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
        style={[styles.joinBtn, applyDisabledStyle ? styles.disabledJoinBtn : null]}
        onPress={handleJoinPress}
        activeOpacity={0.8}
        disabled={isBtnDisabled}
      >
        <Text style={[styles.joinBtnText, applyDisabledStyle ? styles.disabledJoinBtnText : null]}>
          {buttonText}
        </Text>
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
              <TouchableOpacity
                style={styles.selectorDropdown}
                activeOpacity={0.8}
                onPress={() => {
                  if (paymentMethods.length > 0) {
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <View style={styles.selectorLeftRow}>
                  <SymbolView
                    tintColor="#051C2C"
                    // @ts-ignore
                    name={selectedMethod ? getIconName(selectedMethod.type) : { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
                    size={24}
                    style={styles.cardIcon}
                  />
                  <Text style={[styles.selectorText, !selectedMethod && { color: '#E30613' }]}>
                    {selectedMethod
                      ? `${selectedMethod.label} ${selectedMethod.details}`
                      : 'No hay métodos de pago registrados'}
                  </Text>
                </View>
                {paymentMethods.length > 0 && (
                  <SymbolView
                    tintColor="#051C2C"
                    // @ts-ignore
                    name={isDropdownOpen ? { ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'chevron_up' } : { ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'chevron_down' }}
                    size={16}
                  />
                )}
              </TouchableOpacity>

              {isDropdownOpen && paymentMethods.length > 0 && (
                <View style={styles.dropdownOptionsContainer}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={styles.dropdownOption}
                      onPress={async () => {
                        setSelectedMethod(method);
                        await AsyncStorage.setItem(auctionPaymentStorageKey(auctionId), method.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <SymbolView
                        tintColor="#051C2C"
                        // @ts-ignore
                        name={getIconName(method.type)}
                        size={20}
                        style={styles.cardIcon}
                      />
                      <Text style={styles.dropdownOptionText}>
                        {method.label} {method.details}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* ¡Entrar! Action Button */}
              <TouchableOpacity
                style={styles.modalEnterButton}
                onPress={async () => {
                  if (!selectedMethod) {
                    Alert.alert(
                      'Método de pago requerido',
                      'Debes registrar al menos un método de pago en tu perfil para poder formar parte de las subastas.',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Ir a Perfil', onPress: () => { setIsModalVisible(false); router.push('/profile'); } }
                      ]
                    );
                    return;
                  }

                  try {
                    const userStr = await AsyncStorage.getItem('user');
                    if (!userStr) {
                      Alert.alert('Acceso requerido', 'Debes iniciar sesión para unirte a la subasta.');
                      return;
                    }
                    const user = JSON.parse(userStr);
                    await AsyncStorage.setItem(auctionPaymentStorageKey(auctionId), selectedMethod.id);

                    const response = await fetch(`${API_URL}/subastas/${auctionId}/unirse`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(await authHeaders())
                      },
                      body: JSON.stringify({})
                    });

                    if (response.ok) {
                      await AsyncStorage.setItem(auctionPaymentStorageKey(auctionId), selectedMethod.id);
                      setIsModalVisible(false);
                      router.push(`/auction/${auctionId}/bidding` as any);
                    } else {
                      const errorData = await response.json().catch(() => ({}));
                      showErrorModal(
                        'No se pudo entrar',
                        normalizeJoinError(errorData.error || errorData.motivoRechazo || errorData.mensaje)
                      );
                    }
                  } catch (e) {
                    console.error('[JoinAuctionBar] Error joining auction:', e);
                    Alert.alert('Error', 'Ocurrió un error al intentar unirse a la subasta.');
                  }
                }}
              >
                <Text style={styles.modalEnterButtonText}>¡Entrar!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={errorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorIconCircle}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorModalTitle}>{errorModalTitle}</Text>
            <Text style={styles.errorModalMessage}>{errorModalMessage}</Text>
            <TouchableOpacity
              style={styles.modalEnterButton}
              activeOpacity={0.8}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalEnterButtonText}>Entendido</Text>
            </TouchableOpacity>
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
  disabledJoinBtn: {
    backgroundColor: '#DADADA',
    borderWidth: 1,
    borderColor: '#03161A',
  },
  joinBtnText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledJoinBtnText: {
    color: '#03161A',
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
  },
  errorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '88%',
    maxWidth: 360,
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    color: '#E30613',
    fontSize: 28,
    fontWeight: '900',
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4F5B62',
    textAlign: 'center',
    marginBottom: 22,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  cardIcon: {
    marginRight: 12,
  },
  selectorText: {
    flex: 1,
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
  },
  dropdownOptionsContainer: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginTop: -16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
