import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';

import JoinAuctionBar from '@/components/JoinAuctionBar';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTIONS, MOCK_AUCTION_ITEMS } from '@/constants/mockData';
import { API_URL } from '@/constants/api';

const { width } = Dimensions.get('window');

// Helper to resolve Image URLs
const getImageUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return { uri: path };
  }
  const baseUrl = API_URL.replace('/api', '');
  return { uri: baseUrl + path };
};

// Helper to format prices
const formatPrice = (value: number | string) => {
  if (value === undefined || value === null) return '';
  const num = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return value.toString();
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ARS";
};

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

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams();
  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';

  const [auctionDetail, setAuctionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel Modal State
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Joining and Payment State
  const [hasJoined, setHasJoined] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const paymentMethods = [
    { id: 'pm_1', type: 'card', name: 'VISA **** **** **** 2345' },
    { id: 'pm_2', type: 'bank', name: 'Cuenta Bancaria Galicia' },
  ];
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);

  const confirmPaymentAndJoin = () => {
    setShowPaymentModal(false);
    setHasJoined(true);
  };

  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('1.200.000');
  const [bidError, setBidError] = useState<string | null>(null);

  const handleBidAmountChange = (text: string) => {
    setBidError(null);
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) {
      setBidAmount('');
      return;
    }
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setBidAmount(formatted);
  };

  const handleBidSubmit = () => {
    setBidError(null);
    const numericBid = parseInt(bidAmount.replace(/\./g, ''), 10);
    if (isNaN(numericBid)) {
      setBidError('Por favor ingresa un monto válido.');
      return;
    }

    const category = (auctionDetail?.categoria || 'comun').toLowerCase();
    const isPremium = category === 'oro' || category === 'platino';
    
    const baseValue = auctionDetail?.previsualizacionitems?.[0]?.valorBase || 1000000;
    const currentLeaderBid = 1155000;

    if (!isPremium) {
      const minBid = currentLeaderBid + (baseValue * 0.01);
      const maxBid = currentLeaderBid + (baseValue * 0.20);

      if (numericBid < minBid) {
        setBidError(`La puja debe ser de al menos ${formatPrice(minBid)}`);
        return;
      }
      if (numericBid > maxBid) {
        setBidError(`La puja no puede superar los ${formatPrice(maxBid)}`);
        return;
      }
    } else {
      if (numericBid <= currentLeaderBid) {
        setBidError(`La puja debe superar los ${formatPrice(currentLeaderBid)}`);
        return;
      }
    }

    setShowBidModal(false);
    setBidError(null);
    // TODO: Integración real de pujas
  };

  // Timer Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [auctionState, setAuctionState] = useState<'pending' | 'active' | 'ended'>('pending');

  // Description truncation state
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/subastas/${auctionIdStr}?detalle=true`);
        if (res.ok) {
          const data = await res.json();
          setAuctionDetail(data);
          setError(null);
        } else {
          // Fallback to mock data if not found in backend
          const mock = MOCK_AUCTIONS.find(a => a.id === auctionIdStr) || MOCK_AUCTIONS[0];
          const mockItems = MOCK_AUCTION_ITEMS[mock.id] || MOCK_AUCTION_ITEMS['1'];
          setAuctionDetail({
            id: mock.id,
            titulo: mock.title,
            descripcion: mock.description,
            imagenPortada: null,
            rematador: mock.auctioneer,
            ubicacion: mock.location,
            direccionDetallada: "Ubicado en la dirección indicada por la organización de remates.",
            fecha: mock.date,
            hora: mock.time,
            categoria: mock.category,
            cantidadTotalitems: mock.itemCount,
            previsualizacionitems: mockItems.slice(0, 3).map(item => ({
              iditem: item.id,
              nombre: item.title,
              valorBase: parseFloat(item.basePrice.replace(/[^0-9]/g, '')),
              imagen: null,
              duenioNombre: item.owner,
              descripcion: item.details
            }))
          });
        }
      } catch (err) {
        console.error('[AuctionDetailScreen] Error fetching details:', err);
        // Fallback on network error
        const mock = MOCK_AUCTIONS.find(a => a.id === auctionIdStr) || MOCK_AUCTIONS[0];
        const mockItems = MOCK_AUCTION_ITEMS[mock.id] || MOCK_AUCTION_ITEMS['1'];
        setAuctionDetail({
          id: mock.id,
          titulo: mock.title,
          descripcion: mock.description,
          imagenPortada: null,
          rematador: mock.auctioneer,
          ubicacion: mock.location,
          direccionDetallada: "Ubicado en la dirección indicada por la organización de remates.",
          fecha: mock.date,
          hora: mock.time,
          categoria: mock.category,
          cantidadTotalitems: mock.itemCount,
          previsualizacionitems: mockItems.slice(0, 3).map(item => ({
            iditem: item.id,
            nombre: item.title,
            valorBase: parseFloat(item.basePrice.replace(/[^0-9]/g, '')),
            imagen: null,
            duenioNombre: item.owner,
            descripcion: item.details
          }))
        });
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [auctionIdStr]);

  // Update Countdown Timer
  useEffect(() => {
    if (!auctionDetail || !auctionDetail.fecha) return;

    const startDate = parseAuctionDateTime(auctionDetail.fecha, auctionDetail.hora);
    // Standard duration of 24 hours
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      let targetDate = startDate;
      let state: 'pending' | 'active' | 'ended' = 'pending';

      if (now.getTime() < startDate.getTime()) {
        state = 'pending';
        targetDate = startDate;
      } else if (now.getTime() >= startDate.getTime() && now.getTime() < endDate.getTime()) {
        state = 'active';
        targetDate = endDate;
      } else {
        state = 'ended';
      }

      setAuctionState(state);

      if (state === 'ended') {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auctionDetail]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#051C2C" />
        <Text style={styles.loadingText}>Cargando subasta...</Text>
      </SafeAreaView>
    );
  }

  const detail = auctionDetail || {};
  const previews = detail.previsualizacionitems || [];
  const categoryLabel = (detail.categoria || 'comun').toUpperCase();
  
  const baseValue = previews[0]?.valorBase || 1000000;
  const currentLeaderBid = 1155000;
  
  const isPremium = categoryLabel === 'ORO' || categoryLabel === 'PLATINO';
  const minBid = currentLeaderBid + (baseValue * 0.01);
  const maxBid = currentLeaderBid + (baseValue * 0.20);

  const coverImage = detail.imagenPortada
    ? getImageUrl(detail.imagenPortada)
    : require('@/assets/images/rolling_stone_auction.png');

  // Setup list of images for the carousel (cover + items)
  const collectionImages = [
    coverImage,
    ...previews.map((item: any) => item.imagen ? getImageUrl(item.imagen) : require('@/assets/images/rolling_stone_auction.png'))
  ];

  // Timer UI state configuration
  let stateTitle = "Subasta Activa";
  let stateColor = "#2E9F64"; // Green

  if (auctionState === 'pending') {
    stateTitle = "Próxima Subasta";
    stateColor = "#E79E2E"; // Orange
  } else if (auctionState === 'ended') {
    stateTitle = "Subasta Finalizada";
    stateColor = "#8A8A8A"; // Gray
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <TouchableOpacity 
          style={styles.imageContainer} 
          activeOpacity={0.9}
          onPress={() => {
            setCurrentImageIndex(0);
            setIsCarouselVisible(true);
          }}
        >
          <Image 
            source={coverImage} 
            style={styles.heroImage} 
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>1 / {collectionImages.length}</Text>
          </View>
        </TouchableOpacity>

        {/* Title Block */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{detail.titulo}</Text>
          <Text style={styles.baseValueText}>{formatPrice(baseValue)}</Text>
          <Text style={styles.baseValueLabel}>Valor Base</Text>
        </View>

        <View style={styles.divider} />

        {/* Dynamic Timer Section */}
        <View style={styles.activeAuctionSection}>
          <Text style={[styles.activeAuctionTitle, { color: stateColor }]}>{stateTitle}</Text>
          
          <View style={styles.timerRow}>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{timeLeft.days}</Text>
              <Text style={styles.timerLabel}>Dias</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>
            
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{timeLeft.hours}</Text>
              <Text style={styles.timerLabel}>Hrs.</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{timeLeft.minutes}</Text>
              <Text style={styles.timerLabel}>Min.</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{timeLeft.seconds}</Text>
              <Text style={styles.timerLabel}>Seg.</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Auctioneer Section */}
        <View style={styles.auctioneerSection}>
          <View style={styles.auctioneerTextContainer}>
            <Text style={styles.sectionHeading}>Dueño actual del{'\n'}articulo de subasta</Text>
            <Text style={styles.auctioneerName}>Agustin Blanco Vocos</Text>
          </View>
          <Image 
            source={require('@/assets/images/auctioneer_avatar.png')} 
            style={styles.avatarImage} 
          />
        </View>

        <View style={styles.divider} />

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionHeading}>Detalles de la Subasta</Text>
          <Text style={styles.detailsText}>
            {(() => {
              const text = detail.descripcion || '';
              const maxChars = 150;
              if (text.length <= maxChars || isExpanded) {
                return text;
              }
              return text.substring(0, maxChars) + '...';
            })()}
          </Text>
          {(detail.descripcion || '').length > 150 && (
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={styles.showMoreText}>
                {isExpanded ? 'Mostrar Menos <' : 'Mostrar Más >'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* Dynamic Bidding/Join Section */}
        {hasJoined ? (
          <View style={styles.biddingSection}>
            <Text style={styles.sectionHeading}>Historial de Pujas</Text>
            
            <View style={styles.bidList}>
              {/* Lead Bid */}
              <View style={[styles.bidCard, styles.bidCardLeader]}>
                <View style={styles.bidCardLeft}>
                  <Image source={require('@/assets/images/auctioneer_avatar.png')} style={styles.bidAvatar} />
                  <View>
                    <Text style={styles.bidName}>Erik Berna</Text>
                    <Text style={styles.bidTime}>Hace 4 minutos</Text>
                  </View>
                </View>
                <View style={styles.bidCardRight}>
                  <Text style={styles.bidLeaderLabel}>Puja Lider</Text>
                  <Text style={styles.bidLeaderAmount}>1.155.000 AR$</Text>
                </View>
              </View>

              {/* Other Bids */}
              <View style={styles.bidCard}>
                <View style={styles.bidCardLeft}>
                  <Image source={require('@/assets/images/auctioneer_avatar.png')} style={styles.bidAvatar} />
                  <View>
                    <Text style={styles.bidName}>Erik Berna</Text>
                    <Text style={styles.bidTime}>Hace 4 minutos</Text>
                  </View>
                </View>
                <View style={styles.bidCardRight}>
                  <Text style={styles.bidAmount}>1.155.000 AR$</Text>
                </View>
              </View>
              <View style={styles.bidCard}>
                <View style={styles.bidCardLeft}>
                  <Image source={require('@/assets/images/auctioneer_avatar.png')} style={styles.bidAvatar} />
                  <View>
                    <Text style={styles.bidName}>Erik Berna</Text>
                    <Text style={styles.bidTime}>Hace 4 minutos</Text>
                  </View>
                </View>
                <View style={styles.bidCardRight}>
                  <Text style={styles.bidAmount}>1.155.000 AR$</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.fullHistoryButton}>
              <Text style={styles.fullHistoryButtonText}>Mostrar Historial Completo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.lockSection}>
            <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={48} tintColor="#E5E5E5" />
            <Text style={styles.lockTitle}>Modo Espectador</Text>
            <Text style={styles.lockSubtitle}>
              Debes unirte a la subasta para poder pujar y ver el historial en vivo.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.footerBackButton} onPress={() => router.back()}>
          {/* @ts-ignore */}
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#fff" />
        </TouchableOpacity>
        
        {hasJoined ? (
          <>
            <TouchableOpacity style={styles.footerBidButton} onPress={() => setShowBidModal(true)}>
              <Text style={styles.footerBidButtonText}>Pujar</Text>
            </TouchableOpacity>
            <View style={styles.footerAmountContainer}>
              <Text style={styles.footerAmountText}>{formatPrice(currentLeaderBid)}</Text>
              <Text style={styles.footerAmountLabel}>Monto de Puja Lider</Text>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.footerJoinButton} onPress={() => setShowPaymentModal(true)}>
            <Text style={styles.footerJoinButtonText}>Unirme a la Subasta</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Viewer / Carousel Modal */}
      <Modal
        visible={isCarouselVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCarouselVisible(false)}
      >
        <View style={styles.modalCarouselBackdrop}>
          {/* Close button */}
          <TouchableOpacity 
            style={styles.modalCarouselCloseButton} 
            onPress={() => setIsCarouselVisible(false)}
          >
            <Text style={styles.modalCarouselCloseText}>✕</Text>
          </TouchableOpacity>

          {/* Swipeable Horizontal ScrollView */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slideWidth = event.nativeEvent.layoutMeasurement.width;
              const offset = event.nativeEvent.contentOffset.x;
              const index = Math.round(offset / slideWidth);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
            style={styles.modalCarouselScroll}
          >
            {collectionImages.map((img, index) => (
              <View key={index} style={styles.modalCarouselSlide}>
                <Image 
                  source={img} 
                  style={styles.modalCarouselImage} 
                  resizeMode="contain" 
                />
              </View>
            ))}
          </ScrollView>

          {/* Page Indicator */}
          <View style={styles.modalCarouselIndicator}>
            <Text style={styles.modalCarouselIndicatorText}>
              {currentImageIndex + 1} / {collectionImages.length}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Payment Selection Modal */}
      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Unirse a Subasta</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Seleccione el método{'\n'}de pago a utilizar.</Text>
            <Text style={styles.modalSubtitle}>Este método se usará para procesar tu puja en caso de que ganes la subasta.</Text>
            
            <View style={styles.paymentOptionsContainer}>
              {paymentMethods.map(method => (
                <TouchableOpacity 
                  key={method.id}
                  style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]} 
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <View style={styles.paymentOptionLeft}>
                    {method.type === 'card' && (
                      /* @ts-ignore */
                      <SymbolView name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }} size={24} tintColor="#051C2C" style={styles.paymentIcon} />
                    )}
                    {method.type === 'bank' && (
                      /* @ts-ignore */
                      <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} size={24} tintColor="#051C2C" style={styles.paymentIcon} />
                    )}
                    <Text style={styles.paymentOptionText}>{method.name}</Text>
                  </View>
                  <View style={[styles.radioCircle, selectedPayment === method.id && styles.radioCircleSelected]}>
                    {selectedPayment === method.id && <View style={styles.radioInnerCircle} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={confirmPaymentAndJoin}>
              <Text style={styles.modalButtonText}>Confirmar y Unirse</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bid Modal */}
      <Modal visible={showBidModal} transparent animationType="fade">
        <View style={styles.bidModalBackdrop}>
          <View style={styles.bidModalContent}>
            <View style={styles.bidModalHeader}>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
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
                    <View style={styles.restrictionBox}>
                      <Text style={styles.restrictionLabel}>Puja Minima</Text>
                      <Text style={styles.restrictionAmount}>{formatPrice(minBid)}</Text>
                    </View>
                    <View style={styles.restrictionBox}>
                      <Text style={styles.restrictionLabel}>Puja Maxima</Text>
                      <Text style={styles.restrictionAmount}>{formatPrice(maxBid)}</Text>
                    </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
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
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  baseValueText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E9F64',
    marginBottom: 4,
  },
  baseValueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#051C2C',
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
  auctioneerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  auctioneerTextContainer: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 6,
  },
  auctioneerName: {
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
  biddingSection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  bidList: {
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  bidCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  bidCardLeader: {
    backgroundColor: '#BEE757',
    borderColor: '#BEE757',
  },
  bidCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  bidName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#051C2C',
  },
  bidTime: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  bidCardRight: {
    alignItems: 'flex-end',
  },
  bidLeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 2,
  },
  bidLeaderAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#051C2C',
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#051C2C',
  },
  fullHistoryButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#051C2C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullHistoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#051C2C',
  },
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    gap: 12,
  },
  footerBackButton: {
    backgroundColor: '#BA4A5A',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBidButton: {
    flex: 1,
    backgroundColor: '#BEE757',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBidButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#051C2C',
  },
  footerAmountContainer: {
    alignItems: 'flex-end',
  },
  footerAmountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E9F64',
  },
  footerAmountLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#051C2C',
    textDecorationLine: 'underline',
  },
  footerJoinButton: {
    flex: 1,
    backgroundColor: '#051C2C',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerJoinButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  lockSection: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#051C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 20,
  },
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
    paddingTop: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
    marginBottom: 24,
  },
  paymentOptionsContainer: {
    marginTop: 8,
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
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#BEE757',
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButton: {
    backgroundColor: '#2E8B57', // Matching the other buttons or #BEE757 based on design (using dark green for action here)
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Carousel Modal Styles
  modalCarouselBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselCloseButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCarouselScroll: {
    width: width,
    flex: 1,
  },
  modalCarouselSlide: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselImage: {
    width: width,
    height: '80%',
  },
  modalCarouselIndicator: {
    position: 'absolute',
    bottom: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalCarouselIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Bid Modal Styles
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
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
  },
  bidModalBody: {
    alignItems: 'center',
  },
  bidModalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 16,
  },
  bidModalInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 32,
  },
  bidModalInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E9F64', // green color from the screenshot
    marginRight: 4,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    lineHeight: 34,
    flexShrink: 1,
    minWidth: 40,
  },
  bidModalCurrency: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E9F64',
    includeFontPadding: false,
    lineHeight: 34,
  },
  bidModalSubmitBtn: {
    backgroundColor: '#BEE757', // green from previous
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  bidModalSubmitText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '800',
  },
  bidErrorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 12,
  },
  restrictionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  restrictionBox: {
    flex: 1,
    backgroundColor: '#051C2C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  restrictionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  restrictionAmount: {
    color: '#BEE757', // Lime green
    fontSize: 14,
    fontWeight: '700',
  },
});
