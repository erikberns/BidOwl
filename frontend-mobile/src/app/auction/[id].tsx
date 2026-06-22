import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal, TextInput, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import JoinAuctionBar from '@/components/auction/JoinAuctionBar';
import { ImageCarouselModal } from '@/components/auction/ImageCarouselModal';
import { AuctionPaymentSelectionModal } from '@/components/auction/AuctionPaymentSelectionModal';
import { AuctionBidModal } from '@/components/auction/AuctionBidModal';
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
  let num: number;
  if (typeof value === 'number') {
    num = value;
  } else {
    const clean = value.toString().replace(/\./g, '').replace(/[^0-9-]/g, '');
    num = parseFloat(clean);
  }
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
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();

  const [auctionDetail, setAuctionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel Modal State
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [subastaPhotos, setSubastaPhotos] = useState<any[]>([]);
  const [headerImageIndex, setHeaderImageIndex] = useState(0);

  // Joining and Payment State
  const [hasJoined, setHasJoined] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const paymentMethods = [
    { id: 'pm_1', type: 'card', name: 'VISA **** **** **** 2345' },
    { id: 'pm_2', type: 'bank', name: 'Cuenta Bancaria Galicia' },
  ];
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);

  const confirmPaymentAndJoin = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Alert.alert('Acceso requerido', 'Debes iniciar sesión para unirte a la subasta.');
        return;
      }
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_URL}/subastas/${auctionIdStr}/unirse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Autorizacion': String(user.identificador)
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setHasJoined(true);
        router.push(`/auction/${auctionIdStr}/bidding` as any);
      } else {
        const errorData = await response.json();
        Alert.alert('Error al unirse', errorData.error || 'No se pudo unir a la subasta.');
      }
    } catch (e) {
      console.error('[confirmPaymentAndJoin] Error:', e);
      Alert.alert('Error', 'Ocurrió un error al intentar unirse a la subasta.');
    }
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
  const hasRefetchedAfterStart = React.useRef(false);

  // Description truncation state
  const [isExpanded, setIsExpanded] = useState(false);

  const loadDetail = async () => {
    try {
      if (!auctionDetail) {
        setLoading(true);
      }

      // 1. Fetch guest status and user
      const isGuestStr = await AsyncStorage.getItem('isGuest');
      const userStr = await AsyncStorage.getItem('user');
      const guestVal = (isGuestStr === 'true' || isGuestStr === null) && !userStr;
      setIsGuest(guestVal);

      // 2. Fetch eligibility / joined status if not guest
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          const elegRes = await fetch(`${API_URL}/subastas/${auctionIdStr}/elegibilidad?_=${Date.now()}`, {
            headers: {
              'Autorizacion': String(user.identificador)
            }
          });
          if (elegRes.ok) {
            const elegData = await elegRes.json();
            setHasJoined(!!elegData.yaUnido);
          } else {
            setHasJoined(false);
          }
        } catch (err) {
          console.error('[AuctionDetailScreen] Error checking eligibility:', err);
          setHasJoined(false);
        }
      } else {
        setHasJoined(false);
      }

      // 3. Fetch subasta details
      const res = await fetch(`${API_URL}/subastas/${auctionIdStr}?detalle=true&_=${Date.now()}`);
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

      // 4. Fetch subasta photos
      try {
        const photoRes = await fetch(`${API_URL}/subastas/${auctionIdStr}/fotos?_=${Date.now()}`);
        if (photoRes.ok) {
          const photoUrls = await photoRes.json();
          if (photoUrls && photoUrls.length > 0) {
            setSubastaPhotos(photoUrls);
          } else {
            setSubastaPhotos([]);
          }
        } else {
          setSubastaPhotos([]);
        }
      } catch (err) {
        console.error('[AuctionDetailScreen] Error fetching subasta photos:', err);
        setSubastaPhotos([]);
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
  };

  useEffect(() => {
    if (isFocused) {
      loadDetail();
    }
  }, [auctionIdStr, isFocused]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDetail();
    });
    return unsubscribe;
  }, [navigation, auctionIdStr]);

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

      if (auctionDetail.estado === 'finalizada') {
        state = 'ended';
      } else if (now.getTime() < startDate.getTime()) {
        state = 'pending';
        targetDate = startDate;
        hasRefetchedAfterStart.current = false;
      } else if (now.getTime() >= startDate.getTime() && now.getTime() < endDate.getTime()) {
        if (auctionDetail.estado === 'carrada' || auctionDetail.estado === 'cerrada') {
          if (!hasRefetchedAfterStart.current) {
            hasRefetchedAfterStart.current = true;
            loadDetail();
            state = 'active';
            targetDate = endDate;
          } else {
            state = 'ended';
          }
        } else {
          state = 'active';
          targetDate = endDate;
        }
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

  // Setup list of images for the carousel
  const collectionImages = subastaPhotos.length > 0
    ? subastaPhotos.map((p: string) => getImageUrl(p))
    : [coverImage];

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
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
            </View>
            <Text style={styles.itemCountText}>{detail.cantidadTotalitems || previews.length} Articulos Totales</Text>
          </View>
          <Text style={styles.dateTimeText}>{detail.ubicacion || 'Pilar'} · {detail.fecha || '15/4/2026'} · {detail.hora || '18:30 UDT-3'}</Text>
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
            <Text style={styles.sectionHeading}>Esta subasta sera{'\n'}rematada por</Text>
            <Text style={styles.auctioneerName}>{detail.rematador || 'Agustin Blanco Vocos'}</Text>
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

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionHeading}>Ubicación de la Subasta</Text>
          <Text style={styles.locationTitle}>{detail.ubicacion || 'Pilar, Buenos Aires, Argentina'}</Text>
          <Text style={styles.locationSubtitle}>{detail.direccionDetallada || 'Ubicado en Manuel Belgrano 501, Villa Morra.'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Catalog Section */}
        <View style={styles.catalogSection}>
          <Text style={styles.sectionHeading}>Catalogo de Artículos</Text>
          <Text style={styles.catalogSubtitle}>Está conformado por {detail.cantidadTotalitems || previews.length} artículos en total.</Text>
          
          <View style={styles.itemsList}>
            {previews.slice(0, 3).map((item: any, idx: number) => {
              const itemImageSource = item.imagen
                ? getImageUrl(item.imagen)
                : require('@/assets/images/rolling_stone_auction.png');
              return (
                <View key={item.iditem || idx} style={styles.itemCard}>
                  <Image 
                    source={itemImageSource} 
                    style={styles.itemThumbnail} 
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNumber}>{idx + 1}º Articulo</Text>
                    <Text style={styles.itemTitle}>{item.nombre}</Text>
                    {!isGuest && (
                      <Text style={styles.itemPrice}>Valor Base: {formatPrice(item.valorBase)}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.fullCatalogButton}
            onPress={() => router.push(`/auction/${auctionIdStr}/catalog` as any)}
          >
            <Text style={styles.fullCatalogButtonText}>Mostrar el Catalogo Entero</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.liveStreamLink}
            onPress={() => {
              if (hasJoined) {
                router.push(`/auction/${auctionIdStr}/bidding` as any);
              } else {
                if (isGuest) {
                  Alert.alert(
                    'Acceso requerido',
                    'Debes iniciar sesión para entrar a la subasta.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Ir a perfil', onPress: () => router.push('/profile') },
                    ]
                  );
                } else {
                  setShowPaymentModal(true);
                }
              }
            }}
          >
            {/* @ts-ignore */}
            <SymbolView name={{ ios: 'tv.fill', android: 'live_tv', web: 'tv' }} size={20} tintColor="#051C2C" style={styles.liveStreamIcon} />
            <Text style={styles.liveStreamText}>Mira la subasta en vivo y en directo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <JoinAuctionBar
        auctionId={auctionIdStr}
        onBack={() => router.back()}
        isActive={auctionState === 'active'}
      />

      {/* Image Viewer / Carousel Modal */}
      <ImageCarouselModal
        visible={isCarouselVisible}
        onClose={() => setIsCarouselVisible(false)}
        images={collectionImages}
        imageIndex={currentImageIndex}
        setImageIndex={setCurrentImageIndex}
        windowWidth={windowWidth}
      />

      {/* Payment Selection Modal */}
      <AuctionPaymentSelectionModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMethods={paymentMethods}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        confirmPaymentAndJoin={confirmPaymentAndJoin}
      />

      {/* Bid Modal */}
      <AuctionBidModal
        visible={showBidModal}
        onClose={() => setShowBidModal(false)}
        isPremium={isPremium}
        minBid={minBid}
        maxBid={maxBid}
        bidAmount={bidAmount}
        setBidAmount={setBidAmount}
        bidError={bidError}
        setBidError={setBidError}
        handleBidAmountChange={handleBidAmountChange}
        handleBidSubmit={handleBidSubmit}
        formatPrice={formatPrice}
      />
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
    backgroundColor: '#051C2C',
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
    backgroundColor: '#BEE757',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerJoinButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#051C2C',
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

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  categoryBadge: {
    backgroundColor: '#BEE757', // Lime yellow
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#051C2C',
    fontSize: 10,
    fontWeight: '800',
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#051C2C',
    textDecorationLine: 'underline',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 12,
  },
  locationSection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 8,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  catalogSection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  catalogSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  itemThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E9F64',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  fullCatalogButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#051C2C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
  },
  fullCatalogButtonText: {
    color: '#051C2C',
    fontSize: 14,
    fontWeight: '700',
  },
  liveStreamLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  liveStreamIcon: {
    marginRight: 4,
  },
  liveStreamText: {
    color: '#051C2C',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

