// Permite aceptar o rechazar la propuesta y elegir la cuenta de cobro.
import React from 'react';
import { Alert, View, Text, TouchableOpacity, ScrollView, Modal, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

interface ProposalModalsProps {
  showOfferDetails: boolean;
  setShowOfferDetails: (val: boolean) => void;
  showInspectionResult: boolean;
  setShowInspectionResult: (val: boolean) => void;
  selectedProposal: any;
  selectedRequestId: string | null;
  loggedInUserId: number | null;
  showPaymentSelection: boolean;
  setShowPaymentSelection: (val: boolean) => void;
  paymentMethods: any[];
  selectedPayment: string;
  setSelectedPayment: (val: string) => void;
  showProposalSuccess: boolean;
  setShowProposalSuccess: (val: boolean) => void;
  showProposalRejected: boolean;
  setShowProposalRejected: (val: boolean) => void;
  checkUserStatusAndFetch: () => void;
  API_URL: string;
}

export const ProposalModals: React.FC<ProposalModalsProps> = ({
  showOfferDetails,
  setShowOfferDetails,
  showInspectionResult,
  setShowInspectionResult,
  selectedProposal,
  selectedRequestId,
  loggedInUserId,
  showPaymentSelection,
  setShowPaymentSelection,
  paymentMethods,
  selectedPayment,
  setSelectedPayment,
  showProposalSuccess,
  setShowProposalSuccess,
  showProposalRejected,
  setShowProposalRejected,
  checkUserStatusAndFetch,
  API_URL,
}) => {
  const proposalCurrency = selectedProposal?.propuesta?.moneda || 'pesos';
  const currencyLabel = proposalCurrency === 'dolares' ? 'USD' : 'ARS';
  const formatProposalAmount = (value: number | string) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) {
      return `${value} ${currencyLabel}`;
    }
    return `${amount.toLocaleString(proposalCurrency === 'dolares' ? 'en-US' : 'es-AR')} ${currencyLabel}`;
  };
  const bankMethods = paymentMethods.filter(method =>
    method.type === 'bank' && (method.moneda || 'pesos') === proposalCurrency
  );

  React.useEffect(() => {
    if (showPaymentSelection) {
      if (bankMethods.length > 0) {
        const exists = bankMethods.some(m => m.id === selectedPayment);
        if (!exists) {
          setSelectedPayment(bankMethods[0].id);
        }
      } else {
        setSelectedPayment('');
      }
    }
  }, [showPaymentSelection, paymentMethods, selectedPayment, proposalCurrency]);

  const isVisible = showOfferDetails || showPaymentSelection || showProposalSuccess || showProposalRejected;

  const handleBack = () => {
    if (showOfferDetails) {
      if (selectedProposal?.propuesta?.estado !== 'ACEPTADA' && selectedProposal?.propuesta?.estado !== 'RECHAZADA') {
        setShowInspectionResult(true);
        requestAnimationFrame(() => setShowOfferDetails(false));
      } else {
        setShowOfferDetails(false);
      }
    } else if (showPaymentSelection) {
      setShowPaymentSelection(false);
      setShowOfferDetails(true);
    } else if (showProposalSuccess) {
      setShowProposalSuccess(false);
      checkUserStatusAndFetch();
    } else if (showProposalRejected) {
      setShowProposalRejected(false);
      checkUserStatusAndFetch();
    }
  };

  return (
    <Modal visible={isVisible} animationType="none" presentationStyle="fullScreen">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.modalBackButton}>
            <Image
              source={require('../../../assets/images/Chevron-Left.png')}
              style={styles.backButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Oferta del Articulo</Text>
          <View style={{ width: 40 }} />
        </View>

        {showOfferDetails && (
          <>
            <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.offerTitle}>Nosotros proponemos...</Text>

              <View style={styles.offerCard}>
                <View style={styles.offerRow}>
                  <Text style={styles.offerLabel}>Nombre del Bien</Text>
                  <Text style={styles.offerValue}>{selectedProposal?.nombre || 'Cargando...'}</Text>
                </View>
                <View style={styles.offerRow}>
                  <Text style={styles.offerLabel}>Ubicación de Subasta</Text>
                  <Text style={styles.offerValue}>{selectedProposal?.propuesta?.ubicacionSubasta || 'No especificada'}</Text>
                </View>
                <View style={styles.offerRow}>
                  <Text style={styles.offerLabel}>Fecha Estimada</Text>
                  <Text style={styles.offerValue}>
                    {selectedProposal?.propuesta?.fechaEstimada
                      ? selectedProposal.propuesta.fechaEstimada.split('-').reverse().join(' / ')
                      : 'No especificada'}
                  </Text>
                </View>
                <View style={styles.offerRow}>
                  <Text style={styles.offerLabel}>Valor Base Propuesto</Text>
                  <Text style={styles.offerValue}>
                    {selectedProposal?.propuesta?.valorBase != null
                      ? formatProposalAmount(selectedProposal.propuesta.valorBase)
                      : 'No especificado'}
                  </Text>
                </View>
                <View style={[styles.offerRow, { marginBottom: 0 }]}>
                  <Text style={styles.offerLabel}>Comision Recibida</Text>
                  <Text style={styles.offerValue}>
                    {selectedProposal?.propuesta?.comision != null
                      ? `${selectedProposal.propuesta.comision}% de Valor Final de Venta`
                      : 'No especificada'}
                  </Text>
                </View>
              </View>

              {(!selectedProposal?.propuesta || selectedProposal.propuesta.valorBase == null) ? (
                <Text style={[styles.offerDecisionTitle, { color: '#E30613', fontWeight: 'bold' }]}>
                  La propuesta comercial aún no ha sido cargada por el revisor/tasador. Por favor regrese más tarde.
                </Text>
              ) : selectedProposal?.propuesta?.estado === 'ACEPTADA' ? (
                <Text style={[styles.offerDecisionTitle, { color: '#2E9F64', fontWeight: 'bold' }]}>
                  Esta propuesta ya ha sido ACEPTADA por usted.
                </Text>
              ) : selectedProposal?.propuesta?.estado === 'RECHAZADA' ? (
                <Text style={[styles.offerDecisionTitle, { color: '#BA4B4B', fontWeight: 'bold' }]}>
                  Esta propuesta ya ha sido RECHAZADA por usted.
                </Text>
              ) : (
                <Text style={styles.offerDecisionTitle}>Usted tiene la ultima palabra en esta negociación.</Text>
              )}
            </ScrollView>

            <View style={styles.offerFooter}>
              {selectedProposal?.propuesta?.estado === 'ACEPTADA' || selectedProposal?.propuesta?.estado === 'RECHAZADA' ? (
                <TouchableOpacity
                  style={[styles.shippingButton, { flex: 1 }]}
                  onPress={() => setShowOfferDetails(false)}
                >
                  <Text style={styles.shippingButtonText}>Volver</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.shippingButton,
                      { flex: 1, marginRight: 8 },
                      (!selectedProposal?.propuesta || selectedProposal.propuesta.valorBase == null) && { backgroundColor: '#ccc' }
                    ]}
                    disabled={!selectedProposal?.propuesta || selectedProposal.propuesta.valorBase == null}
                    onPress={() => {
                      setShowOfferDetails(false);
                      setShowPaymentSelection(true);
                    }}
                  >
                    <Text style={styles.shippingButtonText}>Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.rejectButton, { flex: 1, marginLeft: 8 }]} onPress={async () => {
                    if (selectedRequestId) {
                      try {
                        const response = await fetch(`${API_URL}/solicitudes-items/${selectedRequestId}/propuesta/rechazar`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Autorizacion': loggedInUserId ? String(loggedInUserId) : '',
                          },
                          body: JSON.stringify({
                            costoDevolucion: 0,
                          }),
                        });
                        if (response.ok) {
                          setShowOfferDetails(false);
                          setShowProposalRejected(true);
                        } else {
                          console.error('Error rejecting proposal:', response.statusText);
                          setShowOfferDetails(false);
                        }
                      } catch (err) {
                        console.error('Network error rejecting proposal:', err);
                        setShowOfferDetails(false);
                      }
                    } else {
                      setShowOfferDetails(false);
                    }
                  }}>
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}

        {showPaymentSelection && (
          <>
            <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.offerTitle}>Seleccione donde se{"\n"}depositara la comisión.</Text>

              <View style={styles.paymentOptionsContainer}>
                {bankMethods.length > 0 ? (
                  bankMethods.map(method => (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]}
                      onPress={() => setSelectedPayment(method.id)}
                    >
                      <View style={styles.paymentOptionLeft}>
                        {/* @ts-ignore */}
                        <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} size={24} tintColor="#051C2C" style={styles.paymentIcon} />
                        <Text style={[styles.paymentOptionText, { marginLeft: 16 }]}>{method.name}</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedPayment === method.id && styles.radioCircleSelected]}>
                        {selectedPayment === method.id && <View style={styles.radioInnerCircle} />}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noPaymentContainer}>
                    <Text style={styles.noPaymentText}>No posee cuentas bancarias en {currencyLabel} registradas en su perfil.</Text>
                    <Text style={styles.noPaymentSubtext}>Debe registrar una cuenta bancaria compatible con la moneda de la propuesta para poder continuar.</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.offerFooter}>
              <TouchableOpacity
                style={[styles.shippingButton, { flex: 1 }, (!selectedPayment || bankMethods.length === 0) && { backgroundColor: '#ccc' }]}
                disabled={!selectedPayment || bankMethods.length === 0}
                onPress={async () => {
                  if (selectedRequestId) {
                    try {
                      const response = await fetch(`${API_URL}/solicitudes-items/${selectedRequestId}/propuesta/aceptar`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Autorizacion': loggedInUserId ? String(loggedInUserId) : '',
                        },
                        body: JSON.stringify({
                          idCuentaDeposito: selectedPayment,
                        }),
                      });
                      if (response.ok) {
                        setShowPaymentSelection(false);
                        setShowProposalSuccess(true);
                      } else {
                        const errorData = await response.json().catch(() => ({}));
                        Alert.alert('No se pudo aceptar la propuesta', errorData.error || errorData.message || 'Revise la cuenta bancaria seleccionada.');
                      }
                    } catch (err) {
                      console.error('Network error accepting proposal:', err);
                      Alert.alert('No se pudo aceptar la propuesta', 'Revise su conexion e intente nuevamente.');
                    }
                  } else {
                    setShowPaymentSelection(false);
                  }
                }}
              >
                <Text style={styles.shippingButtonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {showProposalSuccess && (
          <>
            <View style={styles.modalContent}>
              <Image
                source={require('../../../assets/images/tick.png')}
                style={styles.tickImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Su articulo ya esta listo{"\n"}para ser subastado.</Text>
              <Text style={styles.modalSubtitle}>
                Tu artículo ya está listo para ser subastado. Serás notificado con el resultado y podrás seguir la subasta desde la sección Mis Artículos en la Inbox.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowProposalSuccess(false);
                checkUserStatusAndFetch();
              }}>
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {showProposalRejected && (
          <>
            <View style={styles.modalContent}>
              <Image
                source={require('@/assets/images/logosintexto.png')}
                style={{ width: 80, height: 80, resizeMode: 'contain', marginBottom: 32 }}
              />
              <Text style={styles.modalTitle}>Respetamos su{"\n"}decisión y su articulo{"\n"}sera devuelto.</Text>
              <Text style={styles.modalSubtitle}>
                Su artículo será devuelto por nuestro equipo, asegurando que el proceso se realice de forma clara y pueda continuar con confianza dentro de la plataforma.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.shippingButton} onPress={() => {
                setShowProposalRejected(false);
                checkUserStatusAndFetch();
              }}>
                <Text style={styles.shippingButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    borderBottomColor: '#D8DCE0',
  },
  modalBackButton: {
    padding: 8,
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    lineHeight: 34,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    lineHeight: 24,
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
  },
  modalButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  offerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 18,
  },
  offerSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 22,
    marginBottom: 24,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 20,
    marginBottom: 32,
  },
  offerRow: {
    marginBottom: 20,
  },
  offerLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  offerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  offerDecisionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
    marginBottom: 24,
  },
  offerFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  shippingButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shippingButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '700',
  },
  rejectButton: {
    backgroundColor: '#BA4A5A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  noPaymentContainer: {
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noPaymentText: {
    color: '#D45B00',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  noPaymentSubtext: {
    color: '#8A8A8A',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  tickImage: {
    width: 80,
    height: 80,
    marginBottom: 28,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#BEE757',
  },
});
