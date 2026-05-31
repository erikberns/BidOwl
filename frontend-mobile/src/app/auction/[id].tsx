import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTIONS, MOCK_AUCTION_ITEMS } from '@/constants/mockData';

const { width } = Dimensions.get('window');

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams();

  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';
  const auction = MOCK_AUCTIONS.find(a => a.id === auctionIdStr) || MOCK_AUCTIONS[0];
  const items = MOCK_AUCTION_ITEMS[auctionIdStr] || MOCK_AUCTION_ITEMS['1'];

  // Slice first 3 items for the teaser
  const mockItems = items.slice(0, 3).map(item => ({
    id: item.id,
    number: `${item.index}º`,
    title: item.title,
    price: item.basePrice,
  }));

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
            source={require('@/assets/images/rolling_stone_auction.png')} 
            style={styles.heroImage} 
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>1 / 27</Text>
          </View>
        </View>

        {/* Title Block */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{auction.title}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{auction.category.split(' · ')[1] || 'COMÚN'}</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.articlesLink}>{auction.itemCount} Artículos Totales</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.locationDateTime}>
            {auction.location} · <Text style={styles.boldText}>{auction.date}</Text> · <Text style={styles.boldText}>{auction.time}</Text>
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
            <Text style={styles.auctioneerName}>{auction.auctioneer}</Text>
          </View>
          <Image 
            source={auction.auctioneerAvatar} 
            style={styles.avatarImage} 
          />
        </View>

        <View style={styles.divider} />

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionHeading}>Detalles de la Subasta</Text>
          <Text style={styles.detailsText}>
            {auction.description}
          </Text>
          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>Mostrar Más {'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionHeading}>Ubicación de la Subasta</Text>
          <Text style={styles.locationTitle}>Pilar, Buenos Aires, Argentina</Text>
          <Text style={styles.locationText}>Ubicado en Manuel Belgrano 501, Villa Morra.</Text>
        </View>

        <View style={styles.divider} />

        {/* Catalog Section */}
        <View style={styles.catalogSection}>
          <Text style={styles.sectionHeading}>Catalogo de Artículos</Text>
          <Text style={styles.catalogSubheading}>Está conformado por {auction.itemCount} artículos en total.</Text>

          {/* Catalog Items */}
          <View style={styles.catalogItemsList}>
            {mockItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image 
                  source={require('@/assets/images/rolling_stone_auction.png')} 
                  style={styles.itemThumbnail} 
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNumber}>{item.number} Articulo</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPrice}>Valor Base: {item.price}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.fullCatalogButton}
            onPress={() => router.push((`/auction/${id}/catalog`) as any)}
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
          <TouchableOpacity style={styles.liveStreamLink}>
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
