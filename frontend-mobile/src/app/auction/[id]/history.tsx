import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams, Stack, Tabs } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { MOCK_AUCTION_ITEMS } from '@/constants/mockData';

export default function BidsHistoryScreen() {
  const { id, itemIndex } = useLocalSearchParams();
  const selectedIndex = itemIndex ? parseInt(itemIndex as string, 10) : 0;

  const auctionIdStr = Array.isArray(id) ? id[0] : id || '1';
  const mockItems = MOCK_AUCTION_ITEMS[auctionIdStr] || MOCK_AUCTION_ITEMS['1'];

  const currentItem = mockItems[selectedIndex] || mockItems[0];
  const leadBid = currentItem.bids.find(b => b.isLead);
  const leadAmount = leadBid ? leadBid.amount : currentItem.basePrice;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/auction/${id}/bidding` as any)}>
          <SymbolView
            tintColor="#051C2C"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={22}
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
        <Text style={styles.sectionSubtitle}>{currentItem.title}</Text>

        <View style={styles.bidsList}>
          {currentItem.bids.map((bid, index) => (
            <View 
              key={index} 
              style={[
                styles.bidRow, 
                bid.isLead ? styles.leadBidRow : styles.normalBidRow
              ]}
            >
              <Image 
                source={require('@/assets/images/auctioneer_avatar.png')} 
                style={styles.bidderAvatar} 
              />
              <View style={styles.bidderInfo}>
                <Text style={styles.bidderName}>{bid.name}</Text>
                <Text style={styles.bidTime}>{bid.time}</Text>
              </View>
              <View style={styles.bidAmountContainer}>
                {bid.isLead && <Text style={styles.leadBidLabel}>Puja Lider</Text>}
                <Text style={styles.bidAmount}>{bid.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bidding Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBackButton} onPress={() => router.push(`/auction/${id}/bidding` as any)}>
          <SymbolView
            tintColor="#fff"
            // @ts-ignore
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={20}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bidButton}>
          <Text style={styles.bidButtonText}>Pujar</Text>
        </TouchableOpacity>

        <View style={styles.leadPriceInfo}>
          <Text style={styles.leadPriceValue}>{leadAmount}</Text>
          <Text style={styles.leadPriceLabel}>Puja Lider</Text>
        </View>
      </View>
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
    backgroundColor: '#BA4B4B', // Reddish back button
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
