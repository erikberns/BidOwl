import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

interface AuctionCardProps {
    title: string;
    image: ImageSourcePropType;
    category: string;
    itemCount: number;
    location: string;
    date: string;
    time: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
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
    style,
}) => {
    const imageKey =
        typeof image === 'object' && image !== null && 'uri' in image
            ? String(image.uri)
            : undefined;

    return (
        <TouchableOpacity style={[styles.cardContainer, style]} activeOpacity={0.9} onPress={onPress}>
            <View style={styles.imageWrapper}>
                <Image key={imageKey} source={image} style={styles.cardImage} />

                {/* Category Badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
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
        width: 305,
        marginRight: 16,
        marginBottom: 8,
    },
    imageWrapper: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    cardImage: {
        width: '100%',
        height: 320,
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
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    infoContainer: {
        paddingTop: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#051C2C',
        lineHeight: 20,
        marginBottom: 4,
    },
    statsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});
