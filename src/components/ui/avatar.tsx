import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  isVerified?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({
  uri,
  name,
  size = 'md',
  isVerified = false,
  onPress,
  style,
}: AvatarProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const getDimensions = (): { dim: number; fontSize: number; badgeSize: number; iconSize: number } => {
    switch (size) {
      case 'xs':
        return { dim: 24, fontSize: 10, badgeSize: 10, iconSize: 7 };
      case 'sm':
        return { dim: 32, fontSize: 12, badgeSize: 12, iconSize: 8 };
      case 'lg':
        return { dim: 56, fontSize: 18, badgeSize: 18, iconSize: 12 };
      case 'xl':
        return { dim: 80, fontSize: 24, badgeSize: 22, iconSize: 14 };
      case 'md':
      default:
        return { dim: 40, fontSize: 14, badgeSize: 14, iconSize: 9 };
    }
  };

  const { dim, fontSize, badgeSize, iconSize } = getDimensions();

  const getInitials = (n?: string) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const content = (
    <View style={[styles.wrapper, { width: dim, height: dim }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: colors.backgroundSelected,
            },
          ]}>
          <Text style={[styles.initials, { fontSize, color: colors.text }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {isVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: colors.primary,
              borderColor: colors.card,
            },
          ]}>
          <Ionicons name="checkmark" size={iconSize} color="#FFFFFF" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#374151',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
