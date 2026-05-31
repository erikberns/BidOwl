import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, Stack, Tabs } from 'expo-router';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Tab = 'activos' | 'miSubasta' | 'notificaciones' | 'historial';

export default function InboxScreen() {
  const [activeTab, setActiveTab] = React.useState<Tab>('activos');

  // Mock data for active bids
  const activeBids = [
    {
      id: '1',
      subastaTitle: 'Subasta de Colección Original Rolling Stone',
      image: require('@/assets/images/rolling_stone_auction.png'),
      lote: 1,
      totalLotes: 5,
      articuloTitle: 'Guitarra de Keith Richards',
      miPuja: '$1,000,000 ARS',
      pujaMaxima: '$1,115,000 ARS',
      estado: 'Activa',
    },
    {
      id: '2',
      subastaTitle: 'Subasta de Colección Original Rolling Stone',
      image: require('@/assets/images/rolling_stone_auction.png'),
      lote: 3,
      totalLotes: 5,
      articuloTitle: 'Guitarra de Keith Richards',
      miPuja: '$1,500,000 ARS',
      pujaMaxima: '$1,115,000 ARS',
      estado: 'Ganando',
    },
  ];

  // Mock data for active auctions (user's own auctions)
  const activeAuctions = [
    {
      id: '1',
      subastaTitle: 'Subasta de Colección Original Rolling Stone',
      image: require('@/assets/images/rolling_stone_auction.png'),
      lote: 4,
      totalLotes: 5,
      ubicacion: 'Depósito BidOwl Pilar',
      articuloTitle: 'Guitarra de Keith Richards',
      pujaMaxima: '$1,115,000 ARS',
    },
  ];

  const renderBidCard = (bid: typeof activeBids[0]) => (
    <TouchableOpacity
      key={bid.id}
      style={styles.bidCard}
      onPress={() => router.push(('/auction/' + bid.id) as any)}
    >
      <Image source={bid.image} style={styles.bidImage} />
      <View style={styles.bidContent}>
        <Text style={styles.subastaTitle}>{bid.subastaTitle}</Text>
        <Text style={styles.lote}>Lote {bid.lote} / {bid.totalLotes}</Text>
        <Text style={styles.articuloTitle}>{bid.articuloTitle}</Text>
        <View style={styles.pujaInfo}>
          <Text style={styles.miPujaLabel}>Mi Puja:</Text>
          <Text style={styles.miPujaValue}>{bid.miPuja}</Text>
        </View>
        <View style={styles.pujaMaxInfo}>
          <Text style={styles.pujaMaxLabel}>Puja Máxima:</Text>
          <Text style={styles.pujaMaxValue}>{bid.pujaMaxima}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAuctionCard = (auction: typeof activeAuctions[0]) => (
    <TouchableOpacity
      key={auction.id}
      style={styles.bidCard}
      onPress={() => router.push(('/auction/' + auction.id) as any)}
    >
      <Image source={auction.image} style={styles.bidImage} />
      <View style={styles.bidContent}>
        <Text style={styles.subastaTitle}>{auction.subastaTitle}</Text>
        <Text style={styles.lote}>Lote {auction.lote} / {auction.totalLotes}</Text>
        <Text style={styles.ubicacion}>{auction.ubicacion}</Text>
        <Text style={styles.articuloTitle}>{auction.articuloTitle}</Text>
        <View style={styles.pujaMaxInfo}>
          <Text style={styles.pujaMaxLabel}>Puja Máxima:</Text>
          <Text style={styles.pujaMaxValue}>{auction.pujaMaxima}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Image
            source={require('@/assets/images/SplashBidOwl.png')}
            style={styles.logo}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activos' && styles.tabActive]}
            onPress={() => setActiveTab('activos')}
          >
            <Text style={[styles.tabText, activeTab === 'activos' && styles.tabTextActive]}>
              Activos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'miSubasta' && styles.tabActive]}
            onPress={() => setActiveTab('miSubasta')}
          >
            <Text
              style={[styles.tabText, activeTab === 'miSubasta' && styles.tabTextActive]}
            >
              Mi Subasta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'notificaciones' && styles.tabActive]}
            onPress={() => setActiveTab('notificaciones')}
          >
            <Text
              style={[styles.tabText, activeTab === 'notificaciones' && styles.tabTextActive]}
            >
              Notificaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'historial' && styles.tabActive]}
            onPress={() => setActiveTab('historial')}
          >
            <Text style={[styles.tabText, activeTab === 'historial' && styles.tabTextActive]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'activos' && (
          <View style={styles.contentContainer}>
            {activeBids.length > 0 ? (
              activeBids.map(renderBidCard)
            ) : (
              <View style={styles.emptyState}>
                <SymbolView
                  tintColor="#8A8A8A"
                  // @ts-ignore
                  name={{ ios: 'heart.slash', android: 'favorite_border', web: 'favorite_border' }}
                  size={48}
                />
                <Text style={styles.emptyTitle}>Sin pujas activas</Text>
                <Text style={styles.emptySubtitle}>Comienza a pujar en subastas</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'miSubasta' && (
          <View style={styles.contentContainer}>
            {activeAuctions.length > 0 ? (
              activeAuctions.map(renderAuctionCard)
            ) : (
              <View style={styles.emptyState}>
                <SymbolView
                  tintColor="#8A8A8A"
                  // @ts-ignore
                  name={{ ios: 'gavel', android: 'gavel', web: 'gavel' }}
                  size={48}
                />
                <Text style={styles.emptyTitle}>Sin subastas publicadas</Text>
                <Text style={styles.emptySubtitle}>Publica tu primera subasta</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'notificaciones' && (
          <View style={styles.emptyState}>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' }}
              size={48}
            />
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptySubtitle}>No hay notificaciones en este momento</Text>
          </View>
        )}

        {activeTab === 'historial' && (
          <View style={styles.emptyState}>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'clock', android: 'history', web: 'history' }}
              size={48}
            />
            <Text style={styles.emptyTitle}>Sin historial</Text>
            <Text style={styles.emptySubtitle}>Tu historial de pujas aparecerá aquí</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#051C2C',
  },
  logo: {
    width: 90,
    height: 35,
    resizeMode: 'contain',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#051C2C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  tabTextActive: {
    color: '#051C2C',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#BEE757',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#051C2C',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 12,
  },
  bidCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bidImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  bidContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  subastaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E63946',
    marginBottom: 4,
  },
  lote: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BEE757',
    marginBottom: 2,
  },
  ubicacion: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8A8A',
    marginBottom: 2,
  },
  articuloTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#051C2C',
    marginBottom: 6,
  },
  pujaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  miPujaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  miPujaValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#051C2C',
  },
  pujaMaxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pujaMaxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  pujaMaxValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BEE757',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 8,
    textAlign: 'center',
  },
});
