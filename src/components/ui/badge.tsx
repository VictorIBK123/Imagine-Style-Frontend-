import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'official'
  | 'active'
  | 'success';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  children,
  variant = 'default',
  icon,
  onPress,
  style,
  textStyle,
}: BadgeProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
          },
          text: { color: colors.text, fontWeight: '700' },
          iconColor: colors.text,
        };
      case 'active':
        return {
          container: {
            backgroundColor: colors.text,
            borderColor: colors.text,
            borderWidth: 1,
          },
          text: { color: colors.background, fontWeight: '700' },
          iconColor: colors.background,
        };
      case 'official':
        return {
          container: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(28, 25, 23, 0.88)',
            borderWidth: 0,
          },
          text: { color: isDark ? colors.text : '#FFFFFF', fontWeight: '800', letterSpacing: 0.2 },
          iconColor: isDark ? colors.text : '#FFFFFF',
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.cardBorder,
            borderWidth: 1,
          },
          text: { color: colors.textSecondary, fontWeight: '500' },
          iconColor: colors.textSecondary,
        };
      case 'success':
        return {
          container: {
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
            borderColor: '#10B981',
            borderWidth: 1,
          },
          text: { color: '#10B981', fontWeight: '700' },
          iconColor: '#10B981',
        };
      case 'secondary':
      case 'default':
      default:
        return {
          container: {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.cardBorder,
            borderWidth: 1,
          },
          text: { color: colors.textSecondary, fontWeight: '500' },
          iconColor: colors.textSecondary,
        };
    }
  };

  const vStyles = getVariantStyles();

  const content = (
    <>
      {variant === 'official' && !icon && (
        <Ionicons
          name="shield-checkmark"
          size={11}
          color="#FFFFFF"
          style={styles.iconMargin}
        />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={12}
          color={vStyles.iconColor}
          style={styles.iconMargin}
        />
      )}
      {typeof children === 'string' ? (
        <Text style={[styles.text, vStyles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.badge,
          vStyles.container,
          pressed && styles.pressed,
          style,
        ]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.badge, vStyles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 0,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    flexShrink: 0,
  },
  iconMargin: {
    marginRight: 4,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
