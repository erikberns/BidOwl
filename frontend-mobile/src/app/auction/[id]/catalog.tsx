import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';
import JoinAuctionBar from '@/components/JoinAuctionBar';
import { MOCK_AUCTION_ITEMS } from '@/constants/mockData';
import { API_URL } from '@/constants/api';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';

export default function CatalogScreen() {
  const { id } = useLocalSearchParams();
  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch(`${API_URL}/subastas/${id}/catalogo`);
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (e) {
        console.error('[CatalogScreen] Error fetching catalog:', e);
      }
    }
    loadItems();
  }, [id]);

  const mockItems = items.map((item, idx) => ({
    id: item.iditem || item.id || String(idx),
    number: `${idx + 1}º`,
    title: item.nombre || item.title,
    price: item.valorBase !== undefined ? `${item.valorBase} ARS` : item.basePrice,
    imagen: item.imagen,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/auction/${id}` as any)}>
          <SymbolView
            tintColor="#051C2C"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={22}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catálogo Entero</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Main Content (Scrollable) */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Catalogo de Artículos</Text>
        <Text style={styles.sectionSubtitle}>Está conformado por {mockItems.length} artículos en total.</Text>

        {/* Item Cards List */}
        <View style={styles.itemsList}>
          {mockItems.map((item) => {
            const itemImageSource = item.imagen
              ? { uri: API_URL.replace('/api', '') + item.imagen }
              : require('@/assets/images/rolling_stone_auction.png');
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image 
                  source={itemImageSource} 
                  style={styles.itemThumbnail} 
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNumber}>{item.number} Articulo</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPrice}>Valor Base: {item.price}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <JoinAuctionBar
        auctionId={id as string}
        onBack={() => router.push(`/auction/${id}` as any)}
      />
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
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
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
  }
});
