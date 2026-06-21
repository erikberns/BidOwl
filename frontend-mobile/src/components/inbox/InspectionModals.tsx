import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
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
}) => {
  return (
    <>
      {/* Inspection Request Modal */}
      <Modal visible={showInspectionRequest} animationType="none" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectionRequest(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Inspección de Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
            </View>
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
        </SafeAreaView>
      </Modal>

      {/* Inspection Result Modal */}
      <Modal visible={showInspectionResult} animationType="none" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectionResult(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Resultado de Inspección</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
            </View>
            <Text style={styles.modalTitle}>Su articulo ha logrado{"\n"}pasar la inspección.</Text>
            <Text style={styles.modalSubtitle}>
              Te invitamos a ver una propuesta con el valor base sugerido y las comisiones correspondientes para su inclusión en la subasta.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setShowInspectionResult(false);
              setShowOfferDetails(true);
            }}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Inspection Rejected Modal */}
      <Modal visible={showInspectionRejected} animationType="none" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectionRejected(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Resultado de Inspección</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { borderColor: '#D9534F' }]}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={40} tintColor="#D9534F" weight="bold" />
            </View>
            <Text style={styles.modalTitle}>Su articulo no ha{"\n"}pasado la inspección,{"\n"}y sera devuelto.</Text>
            <Text style={styles.modalSubtitle}>
              Será devuelto a la dirección indicada junto con el detalle de los motivos correspondientes.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.shippingButton} onPress={() => {
              setShowInspectionRejected(false);
            }}>
              <Text style={styles.shippingButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Shipping Instructions Modal */}
      <Modal visible={showShippingInstructions} animationType="none" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowShippingInstructions(false);
              setShowInspectionRequest(true);
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Inspección de Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
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
                      'Autorizacion': String(loggedInUserId || 1),
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
        </SafeAreaView>
      </Modal>
    </>
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
});
