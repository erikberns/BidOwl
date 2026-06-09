import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, Stack, Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from 'expo-router/react-navigation';

import { AuctionCard } from '@/components/AuctionCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { MOCK_AUCTIONS } from '@/constants/mockData';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const isFocused = useIsFocused();
  const [isGuest, setIsGuest] = React.useState(true);
  const [username, setUsername] = React.useState('Invitado');

  React.useEffect(() => {
    if (isFocused) {
      async function loadUser() {
        try {
          const isGuestStr = await AsyncStorage.getItem('isGuest');
          const userStr = await AsyncStorage.getItem('user');
          if (isGuestStr === 'true' || !userStr) {
            setIsGuest(true);
            setUsername('Invitado');
          } else {
            setIsGuest(false);
            const user = JSON.parse(userStr);
            setUsername(user.nombre || 'Usuario');
          }
        } catch (e) {
          setIsGuest(true);
          setUsername('Invitado');
        }
      }
      loadUser();
    }
  }, [isFocused]);

  const filteredAuctions = MOCK_AUCTIONS.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
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
          <Text style={styles.welcomeText}>
            Bienvenido, <Text style={styles.username}>{username}</Text>!
          </Text>
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

        {/* Section 1: Subastas Activas */}
        {filteredAuctions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subastas Activas.</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {filteredAuctions.map(item => (
                <AuctionCard
                  key={`active-${item.id}`}
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
        ) : null}

        {/* Section 2: Subastas a Punto de Comenzar */}
        {filteredAuctions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subastas a Punto de Comenzar.</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {filteredAuctions.map(item => (
                <AuctionCard
                  key={`upcoming-${item.id}`}
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
  username: {
    color: '#BEE757', // Lime yellow from design
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
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#051C2C',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyTextSub: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
  },
  searchSubText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#051C2C',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
});
