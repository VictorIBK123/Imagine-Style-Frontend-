import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logger } from '@/utils/logger';

export interface CreateActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGenerate: () => void;
  onSelectCreateTemplate: () => void;
}

export function CreateActionModal({
  visible,
  onClose,
  onSelectGenerate,
  onSelectCreateTemplate,
}: CreateActionModalProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const isDesktop = Platform.OS === 'web' && width >= 768;

  // Clean, subtle enter animation
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  const handleGenerate = () => {
    logger.action('create_action_modal_select', { option: 'generate_ai_photo' });
    onClose();
    onSelectGenerate();
  };

  const handleCreateTemplate = () => {
    logger.action('create_action_modal_select', { option: 'create_template' });
    onClose();
    onSelectCreateTemplate();
  };

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalCard,
            isDesktop
              ? styles.desktopCard
              : [
                  styles.mobileCard,
                  {
                    bottom: Math.max(insets.bottom, 8) + 64,
                  },
                ],
            {
              backgroundColor: isDark ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
            animatedStyle,
          ]}>
          {/* Compact Header (No subtitle) */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create</Text>
            <Pressable
              hitSlop={8}
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
              ]}>
              <Ionicons name="close" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {/* Option 1: Generate AI Photo (Camera Icon, no Popular badge) */}
            <Pressable
              onPress={handleGenerate}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}>
              <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Generate AI Photo</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Transform portraits with templates
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            {/* Option 2: Create Template (No Creator badge) */}
            <Pressable
              onPress={handleCreateTemplate}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}>
              <View style={[styles.iconBox, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="color-wand" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Create Template</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Design & publish a style
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Pointer Caret for mobile */}
          {!isDesktop && (
            <View
              style={[
                styles.pointerArrow,
                {
                  borderTopColor: isDark ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                },
              ]}
            />
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 12,
  },
  mobileCard: {
    position: 'absolute',
    alignSelf: 'center',
    width: 290,
    maxWidth: '88%',
  },
  desktopCard: {
    width: 320,
    alignSelf: 'center',
  },
  pointerArrow: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 1,
  },
});
