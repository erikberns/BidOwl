// Presenta la confirmacion y resultado visual de una puja.
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

interface AuctionBidModalProps {
  visible: boolean;
  onClose: () => void;
  isPremium: boolean;
  minBid: number;
  maxBid: number;
  bidAmount: string;
  setBidAmount: (val: string) => void;
  bidError: string | null;
  setBidError: (val: string | null) => void;
  handleBidAmountChange: (text: string) => void;
  handleBidSubmit: () => void;
  formatPrice: (value: number | string) => string;
}

export const AuctionBidModal: React.FC<AuctionBidModalProps> = ({
  visible,
  onClose,
  isPremium,
  minBid,
  maxBid,
  bidAmount,
  setBidAmount,
  bidError,
  setBidError,
  handleBidAmountChange,
  handleBidSubmit,
  formatPrice,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.bidModalBackdrop}>
        <View style={styles.bidModalContent}>
          <View style={styles.bidModalHeader}>
            <TouchableOpacity onPress={onClose}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.bidModalTitle}>Realizar Puja</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.bidModalBody}>
            {!isPremium && (
              <>
                <Text style={styles.restrictionsTitle}>Restricción de Categoria</Text>
                <View style={styles.restrictionsRow}>
                  <TouchableOpacity 
                    style={styles.restrictionBox}
                    activeOpacity={0.7}
                    onPress={() => {
                      const numericValue = Math.round(minBid).toString();
                      const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                      setBidAmount(formatted);
                      setBidError(null);
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
                      setBidAmount(formatted);
                      setBidError(null);
                    }}
                  >
                    <Text style={styles.restrictionLabel}>Puja Maxima</Text>
                    <Text style={styles.restrictionAmount}>{formatPrice(maxBid)}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={styles.bidModalLabel}>Ingrese su Monto a Pujar</Text>
            
            <View style={styles.bidModalInputContainer}>
              <TextInput
                style={[styles.bidModalInput, { outlineStyle: 'none' } as any]}
                value={bidAmount}
                onChangeText={handleBidAmountChange}
                keyboardType="numeric"
                underlineColorAndroid="transparent"
                selectionColor="#2E9F64"
                cursorColor="#2E9F64"
              />
              <Text style={styles.bidModalCurrency}>AR$</Text>
            </View>

            {bidError && (
              <Text style={styles.bidErrorText}>{bidError}</Text>
            )}
            
            <TouchableOpacity 
              style={styles.bidModalSubmitBtn} 
              onPress={handleBidSubmit}
            >
              <Text style={styles.bidModalSubmitText}>¡Pujar!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bidModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidModalContent: {
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
  bidModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bidModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
  },
  bidModalBody: {
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
  bidModalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  bidModalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bidModalInput: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E9F64',
    textAlign: 'center',
    padding: 0,
    marginRight: 6,
  },
  bidModalCurrency: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E9F64',
  },
  bidErrorText: {
    color: '#D32F2F',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  bidModalSubmitBtn: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  bidModalSubmitText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '800',
  },
});
