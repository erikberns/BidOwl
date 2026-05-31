import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, Stack, Tabs } from 'expo-router';

import { AuctionCard } from '@/components/AuctionCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const CATEGORIES = ['COMÚN', 'ESPECIAL', 'PLATA', 'ORO', 'PLATINO'];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('COMÚN');

  // Static mock data for visual demonstration
  const mockAuctions = [
    {
      id: '1',
      title: 'Subasta de Colección Original Rolling Stone',
      image: require('@/assets/images/rolling_stone_auction.png'),
      category: 'COMÚN',
      itemCount: 5,
      location: 'Pilar',
      date: '15 / 4 / 2026',
      time: '18:30 UDT-3',
    },
    {
      id: '2',
      title: 'Colección Vintage Guitarras Gibson & Fender',
      image: require('@/assets/images/rolling_stone_auction.png'),
      category: 'ESPECIAL',
      itemCount: 8,
      location: 'San Isidro',
      date: '18 / 4 / 2026',
      time: '20:00 UDT-3',
    },
    {
      id: '3',
      title: 'Colección de Monedas Raras del Siglo XIX',
      image: require('@/assets/images/rolling_stone_auction.png'),
      category: 'PLATA',
      itemCount: 12,
      location: 'La Plata',
      date: '20 / 4 / 2026',
      time: '19:00 UDT-3',
    },
    {
      id: '4',
      title: 'Joyas de Oro Antiguas - Herencia Familiar',
      image: require('@/assets/images/rolling_stone_auction.png'),
      category: 'ORO',
      itemCount: 15,
      location: 'Recoleta',
      date: '22 / 4 / 2026',
      time: '17:30 UDT-3',
    },
    {
      id: '5',
      title: 'Colección Platino - Piezas Exclusivas',
      image: require('@/assets/images/rolling_stone_auction.png'),
      category: 'PLATINO',
      itemCount: 6,
      location: 'Puerto Madero',
      date: '25 / 4 / 2026',
      time: '21:00 UDT-3',
    },
  ];

  const filteredAuctions = mockAuctions.filter(item => {
    const matchesQuery = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = item.category === selectedCategory;
    
    return matchesQuery && matchesCategory;
  });

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
          <Text style={styles.welcomeText}>Descubre</Text>
          <Image 
            source={require('@/assets/images/SplashBidOwl.png')} 
            style={styles.logo} 
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <View style={styles.searchIconBox}>
            <SymbolView
              tintColor="#666"
              // @ts-ignore
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={20}
            />
          </View>
          <View style={styles.searchTextContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="¿Qué estarías buscando hoy?"
              placeholderTextColor="#8A8A8A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery === '' && (
              <Text style={styles.searchSubText}>Colecciones · Artículos · Ubicaciones</Text>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === category && styles.filterTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nuestras Subastas Section */}
        {filteredAuctions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nuestras subastas.</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {filteredAuctions.map(item => (
                <AuctionCard
                  key={`auction-${item.id}`}
                  title={item.title}
                  image={item.image}
                  category={item.category}
                  itemCount={item.itemCount}
                  location={item.location}
                  date={item.date}
                  time={item.time}
                  onPress={() => router.push(('/auction/' + item.id) as any)}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'magnifyingglass.circle', android: 'search', web: 'search' }}
              size={48}
            />
            <Text style={styles.emptyTextTitle}>Sin resultados</Text>
            <Text style={styles.emptyTextSub}>No encontramos subastas que coincidan con tu búsqueda.</Text>
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
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#051C2C',
  },
  logo: {
    width: 90,
    height: 35,
    resizeMode: 'contain',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconBox: {
    marginRight: 14,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchInput: {
    fontSize: 15,
    fontWeight: '700',
    color: '#051C2C',
    padding: 0,
  },
  searchSubText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  filterContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  filterContent: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#BEE757',
    borderColor: '#BEE757',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#051C2C',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 12,
  },
  horizontalScrollContent: {
    paddingRight: 24,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 16,
  },
  emptyTextSub: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 8,
    textAlign: 'center',
  },
});
