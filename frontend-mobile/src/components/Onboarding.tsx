import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const slides = [
  {
    id: 1,
    title: 'Todas las subastas,\nen un solo lugar',
    subtitle: 'Seguí cada puja en vivo y encontrá\noportunidades únicas antes que el resto.',
    buttonText: 'Continuar',
    image: require('@/assets/images/onboarding1.png'),
  },
  {
    id: 2,
    title: 'Publicá lo que tenés,\nnosotros hacemos el resto',
    subtitle: 'Subí tus artículos en minutos y dejá\nque compitan por el mejor precio.',
    buttonText: 'Continuar',
    image: require('@/assets/images/onboarding2.png'),
  },
  {
    id: 3,
    title: 'Cuando llega el momento,\ntu oferta decide',
    subtitle: 'Reaccioná en tiempo real, superá a otros\npostores y quedate con lo que querés.',
    buttonText: 'Comenzar',
    image: require('@/assets/images/onboarding3.png'),
    buttonColor: '#B6E64B', // The greenish-yellow in the screenshot
    buttonTextColor: '#000',
  }
];

interface Props {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width, height } = useWindowDimensions();

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      onComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Saltear</Text>
        </Pressable>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index ? styles.activeDot : null,
                currentSlide === index && index === 2 ? { backgroundColor: '#B6E64B' } : null
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image source={slide.image} style={styles.slideImage} resizeMode="cover" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, slide.buttonColor ? { backgroundColor: slide.buttonColor } : null]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, slide.buttonTextColor ? { color: slide.buttonTextColor } : null]}>
            {slide.buttonText}
          </Text>
        </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#03161A',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 24,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#CAEA7E', // default light green
  },
  imageContainer: {
    flex: 1,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  slideImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'transparent',
    // In React Native without expo-linear-gradient we can't easily do gradients natively 
    // without installing the package, so we can use a soft bottom margin or ignore it for the placeholder
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03161A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'nunito-regular', // El interceptor traducirá esto automáticamente a 'NunitoSans-Regular'
    color: '#717171',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#2E9F64', // Green color from screenshots 1 & 2
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    height: 54,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});