import React from 'react';
import {
  View,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';

import { Colors, MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  hasTabBar?: boolean;
}

export function ScreenContainer({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  hasTabBar,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const isDesktop = Platform.OS === 'web' && width >= 768;

  // Automatically determine if this screen is inside the bottom tab navigator
  const segments = useSegments();
  const isTabScreen = segments.length > 0 && segments[0] === '(tabs)';
  const effectiveHasTabBar = hasTabBar !== undefined ? hasTabBar : isTabScreen;

  // On desktop top header is 64px, so top padding is 80; on mobile use insets.top
  const topPadding = isDesktop ? 80 : insets.top;

  // Tab offset is only needed on screens with a bottom tab bar
  const tabOffset = effectiveHasTabBar ? Math.max(insets.bottom, 12) + 68 : 0;
  const nonTabScrollBottom = isDesktop ? 24 : Math.max(insets.bottom, 16) + 16;
  const bottomPadding = isDesktop
    ? 24
    : effectiveHasTabBar
    ? tabOffset
    : scrollable
    ? nonTabScrollBottom
    : 0;

  const baseContainerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const innerStyle: ViewStyle = {
    flex: scrollable ? undefined : 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: topPadding,
    paddingBottom: bottomPadding,
  };

  if (scrollable) {
    return (
      <View style={[baseContainerStyle, style]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={[innerStyle, contentContainerStyle]}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[baseContainerStyle, style]}>
      <View style={[innerStyle, contentContainerStyle]}>{children}</View>
    </View>
  );
}
