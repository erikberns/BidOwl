import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

interface BiddingWizardModalProps {
  visible: boolean;
  bidStep: 'input' | 'confirm' | 'success' | 'error' | null;
  setBidStep: (step: 'input' | 'confirm' | 'success' | 'error' | null) => void;
  minBid: number | null;
  maxBid: number | null;
  bidValue: string;
  handleBidValueChange: (text: string) => void;
  setBidValue: (text: string) => void;
  handleConfirmBid: () => void;
  errorMessage: string | null;
  errorTitle: string | null;
  formatPrice: (value: number | string) => string;
}

export const BiddingWizardModal: React.FC<BiddingWizardModalProps> = ({
  visible,
  bidStep,
  setBidStep,
  minBid,
  maxBid,
  bidValue,
  handleBidValueChange,
  setBidValue,
  handleConfirmBid,
  errorMessage,
  errorTitle,
  formatPrice,
}) => {
  if (!visible || !bidStep) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setBidStep(null)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            {bidStep === 'confirm' ? (
              <TouchableOpacity onPress={() => setBidStep('input')} style={styles.modalCloseButton}>
                <SymbolView
                  tintColor="#051C2C"
                  // @ts-ignore
                  name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                  size={20}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setBidStep(null)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.modalTitle}>
              {bidStep === 'input' && 'Realizar Puja'}
              {bidStep === 'confirm' && 'Confirmar Puja'}
              {bidStep === 'success' && 'Confirmar Puja'}
              {bidStep === 'error' && (errorTitle || 'Error al Ofertar')}
            </Text>
            
            <View style={styles.modalHeaderPlaceholder} />
          </View>

          {/* Body */}
          <View style={styles.modalBody}>
            {bidStep === 'input' && (
              <>
                {minBid !== null && maxBid !== null && (
                  <>
                    <Text style={styles.restrictionsTitle}>Restricción de Categoria</Text>
                    <View style={styles.restrictionsRow}>
                      <TouchableOpacity 
                        style={styles.restrictionBox}
                        activeOpacity={0.7}
                        onPress={() => {
                          const numericValue = Math.round(minBid).toString();
                          const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                          setBidValue(formatted);
                        }}
                      >
                        <Text style={styles.restrictionLabel}>Puja Minima</Text>
                        <Text style={styles.restrictionAmount}>{formatPrice(minBid)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.restrictionBox}
                        activeOpacity={0.7}
                        onPress={() => {
                          const numericValue = Math.round(maxBid).toString();
                          const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                          setBidValue(formatted);
                        }}
                      >
                        <Text style={styles.restrictionLabel}>Puja Maxima</Text>
                        <Text style={styles.restrictionAmount}>{formatPrice(maxBid)}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <Text style={styles.modalLabel}>Ingrese su Monto a Pujar</Text>
                
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, { outlineStyle: 'none' } as any]}
                    value={bidValue}
                    onChangeText={handleBidValueChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#666"
                    underlineColorAndroid="transparent"
                  />
                  <Text style={styles.currencySuffix}>ARS</Text>
                </View>

                <TouchableOpacity 
                  style={styles.modalEnterButton}
                  onPress={() => setBidStep('confirm')}
                >
                  <Text style={styles.modalEnterButtonText}>¡Pujar!</Text>
                </TouchableOpacity>
              </>
            )}

            {bidStep === 'confirm' && (
              <>
                <Text style={styles.modalLabel}>¿Usted desea pujar?</Text>
                <Text style={styles.confirmPrice}>{formatPrice(bidValue)}</Text>

                <TouchableOpacity 
                  style={styles.modalEnterButton}
                  onPress={handleConfirmBid}
                >
                  <Text style={styles.modalEnterButtonText}>Deseo Pujar Ese Monto</Text>
                </TouchableOpacity>
              </>
            )}

            {bidStep === 'success' && (
              <>
                <View style={styles.successIconCircle}>
                  <Text style={styles.successCheckMark}>✓</Text>
                </View>

                <Text style={styles.successText}>Su puja se ha realizado exitosamente.</Text>

                <TouchableOpacity 
                  style={styles.modalEnterButton}
                  onPress={() => setBidStep(null)}
                >
                  <Text style={styles.modalEnterButtonText}>¡Genial!</Text>
                </TouchableOpacity>
              </>
            )}

            {bidStep === 'error' && (
              <>
                <View style={styles.errorIconCircle}>
                  <Text style={styles.errorXMark}>✕</Text>
                </View>

                <Text style={styles.errorModalText}>{errorMessage || 'No se pudo realizar la puja.'}</Text>

                <TouchableOpacity 
                  style={styles.modalErrorCloseButton}
                  onPress={() => setBidStep(null)}
                >
                  <Text style={styles.modalErrorCloseButtonText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  restrictionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A8A8A',
    marginBottom: 12,
  },
  restrictionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  restrictionBox: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    alignItems: 'center',
  },
  restrictionLabel: {
    fontSize: 10,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  restrictionAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#051C2C',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  textInput: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E9F64',
    textAlign: 'center',
    padding: 0,
    marginRight: 6,
  },
  currencySuffix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E9F64',
  },
  confirmPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E9F64',
    marginBottom: 24,
    textAlign: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#2E9F64',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successCheckMark: {
    color: '#2E9F64',
    fontSize: 32,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalEnterButton: {
    backgroundColor: '#BEE757',
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
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorXMark: {
    color: '#D32F2F',
    fontSize: 32,
    fontWeight: 'bold',
  },
  errorModalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  modalErrorCloseButton: {
    backgroundColor: '#051C2C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  modalErrorCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
