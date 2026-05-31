import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing, BrandColors } from '@/constants/theme';

interface Option {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface PersonalOptionsSectionProps {
  options: Option[];
  title?: string;
}

export function PersonalOptionsSection({ 
  options, 
  title = 'Opciones Personales' 
}: PersonalOptionsSectionProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.optionsList}>
        {options.map((option, index) => (
          <Pressable 
            key={option.id}
            style={[
              styles.optionItem,
              index !== options.length - 1 && styles.optionBorder,
            ]}
            onPress={option.onPress}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <ThemedText style={styles.optionLabel}>
                {option.label}
              </ThemedText>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.three,
    paddingVertical: Spacing.two,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.two,
    color: '#000000',
  },
  optionsList: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 18,
    marginRight: Spacing.two,
    width: 24,
    textAlign: 'center',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333333',
  },
  chevron: {
    fontSize: 18,
    color: BrandColors.muted,
    marginLeft: Spacing.one,
  },
});
