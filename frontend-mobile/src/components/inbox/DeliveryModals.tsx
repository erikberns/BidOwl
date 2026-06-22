import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

interface DeliveryModalsProps {
  showBidWon: boolean;
  setShowBidWon: (val: boolean) => void;
  wonItemDetails: any;
  setShowDeliverySelection: (val: boolean) => void;
  showDeliverySelection: boolean;
  deliveryType: 'envio' | 'retiro';
  setDeliveryType: (val: 'envio' | 'retiro') => void;
  setShowWonInvoice: (val: boolean) => void;
  showWonInvoice: boolean;
  showDeliverySuccess: boolean;
  setShowDeliverySuccess: (val: boolean) => void;
  loggedInUserId: number | null;
  checkUserStatusAndFetch: () => void;
  API_URL: string;
  alreadyConfirmed?: boolean;
}

export const DeliveryModals: React.FC<DeliveryModalsProps> = ({
  showBidWon,
  setShowBidWon,
  wonItemDetails,
  setShowDeliverySelection,
  showDeliverySelection,
  deliveryType,
  setDeliveryType,
  setShowWonInvoice,
  showWonInvoice,
  showDeliverySuccess,
  setShowDeliverySuccess,
  loggedInUserId,
  checkUserStatusAndFetch,
  API_URL,
  alreadyConfirmed = false,
}) => {
  const isVisible = showBidWon || showDeliverySelection || showWonInvoice || showDeliverySuccess;

  const handleBack = () => {
    if (showBidWon) {
      setShowBidWon(false);
    } else if (showDeliverySelection) {
      setShowDeliverySelection(false);
      setShowBidWon(true);
    } else if (showWonInvoice) {
      if (alreadyConfirmed) {
        setShowWonInvoice(false);
      } else {
        setShowWonInvoice(false);
        setShowDeliverySelection(true);
      }
    } else if (showDeliverySuccess) {
      setShowDeliverySuccess(false);
      checkUserStatusAndFetch();
    }
  };

  const getHeaderTitle = () => {
    if (showBidWon) return 'Lote Obtenido';
    if (showDeliverySelection) return 'Factura de Puja';
    if (showWonInvoice) return 'Factura de Puja';
    if (showDeliverySuccess) return deliveryType === 'envio' ? 'Envio del Articulo' : 'Retiro del Articulo';
    return '';
  };

  return (
    <Modal visible={isVisible} animationType="none" presentationStyle="fullScreen">
      <SafeAreaView style={styles.modalContainer}>
        {/* Universal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.modalBackButton}>
            <Image 
              source={require('../../../assets/images/Chevron-Left.png')} 
              style={styles.backButtonImage} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>{getHeaderTitle()}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 1. ¡Ha obtenido un nuevo objeto! Section */}
        {showBidWon && (
          <>
            <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#051C2C', marginHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
                ¡Ha obtenido un nuevo objeto!
              </Text>
              <Text style={{ color: '#2E8B57', fontWeight: 'bold', fontSize: 18, marginHorizontal: 20, marginBottom: 16 }}>
                {wonItemDetails?.subastaTitle}
              </Text>
              
              <View style={[styles.offerCard, { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20 }]}>
                <Image 
                  source={require('@/assets/images/rolling_stone_auction.png')} 
                  style={{ width: 80, height: 120, resizeMode: 'contain', marginRight: 16 }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: '#8A8A8A', marginBottom: 4 }}>
                    Lote {wonItemDetails?.loteIndex} / {wonItemDetails?.totalLotes}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#051C2C', marginBottom: 8 }}>
                    {wonItemDetails?.itemTitle}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, color: '#2E8B57', fontWeight: 'bold' }}>Mi Puja: </Text>
                    <Text style={{ fontSize: 16, color: '#051C2C', fontWeight: 'bold' }}>
                      {wonItemDetails?.importe ? (Number(wonItemDetails.importe).toLocaleString('es-AR') + ' AR$') : ''}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.modalSubtitle, { textAlign: 'left', marginHorizontal: 20, marginTop: 24, color: '#555', lineHeight: 22 }]}>
                Te entregaremos la factura correspondiente para formalizar la operación. A continuación, podrás confirmar la modalidad de entrega.
              </Text>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowBidWon(false);
                setShowDeliverySelection(true);
              }}>
                <Text style={styles.modalButtonText}>Ver Factura y Envio</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 2. Elegí cómo querés recibir tu objeto Section */}
        {showDeliverySelection && (
          <>
            <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#051C2C', marginHorizontal: 20, marginTop: 16 }}>
                Elegí cómo querés recibir tu objeto
              </Text>

              {/* Custom Tab Segment */}
              <View style={[styles.tabsContainer, { marginHorizontal: 20, marginTop: 24, marginBottom: 20 }]}>
                <TouchableOpacity
                  style={[styles.tab, deliveryType === 'envio' && styles.tabActive]}
                  onPress={() => setDeliveryType('envio')}
                >
                  <Text style={[styles.tabText, deliveryType === 'envio' && styles.tabTextActive]}>
                    Envio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, deliveryType === 'retiro' && styles.tabActive]}
                  onPress={() => setDeliveryType('retiro')}
                >
                  <Text style={[styles.tabText, deliveryType === 'retiro' && styles.tabTextActive]}>
                    Retirarlo
                  </Text>
                </TouchableOpacity>
              </View>

              {deliveryType === 'envio' ? (
                <View style={[styles.offerCard, { marginHorizontal: 20, padding: 16 }]}>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Domicilio Legal</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C', marginBottom: 16 }}>
                    {wonItemDetails?.domicilio || 'No especificado'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Costo de Envio</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                    {wonItemDetails?.costoEnvio ? (Number(wonItemDetails.costoEnvio).toLocaleString('es-AR') + ' AR$') : '20.000 AR$'}
                  </Text>
                </View>
              ) : (
                <View style={{ marginHorizontal: 20 }}>
                  <View style={[styles.offerCard, { padding: 16, marginBottom: 12 }]}>
                    <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Retiro Personal</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#051C2C', marginBottom: 16 }}>
                      Depósito Central BidOwl Pilar
                    </Text>
                    <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Costo de Envio</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                      0 AR$
                    </Text>
                  </View>
                  
                  {/* Warning Card */}
                  <View style={[styles.warningCard, { padding: 16, marginBottom: 20 }]}>
                    <Text style={styles.warningText}>
                      ⚠️ Al retirar el bien personalmente, se perderá la cobertura del seguro contratado.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#ADFF2F', borderColor: '#ADFF2F' }]} 
                onPress={() => {
                  setShowDeliverySelection(false);
                  setShowWonInvoice(true);
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#051C2C', fontWeight: 'bold' }]}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 3. Factura de Puja Realizada Section */}
        {showWonInvoice && (
          <>
            <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#051C2C', marginHorizontal: 20, marginTop: 16 }}>
                Factura de Puja Realizada.
              </Text>

              {alreadyConfirmed && (
                <View style={[styles.warningCard, { backgroundColor: '#EBFBEE', borderColor: '#2E9F64', marginHorizontal: 20, marginTop: 16, padding: 12 }]}>
                  <Text style={[styles.warningText, { color: '#2E9F64' }]}>
                    ✓ Esta factura ya ha sido formalizada y pagada.
                  </Text>
                </View>
              )}
              
              <View style={[styles.offerCard, { marginHorizontal: 20, padding: 16, marginTop: 24 }]}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Nombre del Bien</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                    {wonItemDetails?.itemTitle}
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Valor Base Propuesto</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                    {wonItemDetails?.importe ? (Number(wonItemDetails.importe).toLocaleString('es-AR') + ' AR$') : ''}
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Costo de Envio</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                    {deliveryType === 'envio' 
                      ? (wonItemDetails?.costoEnvio ? (Number(wonItemDetails.costoEnvio).toLocaleString('es-AR') + ' AR$') : '20.000 AR$')
                      : '0 AR$'
                    }
                  </Text>
                </View>

                <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 }} />

                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Total</Text>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#051C2C' }}>
                    {(() => {
                      const base = wonItemDetails?.importe ? Number(wonItemDetails.importe) : 0;
                      const shipping = (deliveryType === 'envio' && wonItemDetails?.costoEnvio) ? Number(wonItemDetails.costoEnvio) : 0;
                      return (base + shipping).toLocaleString('es-AR') + ' AR$';
                    })()}
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              {alreadyConfirmed ? (
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#051C2C', borderColor: '#051C2C' }]} 
                  onPress={() => setShowWonInvoice(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff', fontWeight: 'bold' }]}>Volver</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#ADFF2F', borderColor: '#ADFF2F' }]} 
                  onPress={async () => {
                    if (wonItemDetails && wonItemDetails.itemId) {
                      try {
                        const base = wonItemDetails.importe ? Number(wonItemDetails.importe) : 0;
                        const shipping = (deliveryType === 'envio' && wonItemDetails.costoEnvio) ? Number(wonItemDetails.costoEnvio) : 0;
                        
                        const response = await fetch(`${API_URL}/inbox/won-item/${wonItemDetails.itemId}/confirmar-entrega`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Autorizacion': loggedInUserId ? String(loggedInUserId) : '',
                          },
                          body: JSON.stringify({
                            tipoEntrega: deliveryType,
                            costoEnvio: shipping,
                            total: base + shipping
                          }),
                        });
                        
                        if (response.ok) {
                          setShowWonInvoice(false);
                          setShowDeliverySuccess(true);
                        } else {
                          console.error('Error confirming delivery details:', response.statusText);
                          setShowWonInvoice(false);
                        }
                      } catch (err) {
                        console.error('Network error confirming delivery details:', err);
                        setShowWonInvoice(false);
                      }
                    } else {
                      setShowWonInvoice(false);
                    }
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: '#051C2C', fontWeight: 'bold' }]}>Finalizar</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* 4. Envio del Articulo Success Section */}
        {showDeliverySuccess && (
          <>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                {/* @ts-ignore */}
                <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
              </View>
              <Text style={[styles.modalTitle, { fontSize: 24 }]}>
                {deliveryType === 'envio' 
                  ? 'Su articulo sera\nenviado a su domicilio\nen a lo largo de la\nsemana.'
                  : 'Su articulo esta\nlisto para ser retirado\nen nuestro deposito.'
                }
              </Text>
              <Text style={styles.modalSubtitle}>
                {deliveryType === 'envio'
                  ? 'Nuestro equipo se encargará de coordinar la logística para garantizar una entrega segura y en tiempo estimado.'
                  : 'Podes pasar a buscarlo de lunes a viernes de 9 a 18 hs con tu DNI y el código de transacción de la subasta.'
                }
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowDeliverySuccess(false);
                checkUserStatusAndFetch();
              }}>
                <Text style={styles.modalButtonText}>Continuar</Text>
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
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 20,
    marginBottom: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#051C2C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  tabTextActive: {
    color: '#051C2C',
  },
  warningCard: {
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    padding: 16,
  },
  warningText: {
    color: '#D45B00',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
