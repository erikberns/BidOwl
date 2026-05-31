import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Stack, Tabs, useRouter } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import PaymentMethodsModal from '@/components/PaymentMethodsModal';

export default function ProfileScreen() {
  const router = useRouter();
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro de que desea cerrar sesión?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Cerrar Sesión',
          onPress: () => {
            Alert.alert('Sesión cerrada', 'Se ha cerrado la sesión correctamente');
          },
          style: 'destructive',
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Perfil</Text>
          <Image 
            source={require('@/assets/images/SplashBidOwl.png')} 
            style={styles.logo} 
          />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatar} />

          {/* User Info */}
          <Text style={styles.userName}>Jose Claudio Godio</Text>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>COMUN</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Las categorías permiten al acceso a diferentes niveles de remates.
          </Text>
          <TouchableOpacity>
            <Text style={styles.learnMore}>Conocer más</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <SymbolView
                tintColor="#BEE757"
                // @ts-ignore
                name={{ ios: 'hand.raised.fill', android: 'pan_tool', web: 'pan_tool' }}
                size={28}
              />
              <Text style={styles.statValue}>55</Text>
              <Text style={styles.statLabel}>Subastas Ganadas</Text>
            </View>

            <View style={styles.statCard}>
              <SymbolView
                tintColor="#BEE757"
                // @ts-ignore
                name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
                size={28}
              />
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Mejor Ganador</Text>
            </View>

            <View style={styles.statCard}>
              <SymbolView
                tintColor="#BEE757"
                // @ts-ignore
                name={{ ios: 'paperclip', android: 'attach_file', web: 'attach_file' }}
                size={28}
              />
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Artículos Publicados</Text>
            </View>

            <View style={styles.statCard}>
              <SymbolView
                tintColor="#BEE757"
                // @ts-ignore
                name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                size={28}
              />
              <Text style={styles.statValue}>102</Text>
              <Text style={styles.statLabel}>Nivel Realizador</Text>
            </View>
          </View>
        </View>

        {/* Personal Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Opciones Personales</Text>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <SymbolView
                tintColor="#8A8A8A"
                // @ts-ignore
                name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
                size={20}
              />
              <Text style={styles.optionText}>Ajustes de Aplicación</Text>
            </View>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => setIsPaymentModalVisible(true)}
          >
            <View style={styles.optionLeft}>
              <SymbolView
                tintColor="#8A8A8A"
                // @ts-ignore
                name={{ ios: 'creditcard.fill', android: 'payment', web: 'payment' }}
                size={20}
              />
              <Text style={styles.optionText}>Ajustar Métodos de Pagos</Text>
            </View>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <SymbolView
                tintColor="#8A8A8A"
                // @ts-ignore
                name={{ ios: 'globe', android: 'language', web: 'language' }}
                size={20}
              />
              <Text style={styles.optionText}>Idioma</Text>
            </View>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <PaymentMethodsModal 
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
      />
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
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#F9F9F9',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 28,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#BEE757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#051C2C',
  },
  description: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  learnMore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BEE757',
    textDecorationLine: 'underline',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
  optionsSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#051C2C',
  },
  logoutButton: {
    backgroundColor: '#E63946',
    marginHorizontal: 24,
    marginBottom: BottomTabInset + 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
