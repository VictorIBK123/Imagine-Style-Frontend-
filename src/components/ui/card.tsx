import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export function Card({
  children,
  style,
  onPress,
  padding = 'none',
  bordered = true,
}: CardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const getPadding = (): number => {
    switch (padding) {
      case 'sm':
        return 8;
      case 'md':
        return 14;
      case 'lg':
        return 20;
      case 'none':
      default:
        return 0;
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderColor: bordered ? colors.cardBorder : 'transparent',
    borderWidth: bordered ? 1 : 0,
    borderRadius: 16,
    padding: getPadding(),
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          pressed && styles.pressed,
          style,
        ]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
