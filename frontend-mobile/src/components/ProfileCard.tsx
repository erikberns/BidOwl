import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing, BrandColors } from '@/constants/theme';

interface ProfileCardProps {
  name: string;
  category: string;
  avatarUrl?: string;
  onEdit?: () => void;
}

export function ProfileCard({ name, category, avatarUrl, onEdit }: ProfileCardProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.name}>
        {name}
      </ThemedText>

      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{category.toUpperCase()}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.description}>
        Las categorías permiten acceso a diferentes
      </ThemedText>
      <ThemedText style={styles.description}>
        niveles de mercados
      </ThemedText>

      <Pressable style={styles.linkButton} onPress={onEdit}>
        <ThemedText style={styles.linkText}>Conocer más</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  avatarContainer: {
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BrandColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  badgeContainer: {
    marginVertical: Spacing.two,
  },
  badge: {
    backgroundColor: BrandColors.accent,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 12,
  },
  badgeText: {
    color: BrandColors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 16,
  },
  linkButton: {
    marginTop: Spacing.one,
  },
  linkText: {
    color: BrandColors.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
