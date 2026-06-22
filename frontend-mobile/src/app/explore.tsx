import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, Stack, Tabs } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

import { AuctionCard } from '@/components/auction/AuctionCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { MOCK_AUCTIONS } from '@/constants/mockData';
import { API_URL } from '@/constants/api';

const CATEGORIES = ['COMUN', 'ESPECIAL', 'PLATA', 'ORO', 'PLATINO'];

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

function normalizeCategory(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('COMUN');
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      async function loadAuctions() {
        setLoading(true);
        setError(null);

        try {
          const res = await fetch(`${API_URL}/subastas?pagina=1&limite=100`);

          if (res.ok) {
            const data = await res.json();
            setAuctions(data);
          } else {
            setError('No se pudieron cargar las subastas.');
            setAuctions(MOCK_AUCTIONS);
          }
        } catch (e) {
          console.error('[ExploreScreen] Error loading auctions:', e);
          setError('No se pudo conectar con el servidor.');
          setAuctions(MOCK_AUCTIONS);
        } finally {
          setLoading(false);
        }
      }

      loadAuctions();
    }
  }, [isFocused]);

  const filteredAuctions = auctions.filter(item => {
    const auctionDate = parseAuctionDateTime(item.fecha || item.date, item.hora || item.time);
    const now = new Date();
    const isPast = auctionDate < now;

    if (item.estado === 'finalizada' || item.estado === 'finalizadas') {
      return false;
    }

    if (isPast && item.estado !== 'abierta') {
      return false;
    }

    const query = searchQuery.toLowerCase();
    const titulo = item.titulo || item.title || '';
    const categoria = item.categoria || item.category || '';
    const ubicacion = item.ubicacion || item.location || '';

    const matchesQuery =
      query === '' ||
      titulo.toLowerCase().includes(query) ||
      ubicacion.toLowerCase().includes(query) ||
      normalizeCategory(categoria).includes(query);

    const matchesCategory = normalizeCategory(categoria) === normalizeCategory(selectedCategory);

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
                  {category === 'COMUN' ? 'COMÚN' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nuestras Subastas Section */}
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.loadingText}>Cargando subastas...</Text>
          </View>
        ) : filteredAuctions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nuestras subastas.</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {filteredAuctions.map(item => {
                const imageSource = item.imagenPortada
                  ? { uri: API_URL.replace('/api', '') + item.imagenPortada }
                  : require('@/assets/images/rolling_stone_auction.png');

                return (
                  <AuctionCard
                    key={`auction-${item.id}`}
                    title={item.titulo || item.title}
                    image={imageSource}
                    category={item.categoria || item.category}
                    itemCount={item.cantidaditems !== undefined ? item.cantidaditems : item.itemCount}
                    location={item.ubicacion || item.location}
                    date={item.fecha || item.date}
                    time={item.hora || item.time}
                    onPress={() => router.push(('/auction/' + item.id) as any)}
                  />
                );
              })}
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
            <Text style={styles.emptyTextTitle}>{error ? 'Error al cargar subastas' : 'Sin resultados'}</Text>
            <Text style={styles.emptyTextSub}>
              {error || 'No encontramos subastas que coincidan con tu búsqueda.'}
            </Text>
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
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#051C2C',
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
