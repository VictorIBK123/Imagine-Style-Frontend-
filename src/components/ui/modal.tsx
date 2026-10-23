import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  presentation?: 'bottomSheet' | 'center';
  maxHeight?: number | string;
  style?: StyleProp<ViewStyle>;
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  presentation = 'bottomSheet',
  style,
}: ModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 768;
  const effectivePresentation = isDesktop ? 'center' : presentation;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={effectivePresentation === 'bottomSheet' ? 'slide' : 'fade'}
      onRequestClose={onClose}>
      <View
        style={[
          styles.backdrop,
          effectivePresentation === 'bottomSheet'
            ? styles.bottomSheetBackdrop
            : styles.centerBackdrop,
        ]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            effectivePresentation === 'bottomSheet'
              ? styles.bottomSheetContent
              : styles.centerContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              maxHeight: height * 0.88,
            },
            style,
          ]}>
          {/* Bottom Sheet Handle */}
          {effectivePresentation === 'bottomSheet' && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handleBar,
                  { backgroundColor: isDark ? '#323238' : '#D6D3CC' },
                ]}
              />
            </View>
          )}

          {/* Header */}
          {Boolean(title || subtitle) && (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.titleArea}>
                {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
                {subtitle && (
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                )}
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.backgroundElement },
                  pressed && { opacity: 0.7 },
                ]}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          )}

          {/* Body Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}>
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheetBackdrop: {
    justifyContent: 'flex-end',
  },
  centerBackdrop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    overflow: 'hidden',
  },
  bottomSheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: 24,
  },
  centerContent: {
    maxWidth: 580,
    borderRadius: 20,
    borderWidth: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    padding: 20,
  },
});
