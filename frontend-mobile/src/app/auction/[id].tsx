import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTIONS, MOCK_AUCTION_ITEMS } from '@/constants/mockData';
import { API_URL } from '@/constants/api';

const { width } = Dimensions.get('window');

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams();
  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';

  const [auctionDetail, setAuctionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            imagenPortada: null, // will fallback to mock image
            rematador: mock.auctioneer,
            ubicacion: mock.location,
            fecha: mock.date,
            hora: mock.time,
            categoria: mock.category,
            cantidadTotalitems: mock.itemCount,
            previsualizacionitems: mockItems.slice(0, 3).map(item => ({
              iditem: item.id,
              nombre: item.title,
              valorBase: parseFloat(item.basePrice.replace(/[^0-9]/g, '')),
              imagen: null,
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
          fecha: mock.date,
          hora: mock.time,
          categoria: mock.category,
          cantidadTotalitems: mock.itemCount,
          previsualizacionitems: mockItems.slice(0, 3).map(item => ({
            iditem: item.id,
            nombre: item.title,
            valorBase: parseFloat(item.basePrice.replace(/[^0-9]/g, '')),
            imagen: null,
          }))
        });
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [auctionIdStr]);

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

  const heroImageSource = detail.imagenPortada
    ? { uri: API_URL.replace('/api', '') + detail.imagenPortada }
    : require('@/assets/images/rolling_stone_auction.png');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      {/* Floating Back Button */}
      <TouchableOpacity 
        style={styles.floatingBackButton} 
        onPress={() => router.back()}
      >
        <SymbolView
          tintColor="#fff"
          // @ts-ignore
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
          size={24}
        />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={heroImageSource} 
            style={styles.heroImage} 
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>1 / {previews.length || 1}</Text>
          </View>
        </View>

        {/* Title Block */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{detail.titulo}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/auction/${auctionIdStr}/catalog` as any)}>
              <Text style={styles.articlesLink}>{detail.cantidadTotalitems} Artículos Totales</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.locationDateTime}>
            {detail.ubicacion} · <Text style={styles.boldText}>{detail.fecha}</Text> · <Text style={styles.boldText}>{detail.hora}</Text>
          </Text>
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
              <Text style={styles.timerNumber}>2</Text>
              <Text style={styles.timerLabel}>Hrs.</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>33</Text>
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

        {/* Auctioneer Section */}
        <View style={styles.auctioneerSection}>
          <View style={styles.auctioneerTextContainer}>
            <Text style={styles.sectionHeading}>Esta subasta sera rematada por</Text>
            <Text style={styles.auctioneerName}>{detail.rematador}</Text>
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
            {detail.descripcion}
          </Text>
          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>Mostrar Más {'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionHeading}>Ubicación de la Subasta</Text>
          <Text style={styles.locationTitle}>{detail.ubicacion}</Text>
          <Text style={styles.locationText}>Ubicado en la dirección indicada por la organización de remates.</Text>
        </View>

        <View style={styles.divider} />

        {/* Catalog Section */}
        <View style={styles.catalogSection}>
          <Text style={styles.sectionHeading}>Catalogo de Artículos</Text>
          <Text style={styles.catalogSubheading}>Está conformado por {detail.cantidadTotalitems} artículos en total.</Text>

          {/* Catalog Items */}
          <View style={styles.catalogItemsList}>
            {previews.map((item: any, idx: number) => {
              const itemImageSource = item.imagen
                ? { uri: API_URL.replace('/api', '') + item.imagen }
                : require('@/assets/images/rolling_stone_auction.png');
              return (
                <View key={item.iditem} style={styles.itemCard}>
                  <Image 
                    source={itemImageSource} 
                    style={styles.itemThumbnail} 
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNumber}>{idx + 1}º Articulo</Text>
                    <Text style={styles.itemTitle}>{item.nombre}</Text>
                    <Text style={styles.itemPrice}>Valor Base: ${item.valorBase}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.fullCatalogButton}
            onPress={() => router.push((`/auction/${auctionIdStr}/catalog`) as any)}
          >
            <Text style={styles.fullCatalogButtonText}>Mostrar el Catalogo Entero</Text>
          </TouchableOpacity>
        </View>

        {/* Live Stream Footer Link */}
        <View style={styles.footerSection}>
          <SymbolView
            tintColor="#051C2C"
            // @ts-ignore
            name={{ ios: 'play.tv', android: 'live_tv', web: 'tv' }}
            size={18}
          />
          <TouchableOpacity style={styles.liveStreamLink} onPress={() => router.push(`/auction/${auctionIdStr}/catalog` as any)}>
            <Text style={styles.liveStreamText}>Mira la subasta en vivo y en directo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  floatingBackButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    lineHeight: 32,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#BEE757', // Lime yellow
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#051C2C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  articlesLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E9F64', // Green clickable color
    textDecorationLine: 'underline',
  },
  locationDateTime: {
    fontSize: 14,
    color: '#666',
  },
  boldText: {
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
  locationSection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 10,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  catalogSection: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  catalogSubheading: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  catalogItemsList: {
    gap: 12,
    marginBottom: 20,
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
    backgroundColor: '#fff',
  },
  fullCatalogButtonText: {
    color: '#051C2C',
    fontSize: 14,
    fontWeight: '700',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginHorizontal: 24,
  },
  liveStreamLink: {},
  liveStreamText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
    textDecorationLine: 'underline',
  },
});
