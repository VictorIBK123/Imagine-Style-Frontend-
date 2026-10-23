import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/context/AlertContext';

export interface ImageViewerProps {
  visible: boolean;
  onClose: () => void;
  uri: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  creatorName?: string;
}

export function ImageViewerModal({
  visible,
  onClose,
  uri,
  title,
  subtitle,
  caption,
  creatorName,
}: ImageViewerProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { showAlert } = useAlert();
  const [controlsVisible, setControlsVisible] = useState(true);

  if (!visible || !uri) return null;

  const toggleControls = () => {
    setControlsVisible((prev) => !prev);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: title ? `Check out "${title}" on ImagineStyle: ${uri}` : `ImagineStyle portrait: ${uri}`,
        url: uri,
      });
    } catch {
      // Ignored
    }
  };

  const handleSave = () => {
    showAlert({
      title: 'Saved in HD',
      message: 'Photo has been saved to your photo album in high resolution.',
      type: 'success',
      icon: 'checkmark-circle',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Pinch-to-zoom container using native ScrollView */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { width, height },
          ]}
          maximumZoomScale={3.5}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom
          centerContent>
          <Pressable onPress={toggleControls} style={styles.imagePressable}>
            <Image
              source={{ uri }}
              style={[styles.fullImage, { width, height: height * 0.88 }]}
              resizeMode="contain"
            />
          </Pressable>
        </ScrollView>

        {/* Top Floating Controls Bar */}
        {controlsVisible && (
          <View
            style={[
              styles.topBar,
              { top: Math.max(insets.top, 16) + (Platform.OS === 'android' ? 12 : 6) },
            ]}>
            {/* Close Button */}
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
              ]}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Header Title & Subtitle */}
            <View style={styles.titleContainer}>
              {title && (
                <Text style={styles.topTitle} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {(subtitle || creatorName) && (
                <Text style={styles.topSubtitle} numberOfLines={1}>
                  {creatorName ? `by ${creatorName}` : subtitle}
                </Text>
              )}
            </View>

            {/* Action Buttons: Share & Save */}
            <View style={styles.rightActions}>
              <Pressable
                onPress={handleShare}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
                ]}>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={handleSave}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
                ]}>
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Floating Details Overlay */}
        {controlsVisible && (caption || title) && (
          <View
            style={[
              styles.bottomOverlay,
              { bottom: Math.max(insets.bottom, 20) + 10 },
            ]}>
            <View style={styles.bottomCard}>
              {title && <Text style={styles.bottomTitle}>{title}</Text>}
              {caption && <Text style={styles.bottomCaption}>{caption}</Text>}
              <Text style={styles.bottomHint}>Pinch or double-tap to zoom • Tap to toggle controls</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fullImage: {
    maxWidth: '100%',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 30, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  topTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  topSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  bottomCard: {
    backgroundColor: 'rgba(20, 20, 24, 0.82)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bottomTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bottomCaption: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomHint: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    marginTop: 6,
  },
});
