// Muestra y actualiza el historial de pujas del lote seleccionado.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTION_ITEMS } from '@/constants/mockData';
import { API_URL } from '@/constants/api';
import { authHeaders } from '@/services/authSession';
import { connectAuctionRealtime } from '@/services/auctionRealtime';

// Helper to format prices
const formatPrice = (value: number | string, currency: string) => {
  if (value === undefined || value === null) return '';
  let num: number;
  if (typeof value === 'number') {
    num = value;
  } else {
    const clean = value.toString().replace(/\./g, '').replace(/[^0-9-]/g, '');
    num = parseFloat(clean);
  }
  if (isNaN(num)) return value.toString();
  const suffix = currency === 'dolares' ? 'USD' : 'ARS';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ` ${suffix}`;
};

const parseBidDateMs = (value: any): number | null => {
  if (!value) return null;
  const text = String(value).trim().replace(' ', 'T');
  const argentinaTime = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text) && !/(Z|[+-]\d{2}:\d{2})$/.test(text)
    ? `${text}-03:00`
    : text;
  const date = new Date(argentinaTime);
  const ms = date.getTime();
  return Number.isNaN(ms) ? null : ms;
};

const formatRelativeBidTime = (bid: any, _tick: number) => {
  const createdAtMs = bid.createdAtMs ?? parseBidDateMs(bid.fechaHora);
  if (!createdAtMs) {
    return bid.time || 'Hace unos instantes';
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000));
  if (elapsedSeconds < 10) return 'Hace unos instantes';
  if (elapsedSeconds < 60) return `Hace ${elapsedSeconds} segundos`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return elapsedMinutes === 1 ? 'Hace 1 minuto' : `Hace ${elapsedMinutes} minutos`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return elapsedHours === 1 ? 'Hace 1 hora' : `Hace ${elapsedHours} horas`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return elapsedDays === 1 ? 'Hace 1 dia' : `Hace ${elapsedDays} dias`;
};

const BidderAvatar = ({ idpersona, style }: { idpersona: string | number; style: any }) => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cacheKey] = useState(() => `${Date.now()}-${Math.random()}`);
  
  if (failedAttempts >= 2 || !idpersona) {
    return (
      <Image 
        source={require('@/assets/images/auctioneer_avatar.png')} 
        style={style} 
      />
    );
  }

  return (
    <Image 
      source={{ uri: `${API_URL}/personas/${idpersona}/foto?v=${cacheKey}&retry=${failedAttempts}` }}
      style={style}
      onError={() => setFailedAttempts(attempts => attempts + 1)}
    />
  );
};

export default function BidsHistoryScreen() {
  const { id, itemId, itemTitle, itemIndex, moneda } = useLocalSearchParams();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bids, setBids] = useState<any[]>([]);
  const [isBiddingFinished, setIsBiddingFinished] = useState<boolean>(false);
  const [relativeTick, setRelativeTick] = useState(0);

  const selectedIndex = itemIndex ? parseInt(itemIndex as string, 10) : 0;
  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';
  const auctionCurrency = (Array.isArray(moneda) ? moneda[0] : moneda) === 'dolares' ? 'dolares' : 'pesos';
  const mockItems = MOCK_AUCTION_ITEMS[auctionIdStr] || MOCK_AUCTION_ITEMS['1'];
  const currentItem = mockItems[selectedIndex] || mockItems[0];

  const titleToDisplay = (Array.isArray(itemTitle) ? itemTitle[0] : itemTitle) || currentItem.title;

  const leadBid = bids.find(b => b.isLead);
  const leadAmount = leadBid ? leadBid.amount : currentItem.basePrice;

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
    if (isGuest) {
      router.replace('/profile');
    }
  }, [isGuest]);

  const fallbackMock = useCallback(() => {
    const mapped = currentItem.bids.map(b => ({
      name: b.name,
      time: b.time,
      amount: b.amount,
      isLead: b.isLead
    }));
    setBids(mapped);
  }, [currentItem]);

  const fetchBids = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;

      const targetItemId = Array.isArray(itemId) ? itemId[0] : itemId;
      if (!targetItemId) {
        fallbackMock();
        return;
      }

      const requestVersion = Date.now();
      const headers = await authHeaders({
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      });
      const res = await fetch(`${API_URL}/subastas/${auctionIdStr}/items/${targetItemId}/pujas?_=${requestVersion}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        const mappedBids = data.map((bid: any, idx: number) => ({
          idpersona: bid.idpersona,
          name: bid.nombre,
          fechaHora: bid.fechaHora,
          createdAtMs: parseBidDateMs(bid.fechaHora),
          time: (bid.hace && bid.hace !== 'N/A') ? bid.hace : 'Hace unos instantes',
          amount: formatPrice(bid.monto, auctionCurrency),
          isLead: idx === 0
        }));
        setBids(mappedBids);
      } else {
        fallbackMock();
      }

      // Fetch dynamic item timer and completion status
      const statusRes = await fetch(`${API_URL}/subastas/${auctionIdStr}/items/${targetItemId}?_=${requestVersion}`, {
        headers
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setIsBiddingFinished(statusData.finalizado);
      }
    } catch (e) {
      console.error('[BidsHistoryScreen] Error fetching bids:', e);
      fallbackMock();
    }
  }, [auctionCurrency, auctionIdStr, fallbackMock, itemId]);

  useFocusEffect(
    useCallback(() => {
      if (isGuest === true) return undefined;
      let active = true;

      async function refreshOnFocus() {
        setLoading(true);
        await fetchBids();
        if (active) {
          setLoading(false);
        }
      }

      refreshOnFocus();
      return () => {
        active = false;
      };
    }, [fetchBids, isGuest])
  );

  useEffect(() => {
    if (isGuest === true) return;
    const targetItemId = Array.isArray(itemId) ? itemId[0] : itemId;
    if (!targetItemId) return;

    const realtime = connectAuctionRealtime(
      auctionIdStr,
      String(targetItemId),
      () => fetchBids(),
      (message) => console.warn('[BidsHistoryScreen] WebSocket:', message),
    );

    return () => realtime.disconnect();
  }, [auctionIdStr, fetchBids, itemId, isGuest]);

  useEffect(() => {
    const timer = setInterval(() => setRelativeTick(prev => prev + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  if (isGuest === null) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.navigate(`/auction/${auctionIdStr}/bidding` as any)}>
          <Image
            source={require('@/assets/images/Chevron-Left.png')}
            style={styles.backChevron}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Pujas</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Scrollable list of bids */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Historial de Pujas</Text>
        <Text style={styles.sectionSubtitle}>{titleToDisplay}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#051C2C" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.bidsList}>
            {bids.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Sin ofertas aún para este lote.</Text>
            ) : (
              bids.map((bid, index) => (
                <View 
                  key={`${bid.idpersona}-${bid.fechaHora || bid.time}-${bid.amount}-${index}`}
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
                    <Text style={styles.bidderName}>{bid.name}</Text>
                    <Text style={styles.bidTime}>{formatRelativeBidTime(bid, relativeTick)}</Text>
                  </View>
                  <View style={styles.bidAmountContainer}>
                    {bid.isLead && <Text style={styles.leadBidLabel}>Puja Lider</Text>}
                    <Text style={styles.bidAmount}>{bid.amount}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backChevron: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: BottomTabInset + 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  bidsList: {
    gap: 12,
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
    backgroundColor: '#BEE757', // Lime yellow
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
  bottomBackButton: {
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
    backgroundColor: '#BEE757', // Lime yellow
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
});
