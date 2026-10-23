import React, { useEffect, useState } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AlertType = 'info' | 'success' | 'warning' | 'destructive' | 'confirm';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: AlertType;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: AlertButton[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  children?: React.ReactNode;
}

export function AlertModal({
  visible,
  onClose,
  title,
  message,
  type,
  icon,
  buttons,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  destructive,
  children,
}: AlertModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width } = useWindowDimensions();

  const [scaleAnim] = useState(() => new Animated.Value(0.92));
  const [opacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  // Determine effective type
  const effectiveType: AlertType =
    type ||
    (destructive || buttons?.some((b) => b.style === 'destructive')
      ? 'destructive'
      : /success|saved|updated|welcome|added/i.test(title)
      ? 'success'
      : /required|warning|unavailable|permission|cannot/i.test(title)
      ? 'warning'
      : onConfirm || (buttons && buttons.length > 1)
      ? 'confirm'
      : 'info');

  // Badge config based on type
  const getTypeConfig = () => {
    switch (effectiveType) {
      case 'success':
        return {
          icon: icon || ('checkmark-circle' as const),
          color: '#10B981',
          bg: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
          border: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
        };
      case 'destructive':
        return {
          icon: icon || ('alert-circle' as const),
          color: '#EF4444',
          bg: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.12)',
          border: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)',
        };
      case 'warning':
        return {
          icon: icon || ('warning' as const),
          color: '#F59E0B',
          bg: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)',
          border: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
        };
      case 'confirm':
        return {
          icon: icon || ('help-circle' as const),
          color: colors.primary,
          bg: isDark ? 'rgba(0, 102, 255, 0.16)' : 'rgba(0, 102, 255, 0.12)',
          border: isDark ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 102, 255, 0.25)',
        };
      case 'info':
      default:
        return {
          icon: icon || ('information-circle' as const),
          color: colors.primary,
          bg: isDark ? 'rgba(0, 102, 255, 0.16)' : 'rgba(0, 102, 255, 0.12)',
          border: isDark ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 102, 255, 0.25)',
        };
    }
  };

  const typeConfig = getTypeConfig();

  // Resolve action buttons
  let resolvedButtons: AlertButton[] = [];

  if (buttons && buttons.length > 0) {
    resolvedButtons = buttons;
  } else if (onConfirm || confirmText) {
    // Confirmation dialog with Cancel & Confirm
    resolvedButtons = [
      {
        text: cancelText || 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText || (effectiveType === 'destructive' ? 'Confirm' : 'Continue'),
        style: effectiveType === 'destructive' ? 'destructive' : 'primary',
        onPress: onConfirm,
      },
    ];
  } else {
    // Single dismiss button
    const defaultText =
      effectiveType === 'success'
        ? 'Great'
        : effectiveType === 'warning'
        ? 'Understood'
        : 'Got It';
    resolvedButtons = [
      {
        text: confirmText || defaultText,
        style: 'primary',
        onPress: onConfirm,
      },
    ];
  }

  const isTwoButtonsHorizontal =
    resolvedButtons.length === 2 &&
    resolvedButtons[0].text.length < 14 &&
    resolvedButtons[1].text.length < 14;

  const cardMaxWidth = Math.min(width - 32, 420);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Modal Dialog Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              maxWidth: cardMaxWidth,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}>
          {/* Icon Badge */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: typeConfig.bg,
                borderColor: typeConfig.border,
              },
            ]}>
            <Ionicons name={typeConfig.icon} size={30} color={typeConfig.color} />
          </View>

          {/* Title & Message */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {Boolean(message) && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          )}

          {/* Custom Content slot */}
          {children && <View style={styles.customContent}>{children}</View>}

          {/* Buttons Area */}
          <View
            style={[
              styles.buttonsContainer,
              isTwoButtonsHorizontal ? styles.buttonsHorizontal : styles.buttonsVertical,
            ]}>
            {resolvedButtons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const isPrimary = btn.style === 'primary' || (!btn.style && index === resolvedButtons.length - 1);

              let btnBg: string = colors.primary;
              let btnBorder: string = 'transparent';
              let btnTextColor: string = '#FFFFFF';

              if (isCancel) {
                btnBg = colors.backgroundElement;
                btnBorder = colors.border;
                btnTextColor = colors.text;
              } else if (isDestructive) {
                btnBg = '#EF4444';
                btnTextColor = '#FFFFFF';
              } else if (isPrimary) {
                btnBg = colors.primary;
                btnTextColor = '#FFFFFF';
              } else {
                btnBg = colors.backgroundElement;
                btnBorder = colors.border;
                btnTextColor = colors.text;
              }

              return (
                <Pressable
                  key={`${btn.text}-${index}`}
                  onPress={() => {
                    onClose();
                    if (btn.onPress) {
                      setTimeout(() => {
                        btn.onPress?.();
                      }, 100);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    isTwoButtonsHorizontal ? styles.buttonFlex : styles.buttonFull,
                    {
                      backgroundColor: btnBg,
                      borderColor: btnBorder,
                      borderWidth: btnBorder !== 'transparent' ? 1 : 0,
                    },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}>
                  {btn.icon && (
                    <Ionicons
                      name={btn.icon}
                      size={18}
                      color={btnTextColor}
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text style={[styles.buttonText, { color: btnTextColor }]}>{btn.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 16,
  },
  iconWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  customContent: {
    width: '100%',
    marginBottom: 16,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 4,
  },
  buttonsHorizontal: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonsVertical: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    minHeight: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonFull: {
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
