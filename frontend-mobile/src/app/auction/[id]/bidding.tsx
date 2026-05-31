import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTION_ITEMS } from '@/constants/mockData';

export default function BiddingScreen() {
  const { id } = useLocalSearchParams();
  
  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';
  const initialItems = MOCK_AUCTION_ITEMS[auctionIdStr] || MOCK_AUCTION_ITEMS['1'];

  // List of items in the collection that the user can cycle through (now inside state)
  const [items, setItems] = useState(initialItems);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex];

  // Bidding Wizard Modal State
  const [bidStep, setBidStep] = useState<'input' | 'confirm' | 'success' | null>(null);
  const [bidValue, setBidValue] = useState('1.200.000');

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(items.length - 1);
    }
  };

  const handleConfirmBid = () => {
    // Dynamically insert the user's bid to the top of the history list
    const updatedItems = [...items];
    updatedItems[currentIndex] = {
      ...currentItem,
      bids: [
        { name: 'Claudio', time: 'Hace unos segundos', amount: `${bidValue} AR$`, isLead: true },
        ...currentItem.bids.map(b => ({ ...b, isLead: false }))
      ]
    };
    setItems(updatedItems);
    setBidStep('success');
  };

  // Get current lead bid
  const leadBid = currentItem.bids.find(b => b.isLead);
  const leadAmount = leadBid ? leadBid.amount : currentItem.basePrice;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={currentItem.image} 
            style={styles.heroImage} 
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>1 / 27</Text>
          </View>
        </View>

        {/* Carousel Cycling Nav Bar */}
        <View style={styles.cycleNavBar}>
          <TouchableOpacity style={styles.cycleArrow} onPress={handlePrev}>
            <SymbolView
              tintColor="#051C2C"
              // @ts-ignore
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles.cycleText}>Lote {currentItem.index} / {items.length}</Text>
          <TouchableOpacity style={styles.cycleArrow} onPress={handleNext}>
            <SymbolView
              tintColor="#051C2C"
              // @ts-ignore
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={24}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Item Info Block */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{currentItem.title}</Text>
          <Text style={styles.basePriceText}>{currentItem.basePrice}</Text>
          <Text style={styles.basePriceLabel}>Valor Base</Text>
        </View>

        <View style={styles.divider} />

        {/* Active Auction Section */}
        <View style={styles.activeAuctionSection}>
          <Text style={styles.activeAuctionTitle}>Subasta Activa</Text>
          
          <View style={styles.timerRow}>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>0</Text>
              <Text style={styles.timerLabel}>Dias</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>
            
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>0</Text>
              <Text style={styles.timerLabel}>Hrs.</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>20</Text>
              <Text style={styles.timerLabel}>Min.</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>51</Text>
              <Text style={styles.timerLabel}>Seg.</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Owner Section */}
        <View style={styles.ownerSection}>
          <View style={styles.ownerTextContainer}>
            <Text style={styles.sectionHeading}>Dueño actual del articulo de subasta</Text>
            <Text style={styles.ownerName}>{currentItem.owner}</Text>
          </View>
          <Image 
            source={require('@/assets/images/auctioneer_avatar.png')} 
            style={styles.avatarImage} 
          />
        </View>

        <View style={styles.divider} />

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionHeading}>Detalles del Articulo</Text>
          <Text style={styles.detailsText}>{currentItem.details}</Text>
          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>Mostrar Más {'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Bidding History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionHeading}>Historial de Pujas</Text>

          <View style={styles.bidsList}>
            {currentItem.bids.map((bid, index) => (
              <View 
                key={index} 
                style={[
                  styles.bidRow, 
                  bid.isLead ? styles.leadBidRow : styles.normalBidRow
                ]}
              >
                <Image 
                  source={require('@/assets/images/auctioneer_avatar.png')} 
                  style={styles.bidderAvatar} 
                />
                <View style={styles.bidderInfo}>
                  <Text style={[styles.bidderName, bid.isLead && styles.leadBidderName]}>{bid.name}</Text>
                  <Text style={styles.bidTime}>{bid.time}</Text>
                </View>
                <View style={styles.bidAmountContainer}>
                  {bid.isLead && <Text style={styles.leadBidLabel}>Puja Lider</Text>}
                  <Text style={[styles.bidAmount, bid.isLead && styles.leadBidAmount]}>{bid.amount}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => router.push({ pathname: `/auction/${id}/history`, params: { itemIndex: currentIndex } } as any)}
          >
            <Text style={styles.historyButtonText}>Mostrar Historial Completo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bidding Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/auction/${id}` as any)}>
          <SymbolView
            tintColor="#fff"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={20}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bidButton} onPress={() => setBidStep('input')}>
          <Text style={styles.bidButtonText}>Pujar</Text>
        </TouchableOpacity>

        <View style={styles.leadPriceInfo}>
          <Text style={styles.leadPriceValue}>{leadAmount}</Text>
          <Text style={styles.leadPriceLabel}>Monto de Puja Lider</Text>
        </View>
      </View>

      {/* Multi-step Bidding Wizard Modal */}
      <Modal
        visible={bidStep !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBidStep(null)}
      >
        <View style={styles.modalBackdrop}>
          {bidStep === 'input' && (
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setBidStep(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Realizar Puja</Text>
                <View style={styles.modalHeaderPlaceholder} />
              </View>

              {/* Body */}
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Ingrese su Monto a Pujar</Text>
                
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={bidValue}
                    onChangeText={setBidValue}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                  <Text style={styles.currencySuffix}>AR$</Text>
                </View>

                <TouchableOpacity 
                  style={styles.modalEnterButton}
                  onPress={() => setBidStep('confirm')}
                >
                  <Text style={styles.modalEnterButtonText}>¡Pujar!</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {bidStep === 'confirm' && (
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setBidStep('input')} style={styles.modalCloseButton}>
                  <SymbolView
                    tintColor="#051C2C"
                    // @ts-ignore
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    size={20}
                  />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Confirmar Puja</Text>
                <View style={styles.modalHeaderPlaceholder} />
              </View>

              {/* Body */}
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>¿Usted desea pujar?</Text>
                <Text style={styles.confirmPrice}>{bidValue} AR$</Text>

                <TouchableOpacity 
                  style={styles.modalEnterButton}
                  onPress={handleConfirmBid}
                >
                  <Text style={styles.modalEnterButtonText}>Deseo Pujar Ese Monto</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {bidStep === 'success' && (
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setBidStep(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Confirmar Puja</Text>
                <View style={styles.modalHeaderPlaceholder} />
              </View>

              {/* Body */}
              <View style={styles.modalBody}>
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
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingBottom: BottomTabInset + 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cycleNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  cycleArrow: {
    padding: 8,
  },
  cycleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'center',
    marginBottom: 8,
  },
  basePriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E9F64', // Green price
    textAlign: 'center',
  },
  basePriceLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 24,
  },
  activeAuctionSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  activeAuctionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E9F64',
    marginBottom: 16,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  timerNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#051C2C',
  },
  timerLabel: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  timerColon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E5E5E5',
    marginHorizontal: 2,
  },
  ownerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  ownerTextContainer: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 6,
  },
  ownerName: {
    fontSize: 15,
    color: '#666',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  detailsSection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 8,
  },
  showMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
    textDecorationLine: 'underline',
  },
  historySection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  bidsList: {
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  leadBidRow: {
    backgroundColor: '#BEE757', // Lime yellow for leading bid
    borderColor: '#BEE757',
  },
  normalBidRow: {
    backgroundColor: '#fff',
    borderColor: '#E5E5E5',
  },
  bidderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  bidderInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
  },
  leadBidderName: {
    color: '#051C2C',
  },
  bidTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  bidAmountContainer: {
    alignItems: 'flex-end',
  },
  leadBidLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 2,
  },
  bidAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#051C2C',
  },
  leadBidAmount: {
    color: '#051C2C',
  },
  historyButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#051C2C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  historyButtonText: {
    color: '#051C2C',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    gap: 12,
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#BA4B4B', // Reddish back button
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#BEE757', // Lime yellow Bid button
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#051C2C',
    fontSize: 15,
    fontWeight: '800',
  },
  leadPriceInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  leadPriceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E9F64', // Green active lead price
  },
  leadPriceLabel: {
    fontSize: 10,
    color: '#051C2C',
    textDecorationLine: 'underline',
    fontWeight: '600',
    marginTop: 2,
  },
  // Modal Styles
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
    backgroundColor: '#BEE757', // Lime yellow
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
});
