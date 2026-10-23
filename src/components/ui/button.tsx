import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const getContainerStyle = (): ViewStyle => {
    let bg: string = colors.primary;
    let border: string = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        bg = colors.primary;
        break;
      case 'secondary':
        bg = colors.backgroundElement;
        break;
      case 'outline':
        bg = 'transparent';
        border = colors.cardBorder;
        borderWidth = 1;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
      case 'danger':
        bg = colors.badge;
        break;
    }

    const padding =
      size === 'sm'
        ? { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 }
        : size === 'lg'
        ? { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 14 }
        : { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 11 };

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth,
      ...padding,
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.text;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        getContainerStyle(),
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <>{icon}</> : null}
          {typeof children === 'string' ? (
            <Text
              style={[
                styles.label,
                { color: getTextColor(), fontSize: getFontSize() },
                icon && iconPosition === 'left' ? styles.labelLeftMargin : null,
                icon && iconPosition === 'right' ? styles.labelRightMargin : null,
                textStyle,
              ]}>
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' ? <>{icon}</> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.88,
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
  labelLeftMargin: {
    marginLeft: 6,
  },
  labelRightMargin: {
    marginRight: 6,
  },
});
