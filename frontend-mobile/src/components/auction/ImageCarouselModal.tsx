import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator, StyleSheet } from 'react-native';

interface ImageCarouselModalProps {
  visible: boolean;
  onClose: () => void;
  loading?: boolean;
  images: any[];
  imageIndex: number;
  setImageIndex: (index: number) => void;
  windowWidth: number;
}

export const ImageCarouselModal: React.FC<ImageCarouselModalProps> = ({
  visible,
  onClose,
  loading = false,
  images,
  imageIndex,
  setImageIndex,
  windowWidth,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalCarouselBackdrop}>
        {/* Close button */}
        <TouchableOpacity 
          style={styles.modalCarouselCloseButton} 
          onPress={onClose}
        >
          <Text style={styles.modalCarouselCloseText}>✕</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            {/* Swipeable Horizontal ScrollView */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const offset = event.nativeEvent.contentOffset.x;
                const index = Math.round(offset / windowWidth);
                if (!isNaN(index)) {
                  setImageIndex(Math.max(0, Math.min(index, images.length - 1)));
                }
              }}
              scrollEventThrottle={16}
              style={[styles.modalCarouselScroll, { width: windowWidth }]}
            >
              {images.map((img, index) => (
                <View key={index} style={[styles.modalCarouselSlide, { width: windowWidth }]}>
                  <Image 
                    source={typeof img === 'string' ? { uri: img } : img} 
                    style={[styles.modalCarouselImage, { width: windowWidth * 0.95 }]} 
                    resizeMode="contain" 
                  />
                </View>
              ))}
            </ScrollView>

            {/* Page Indicator */}
            <View style={styles.modalCarouselIndicator}>
              <Text style={styles.modalCarouselIndicatorText}>
                {imageIndex + 1} / {images.length}
              </Text>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalCarouselBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselCloseButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCarouselScroll: {
    flex: 1,
    width: '100%',
  },
  modalCarouselSlide: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselImage: {
    height: '80%',
  },
  modalCarouselIndicator: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalCarouselIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
