import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, useWindowDimensions, Modal, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTIONS, MOCK_AUCTION_ITEMS } from '@/constants/mockData';
import { API_URL } from '@/constants/api';
import { BiddingWizardModal } from '@/components/auction/BiddingWizardModal';
import { ImageCarouselModal } from '@/components/auction/ImageCarouselModal';

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

const BidderAvatar = ({ idpersona, style }: { idpersona: string | number; style: any }) => {
  const [error, setError] = useState(false);

  if (error || !idpersona) {
    return (
      <Image
        source={require('@/assets/images/auctioneer_avatar.png')}
        style={style}
      />
    );
  }

  return (
    <Image
      source={{ uri: `${API_URL}/personas/${idpersona}/foto` }}
      style={style}
      onError={() => setError(true)}
    />
  );
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

export default function BiddingScreen() {
  const { id } = useLocalSearchParams();
  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [auctionDetail, setAuctionDetail] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Timer Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [auctionState, setAuctionState] = useState<'pending' | 'active' | 'ended'>('pending');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const hasRefetchedAfterStart = React.useRef(false);

  // Bidding Wizard Modal State
  const [bidStep, setBidStep] = useState<'input' | 'confirm' | 'success' | 'error' | null>(null);
  const [bidValue, setBidValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [minBid, setMinBid] = useState<number | null>(null);
  const [maxBid, setMaxBid] = useState<number | null>(null);

  useEffect(() => {
    if (bidStep === null) {
      setErrorTitle(null);
    }
  }, [bidStep]);

  // Real payment methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('1');

  // Lote dynamic timer states
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isBiddingFinished, setIsBiddingFinished] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Gallery Carousel State
  const [itemPhotos, setItemPhotos] = useState<string[]>([]);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [currentPhotosCount, setCurrentPhotosCount] = useState<number>(1);

  const currentItem = items[currentIndex] || {
    id: '',
    productoId: undefined,
    title: 'Cargando lote...',
    basePrice: '$0',
    basePriceNum: 0,
    image: require('@/assets/images/rolling_stone_auction.png'),
    owner: 'Dueño Desconocido',
    duenioId: undefined,
    details: '',
    bids: [],
    index: 1,
    subastado: 'no'
  };

  const handleImagePress = async () => {
    const targetId = currentItem.productoId || currentItem.id;
    if (!targetId) return;
    try {
      setLoadingPhotos(true);
      setIsPhotoModalVisible(true);
      setPhotoIndex(0);

      const res = await fetch(`${API_URL}/productos/${targetId}/fotos`);
      if (res.ok) {
        const urls = await res.json();
        if (urls && urls.length > 0) {
          setItemPhotos(urls.map((u: string) => {
            const baseUrl = API_URL.replace('/api', '');
            return baseUrl + u;
          }));
        } else {
          // Fallback to 6 of the same main photo
          const mainImgUri = getImageUrl(currentItem.image)?.uri || currentItem.image;
          setItemPhotos(Array(6).fill(mainImgUri));
        }
      } else {
        const mainImgUri = getImageUrl(currentItem.image)?.uri || currentItem.image;
        setItemPhotos(Array(6).fill(mainImgUri));
      }
    } catch (e) {
      console.error('[BiddingScreen] Error loading item photos:', e);
      const mainImgUri = getImageUrl(currentItem.image)?.uri || currentItem.image;
      setItemPhotos(Array(6).fill(mainImgUri));
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    async function loadGuestStatus() {
      try {
        const isGuestStr = await AsyncStorage.getItem('isGuest');
        const userStr = await AsyncStorage.getItem('user');
        setIsGuest((isGuestStr === 'true' || isGuestStr === null) && !userStr);
      } catch (error) {
        setIsGuest(true);
      }
    }
    loadGuestStatus();
  }, []);

  useEffect(() => {
    if (!currentItem || !currentItem.id) return;
    const targetId = currentItem.productoId || currentItem.id;
    async function fetchPhotosCount() {
      try {
        const res = await fetch(`${API_URL}/productos/${targetId}/fotos`);
        if (res.ok) {
          const urls = await res.json();
          if (urls && urls.length > 0) {
            setCurrentPhotosCount(urls.length);
            return;
          }
        }
      } catch (e) {
        console.error('[BiddingScreen] Error fetching photos count:', e);
      }
      setCurrentPhotosCount(1);
    }
    fetchPhotosCount();
  }, [currentIndex, currentItem?.id, currentItem?.productoId]);

  useEffect(() => {
    if (isGuest) {
      router.replace('/profile');
    }
  }, [isGuest]);

  useEffect(() => {
    if (isGuest === true) return;

    async function loadAuctionAndItems() {
      try {
        setLoading(true);
        // 1. Fetch subasta details (for time logic)
        const subastaRes = await fetch(`${API_URL}/subastas/${auctionIdStr}?detalle=true`);
        let detailData: any = null;
        if (subastaRes.ok) {
          detailData = await subastaRes.json();
          setAuctionDetail(detailData);
        }

        // 2. Fetch catalog items
        const catalogRes = await fetch(`${API_URL}/subastas/${auctionIdStr}/catalogo`);
        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();

          const mappedItems = catalogData.map((item: any, idx: number) => {
            const basePriceVal = item.valorBase || 100000;
            return {
              id: item.iditem || String(idx),
              productoId: item.productoId,
              index: idx + 1,
              title: item.nombre || `Lote ${idx + 1}`,
              basePrice: formatPrice(basePriceVal),
              basePriceNum: basePriceVal,
              image: item.imagen ? getImageUrl(item.imagen) : require('@/assets/images/rolling_stone_auction.png'),
              owner: item.duenioNombre || 'Dueño Desconocido',
              duenioId: item.duenioId,
              details: item.descripcion || 'Sin descripción detallada.',
              bids: [], // will load dynamically
              subastado: item.subastado
            };
          });

          const activeIdx = mappedItems.findIndex((it: any) => it.subastado !== 'si');
          setCurrentIndex(activeIdx !== -1 ? activeIdx : 0);
          setItems(mappedItems);

          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            const pmRes = await fetch(`${API_URL}/personas/${user.identificador}/metodos-pago`);
            if (pmRes.ok) {
              const pmData = await pmRes.json();
              setPaymentMethods(pmData);
              if (pmData.length > 0) {
                setSelectedPaymentMethodId(String(pmData[0].identificador));
              }
            }
          }
        } else {
          // Fallback to mock catalog
          fallbackMockData();
        }
      } catch (err) {
        console.error('[BiddingScreen] Error loading data:', err);
        fallbackMockData();
      } finally {
        setLoading(false);
      }
    }

    function fallbackMockData() {
      const mock = MOCK_AUCTIONS.find(a => a.id === auctionIdStr) || MOCK_AUCTIONS[0];
      setAuctionDetail({
        fecha: mock.date,
        hora: mock.time,
      });

      const mockItems = MOCK_AUCTION_ITEMS[auctionIdStr] || MOCK_AUCTION_ITEMS['1'];
      const mapped = mockItems.map((item, idx) => ({
        id: item.id,
        index: idx + 1,
        title: item.title,
        basePrice: item.basePrice,
        basePriceNum: parseFloat(item.basePrice.replace(/[^0-9]/g, '')),
        image: item.image,
        owner: item.owner,
        details: item.details,
        bids: item.bids
      }));
      setItems(mapped);
    }

    loadAuctionAndItems();
  }, [auctionIdStr, isGuest, refreshTrigger]);

  // Dynamic Polling for Bids of Current Item
  const fetchBidsForItem = async (itemId: string, indexInState: number) => {
    if (itemId !== currentItem.id) {
      return;
    }
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await fetch(`${API_URL}/subastas/${auctionIdStr}/items/${itemId}/pujas`, {
        headers: {
          'Autorizacion': String(user.identificador)
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedBids = data.map((bid: any, idx: number) => ({
          idpersona: bid.idpersona,
          name: bid.nombre,
          time: (bid.hace && bid.hace !== 'N/A') ? bid.hace : 'Hace unos instantes',
          amount: formatPrice(bid.monto),
          isLead: idx === 0
        }));

        setItems(prevItems => {
          const nextItems = [...prevItems];
          if (nextItems[indexInState]) {
            nextItems[indexInState] = {
              ...nextItems[indexInState],
              bids: mappedBids
            };
          }
          return nextItems;
        });
      }

      // Fetch dynamic item timer and completion status
      const statusRes = await fetch(`${API_URL}/subastas/${auctionIdStr}/items/${itemId}`, {
        headers: {
          'Autorizacion': String(user.identificador)
        }
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSecondsLeft(statusData.segundosRestantes);
        setIsBiddingFinished(statusData.finalizado);
        if (statusData.finalizado) {
          setItems(prevItems => {
            const nextItems = [...prevItems];
            if (nextItems[indexInState] && nextItems[indexInState].subastado !== 'si') {
              nextItems[indexInState] = {
                ...nextItems[indexInState],
                subastado: 'si'
              };
            }
            return nextItems;
          });
        }
      }
    } catch (e) {
      console.error('[BiddingScreen] Error fetching bids for item:', itemId, e);
    }
  };

  useEffect(() => {
    setSecondsLeft(null);
    setIsBiddingFinished(false);
  }, [currentIndex, currentItem?.id]);

  useEffect(() => {
    if (!isFocused) return;
    if (currentItem && currentItem.id) {
      fetchBidsForItem(currentItem.id, currentIndex);
    }
  }, [currentIndex, currentItem?.id, isFocused]);

  useEffect(() => {
    if (!isFocused || !currentItem || !currentItem.id) return;
    const interval = setInterval(() => {
      fetchBidsForItem(currentItem.id, currentIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, currentItem?.id, isFocused]);

  // Local Lote Countdown Timer Effect
  useEffect(() => {
    if (!isFocused || secondsLeft === null || secondsLeft <= 0 || isBiddingFinished) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, isBiddingFinished, isFocused]);

  // Update Countdown Timer
  useEffect(() => {
    if (!isFocused || !auctionDetail || !auctionDetail.fecha) return;

    const startDate = parseAuctionDateTime(auctionDetail.fecha, auctionDetail.hora);
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
            setRefreshTrigger(prev => prev + 1);
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
  }, [auctionDetail, isFocused]);

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

  const handleBidValueChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) {
      setBidValue('');
      return;
    }
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setBidValue(formatted);
  };

  const openBidModal = async () => {
    const isOwner = currentItem.duenioId !== undefined && currentUser && Number(currentItem.duenioId) === Number(currentUser.identificador);
    if (isOwner) {
      setErrorMessage('No puedes pujar por un artículo de tu propiedad.');
      setBidStep('error');
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const limitsRes = await fetch(`${API_URL}/subastas/${auctionIdStr}/items/${currentItem.id}/limites-puja`, {
        headers: {
          'Autorizacion': String(user.identificador)
        }
      });

      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        setMinBid(limitsData.pujaMinima ? Number(limitsData.pujaMinima) : null);
        setMaxBid(limitsData.pujaMaxima ? Number(limitsData.pujaMaxima) : null);

        if (limitsData.pujaMinima) {
          const defaultVal = Math.round(Number(limitsData.pujaMinima)).toString();
          setBidValue(defaultVal.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        } else {
          const currentLeadNum = leadBid ? parseFloat(leadBid.amount.replace(/[^0-9]/g, '')) : currentItem.basePriceNum;
          const defaultVal = String(Math.round(currentLeadNum * 1.05));
          setBidValue(defaultVal.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }
      } else {
        const currentLeadNum = leadBid ? parseFloat(leadBid.amount.replace(/[^0-9]/g, '')) : currentItem.basePriceNum;
        const defaultVal = String(Math.round(currentLeadNum * 1.05));
        setBidValue(defaultVal.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        setMinBid(null);
        setMaxBid(null);
      }
    } catch (e) {
      console.error('[BiddingScreen] Error fetching limits:', e);
      const currentLeadNum = leadBid ? parseFloat(leadBid.amount.replace(/[^0-9]/g, '')) : currentItem.basePriceNum;
      const defaultVal = String(Math.round(currentLeadNum * 1.05));
      setBidValue(defaultVal.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
      setMinBid(null);
      setMaxBid(null);
    }
    setBidStep('input');
  };

  const handleConfirmBid = async () => {
    if (!bidValue || !currentItem) return;
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const numericBid = parseFloat(bidValue.replace(/\./g, ''));

      const response = await fetch(`${API_URL}/subastas/${auctionIdStr}/items/${currentItem.id}/pujas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Autorizacion': String(user.identificador)
        },
        body: JSON.stringify({
          monto: numericBid,
          idMetodoPago: selectedPaymentMethodId
        })
      });

      if (response.ok) {
        await fetchBidsForItem(currentItem.id, currentIndex);
        setBidStep('success');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'No se pudo realizar la puja.');
        setBidStep('error');
      }
    } catch (e) {
      console.error('[BiddingScreen] Error placing bid:', e);
      setErrorMessage('Ocurrió un error al enviar la puja.');
      setBidStep('error');
    }
  };

  const leadBid = currentItem.bids.find((b: any) => b.isLead);
  const leadAmount = leadBid ? leadBid.amount : currentItem.basePrice;
  const isUserLeading = leadBid && currentUser && String(leadBid.idpersona) === String(currentUser.identificador);

  const activeIndex = items.findIndex((it: any) => it.subastado !== 'si');
  const isFutureLot = activeIndex !== -1 && currentIndex > activeIndex;

  const showLeadingAlert = () => {
    setErrorTitle('Estás liderando la puja');
    setErrorMessage('No puedes abandonar la subasta mientras seas el postor líder. Debes esperar a que finalice el minuto o a que otro usuario supere tu oferta.');
    setBidStep('error');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isUserLeading && !isBiddingFinished) {
        e.preventDefault();
        showLeadingAlert();
      }
    });
    return unsubscribe;
  }, [navigation, isUserLeading, isBiddingFinished]);

  if (isGuest === null || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#051C2C" />
        <Text style={styles.loadingText}>Cargando panel de pujas...</Text>
      </SafeAreaView>
    );
  }

  // Timer UI configuration
  let stateTitle = "Subasta Activa";
  let stateColor = "#2E9F64"; // Green

  const isCurrentActive = currentIndex === activeIndex;

  if (auctionState === 'pending') {
    stateTitle = "Próxima Subasta";
    stateColor = "#03161A"; // Orange
  } else if (auctionState === 'ended') {
    stateTitle = "Subasta Finalizada";
    stateColor = "#03161A"; // Gray
  } else if (isCurrentActive && secondsLeft !== null && !isBiddingFinished) {
    stateTitle = "Cierre de Lote Inminente";
    stateColor = "#BA4B4B"; // Red/Orange urgency accent
  } else if (isBiddingFinished) {
    stateTitle = "Lote Vendido";
    stateColor = "#8A8A8A";
  } else if (isFutureLot) {
    if (currentIndex === activeIndex + 1) {
      stateTitle = "Próximo Lote";
    } else {
      stateTitle = "Disponible luego de venta de lote anterior";
    }
    stateColor = "#03161A";
  } else {
    stateTitle = "Subasta Activa";
    stateColor = "#2E9F64";
  }

  const isTimerActive = isCurrentActive && secondsLeft !== null && !isBiddingFinished;
  const displayTimer = isTimerActive ? {
    days: 0,
    hours: 0,
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60
  } : timeLeft;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Image Section */}
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={0.9}
          onPress={handleImagePress}
        >
          <Image
            source={currentItem.image}
            style={styles.heroImage}
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>1 / {currentPhotosCount}</Text>
          </View>
        </TouchableOpacity>

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

        {/* Dynamic Timer Section */}
        <View style={styles.activeAuctionSection}>
          <Text style={[styles.activeAuctionTitle, { color: stateColor }]}>{stateTitle}</Text>

          {isBiddingFinished ? (
            <View style={styles.soldBadgeContainer}>
              <Text style={styles.soldBadgeText}>Artículo Vendido</Text>
            </View>
          ) : isTimerActive ? (
            <View style={styles.timerRow}>
              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{displayTimer.days}</Text>
                <Text style={styles.timerLabel}>Dias</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{displayTimer.hours}</Text>
                <Text style={styles.timerLabel}>Hrs.</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{displayTimer.minutes}</Text>
                <Text style={styles.timerLabel}>Min.</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{displayTimer.seconds}</Text>
                <Text style={styles.timerLabel}>Seg.</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* Owner Section */}
        <View style={styles.ownerSection}>
          <View style={styles.ownerTextContainer}>
            <Text style={styles.sectionHeading}>Dueño actual del articulo de subasta</Text>
            <Text style={styles.ownerName}>{currentItem.owner}</Text>
          </View>
          <BidderAvatar
            idpersona={currentItem.duenioId}
            style={styles.avatarImage}
          />
        </View>

        <View style={styles.divider} />

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionHeading}>Detalles del Articulo</Text>
          <Text style={styles.detailsText}>
            {(() => {
              const text = currentItem.details || '';
              const maxChars = 150;
              if (text.length <= maxChars || isDetailsExpanded) {
                return text;
              }
              return text.substring(0, maxChars) + '...';
            })()}
          </Text>
          {(currentItem.details || '').length > 150 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setIsDetailsExpanded(!isDetailsExpanded)}
            >
              <Text style={styles.showMoreText}>
                {isDetailsExpanded ? 'Mostrar Menos <' : 'Mostrar Más >'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* Bidding History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionHeading}>Historial de Pujas</Text>

          <View style={styles.bidsList}>
            {currentItem.bids.slice(0, 3).map((bid: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.bidRow,
                  bid.isLead ? styles.leadBidRow : styles.normalBidRow
                ]}
              >
                <BidderAvatar
                  idpersona={bid.idpersona}
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
            onPress={() => router.push({ pathname: `/auction/${auctionIdStr}/history`, params: { itemId: currentItem.id, itemTitle: currentItem.title, itemIndex: currentIndex } } as any)}
          >
            <Text style={styles.historyButtonText}>Mostrar Historial Completo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bidding Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isUserLeading && !isBiddingFinished) {
              showLeadingAlert();
            } else {
              router.navigate(`/auction/${auctionIdStr}` as any);
            }
          }}
        >
          <SymbolView
            tintColor="#fff"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={20}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bidButton, (isBiddingFinished || isUserLeading || isFutureLot) && styles.disabledBidButton]}
          disabled={isBiddingFinished || isUserLeading || isFutureLot}
          onPress={openBidModal}
        >
          <Text style={styles.bidButtonText}>
            {isBiddingFinished ? 'Vendido' : isFutureLot ? 'Próximo Lote' : isUserLeading ? 'Liderando' : 'Pujar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.leadPriceInfo}>
          <Text style={styles.leadPriceValue}>{leadAmount}</Text>
          <Text style={styles.leadPriceLabel}>Monto de Puja Lider</Text>
        </View>
      </View>

      {/* Multi-step Bidding Wizard Modal */}
      <BiddingWizardModal
        visible={bidStep !== null}
        bidStep={bidStep}
        setBidStep={setBidStep}
        minBid={minBid}
        maxBid={maxBid}
        bidValue={bidValue}
        handleBidValueChange={handleBidValueChange}
        setBidValue={setBidValue}
        handleConfirmBid={handleConfirmBid}
        errorMessage={errorMessage}
        errorTitle={errorTitle}
        formatPrice={formatPrice}
      />

      {/* Image Viewer / Carousel Modal */}
      <ImageCarouselModal
        visible={isPhotoModalVisible}
        onClose={() => setIsPhotoModalVisible(false)}
        loading={loadingPhotos}
        images={itemPhotos}
        imageIndex={photoIndex}
        setImageIndex={setPhotoIndex}
        windowWidth={windowWidth}
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
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    textAlign: 'left',
    marginBottom: 8,
  },
  basePriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E9F64', // Green price
    textAlign: 'left',
  },
  basePriceLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    textAlign: 'left',
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
    backgroundColor: '#051C2C', // Dark navy back button
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
  disabledBidButton: {
    backgroundColor: '#8A8A8A',
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
  soldBadgeContainer: {
    backgroundColor: '#FFF2F2',
    borderColor: '#FFAEAE',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  soldBadgeText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

});
