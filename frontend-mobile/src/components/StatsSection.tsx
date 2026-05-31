import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

interface Stat {
  value: number;
  label: string;
  icon?: string;
}

interface StatsSectionProps {
  stats: Stat[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        Estadísticas
      </ThemedText>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            {stat.icon && (
              <ThemedText style={styles.statIcon}>{stat.icon}</ThemedText>
            )}
            <ThemedText style={styles.statValue}>
              {stat.value}
            </ThemedText>
            <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
    marginVertical: Spacing.three,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.two,
    color: '#000000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: Spacing.half,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.half,
    color: '#000000',
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    color: '#666666',
    lineHeight: 14,
  },
});
