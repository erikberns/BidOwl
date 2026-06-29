// Presenta la inspeccion del articulo y el acuerdo de envio o devolucion.
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import MapComponent from '../Map';

interface InspectionModalsProps {
  showInspectionRequest: boolean;
  setShowInspectionRequest: (val: boolean) => void;
  showInspectionResult: boolean;
  setShowInspectionResult: (val: boolean) => void;
  showInspectionRejected: boolean;
  setShowInspectionRejected: (val: boolean) => void;
  showShippingInstructions: boolean;
  setShowShippingInstructions: (val: boolean) => void;
  setShowOfferDetails: (val: boolean) => void;
  selectedLocation: { latitude: number; longitude: number };
  setSelectedLocation: (val: any) => void;
  selectedAddress: string;
  setSelectedAddress: (val: string) => void;
  selectedRequestId: string | null;
  loggedInUserId: number | null;
  checkUserStatusAndFetch: () => void;
  API_URL: string;
  selectedProposal: any;
}

export const InspectionModals: React.FC<InspectionModalsProps> = ({
  showInspectionRequest,
  setShowInspectionRequest,
  showInspectionResult,
  setShowInspectionResult,
  showInspectionRejected,
  setShowInspectionRejected,
  showShippingInstructions,
  setShowShippingInstructions,
  setShowOfferDetails,
  selectedLocation,
  setSelectedLocation,
  selectedAddress,
  setSelectedAddress,
  selectedRequestId,
  loggedInUserId,
  checkUserStatusAndFetch,
  API_URL,
  selectedProposal,
}) => {
  const isVisible = showInspectionRequest || showInspectionResult || showInspectionRejected || showShippingInstructions;

  const handleBack = () => {
    if (showInspectionRequest) {
      setShowInspectionRequest(false);
    } else if (showInspectionResult) {
      setShowInspectionResult(false);
    } else if (showInspectionRejected) {
      setShowInspectionRejected(false);
    } else if (showShippingInstructions) {
      setShowShippingInstructions(false);
      setShowInspectionRequest(true);
    }
  };

  const getHeaderTitle = () => {
    if (showInspectionRequest) return 'Inspección de Articulo';
    if (showInspectionResult) return 'Resultado de Inspección';
    if (showInspectionRejected) return 'Resultado de Inspección';
    if (showShippingInstructions) return 'Inspección de Articulo';
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

        {/* 1. Inspection Request Section */}
        {showInspectionRequest && (
          <>
            <View style={styles.modalContent}>
              <Image
                source={require('../../../assets/images/tick.png')}
                style={styles.tickImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Tu solicitud fue{"\n"}aceptada, pero{"\n"}debemos inspeccionar.</Text>
              <Text style={styles.modalSubtitle}>
                Ahora necesitamos inspeccionar el artículo para verificar su estado y asegurarnos de que cumpla con los estándares antes de incluirlo en una subasta.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowInspectionRequest(false);
                setShowShippingInstructions(true);
              }}>
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 2. Inspection Result Section */}
        {showInspectionResult && (
          <>
            <View style={styles.modalContent}>
              <Image
                source={require('../../../assets/images/tick.png')}
                style={styles.tickImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Su articulo ha logrado{"\n"}pasar la inspección.</Text>
              <Text style={styles.modalSubtitle}>
                Te invitamos a ver una propuesta con el valor base sugerido y las comisiones correspondientes para su inclusión en la subasta.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowOfferDetails(true);
                requestAnimationFrame(() => setShowInspectionResult(false));
              }}>
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 3. Inspection Rejected Section */}
        {showInspectionRejected && (
          <>
            <View style={styles.modalContent}>
              <Image
                source={require('../../../assets/images/cross.png')}
                style={styles.tickImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Su articulo no ha{"\n"}pasado la inspección,{"\n"}y sera devuelto.</Text>
              <Text style={styles.modalSubtitle}>
                Será devuelto a la dirección indicada junto con el detalle de los motivos correspondientes.
              </Text>

              {selectedProposal?.motivoRechazo ? (
                <View style={[styles.warningCard, { marginTop: 24 }]}>
                  <Text style={styles.warningText}>
                    Motivo: {selectedProposal.motivoRechazo}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.shippingButton} onPress={() => {
                setShowInspectionRejected(false);
              }}>
                <Text style={styles.shippingButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 4. Shipping Instructions Section */}
        {showShippingInstructions && (
          <>
            <ScrollView style={styles.shippingContent} showsVerticalScrollIndicator={false}>
              <View style={styles.mapContainer}>
                <MapComponent
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  addressText={selectedAddress}
                  onAddressChange={setSelectedAddress}
                />
              </View>
              <Text style={styles.shippingTitle}>Envia el articulo a la{"\n"}ubicación indicada{"\n"}para continuar.</Text>
              <Text style={styles.shippingSubtitle}>
                Una vez recibido, continuaremos con la inspección para avanzar con su inclusión en la subasta.
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.shippingButton} onPress={async () => {
                console.log('Ubicación seleccionada:', selectedLocation, 'Dirección:', selectedAddress);
                if (selectedRequestId) {
                  try {
                    const response = await fetch(`${API_URL}/solicitudes-items/${selectedRequestId}/acuerdo-envio`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Autorizacion': loggedInUserId ? String(loggedInUserId) : '',
                      },
                      body: JSON.stringify({
                        aceptaTerminos: true,
                      }),
                    });
                    if (response.ok) {
                      checkUserStatusAndFetch();
                    } else {
                      console.error('Error accepting shipping agreement:', response.statusText);
                    }
                  } catch (err) {
                    console.error('Network error accepting shipping agreement:', err);
                  }
                }
                setShowShippingInstructions(false);
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
  tickImage: {
    width: 80,
    height: 80,
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 18,
    lineHeight: 42,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#717375',
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
  shippingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
    overflow: 'hidden',
  },
  shippingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    lineHeight: 34,
  },
  shippingSubtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    lineHeight: 24,
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
