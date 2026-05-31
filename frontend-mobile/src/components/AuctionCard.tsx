import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';

interface AuctionCardProps {
  title: string;
  image: ImageSourcePropType;
  category: string;
  itemCount: number;
  location: string;
  date: string;
  time: string;
  onPress?: () => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  title,
  image,
  category,
  itemCount,
  location,
  date,
  time,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.cardImage} />
        
        {/* Category Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
        </View>

        {/* Pagination Dots overlay */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.statsText}>{itemCount} Artículos Totales</Text>
        <Text style={styles.statsText}>
          {location} · {date}
        </Text>
        <Text style={styles.statsText}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 280,
    marginRight: 16,
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#BEE757', // Lime yellow
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: '#051C2C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeDot: {
    width: 14,
    backgroundColor: '#BEE757', // Active dot is stretched slightly and lime yellow
  },
  infoContainer: {
    paddingTop: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#051C2C',
    lineHeight: 20,
    marginBottom: 4,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
