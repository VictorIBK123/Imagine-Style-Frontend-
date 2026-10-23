import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/useAppStore';
import { AppLogo } from '@/components/ui';
import { CreateActionModal } from './CreateActionModal';

export interface TabRoute {
  key: string;
  name: string;
}

export interface CustomTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<string, { options: { title?: string } }>;
  navigateToTab?: (routeKey: string) => void;
  navigation?: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
  emitter?: {
    emit: (event: any) => any;
  };
}

interface TabItemConfig {
  name: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  isAction?: boolean;
  badgeCount?: number;
}

const TAB_CONFIGS: TabItemConfig[] = [
  {
    name: 'index',
    label: 'Home',
    iconName: 'home-outline',
    iconActive: 'home',
    isAction: false,
    badgeCount: 0,
  },
  {
    name: 'templates',
    label: 'Templates',
    iconName: 'grid-outline',
    iconActive: 'grid',
    isAction: false,
    badgeCount: 0,
  },
  {
    name: 'create',
    label: 'Create',
    iconName: 'add',
    iconActive: 'add',
    isAction: true,
    badgeCount: 0,
  },
  {
    name: 'notifications',
    label: 'Alerts',
    iconName: 'notifications-outline',
    iconActive: 'notifications',
    isAction: false,
    badgeCount: 3,
  },
  {
    name: 'profile',
    label: 'Profile',
    iconName: 'person-outline',
    iconActive: 'person',
    isAction: false,
    badgeCount: 0,
  },
];

const DEFAULT_CONFIG: TabItemConfig = {
  name: '',
  label: '',
  iconName: 'ellipse-outline',
  iconActive: 'ellipse',
  isAction: false,
  badgeCount: 0,
};

export function CustomTabBar({ state, descriptors, navigation, navigateToTab, emitter }: CustomTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const isDesktop = Platform.OS === 'web' && width >= 768;
  const unreadNotificationsCount = useAppStore((s) =>
    s.notifications.filter((n) => !n.isRead).length
  );

  const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);

  const handleSelectGenerate = () => {
    router.push('/(tabs)/templates');
  };

  const handleSelectCreateTemplate = () => {
    router.push({
      pathname: '/(tabs)/create',
      params: { mode: 'createTemplate' },
    });
  };

  const handleTabPress = (route: TabRoute, isFocused: boolean) => {
    emitter?.emit?.({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    navigation?.emit?.({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused) {
      if (navigateToTab) {
        navigateToTab(route.key);
      } else if (navigation) {
        navigation.navigate(route.name);
      } else {
        const path = route.name === 'index' ? '/' : `/${route.name}`;
        router.push(path as any);
      }
    }
  };

  if (isDesktop) {
    // Desktop Responsive Top Navigation
    return (
      <View
        style={[
          styles.desktopHeader,
          {
            backgroundColor: isDark ? 'rgba(18, 18, 20, 0.95)' : 'rgba(248, 247, 244, 0.96)',
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.desktopInner}>
          {/* Brand Logo & Name */}
          <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [styles.brandContainer, pressed && { opacity: 0.8 }]}>
            <AppLogo size={32} />
            <Text style={[styles.brandTitle, { color: colors.text }]}>ImagineStyle</Text>
          </Pressable>

          {/* Desktop Nav Items */}
          <View style={styles.desktopNavGroup}>
            {state.routes.map((route: TabRoute, index: number) => {
              const isFocused = state.index === index;
              const config: TabItemConfig = TAB_CONFIGS.find((c) => c.name === route.name) || {
                ...DEFAULT_CONFIG,
                name: route.name,
                label: route.name,
              };

              const badgeCount =
                route.name === 'notifications'
                  ? unreadNotificationsCount
                  : config.badgeCount || 0;

              const onPress = () => handleTabPress(route, isFocused);

              if (config.isAction) {
                return (
                  <Pressable
                    key={route.key}
                    onPress={() => setIsCreateModalVisible(true)}
                    style={({ pressed }) => [
                      styles.desktopCreateBtn,
                      { backgroundColor: colors.text },
                      pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    ]}>
                    <Ionicons name="add" size={18} color={colors.background} style={{ marginRight: 4 }} />
                    <Text style={[styles.desktopCreateBtnText, { color: colors.background }]}>Create</Text>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={({ pressed }) => [
                    styles.desktopNavItem,
                    isFocused && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <View style={styles.iconWithBadge}>
                    <Ionicons
                      name={isFocused ? config.iconActive : config.iconName}
                      size={18}
                      color={isFocused ? colors.text : colors.textSecondary}
                      style={{ opacity: isFocused ? 1 : 0.6 }}
                    />
                    {badgeCount > 0 && (
                      <View style={[styles.desktopBadge, { backgroundColor: colors.badge }]}>
                        <Text style={styles.badgeText}>{badgeCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.desktopNavLabel,
                      {
                        color: isFocused ? colors.text : colors.textSecondary,
                        opacity: isFocused ? 1 : 0.6,
                        fontWeight: isFocused ? '700' : '500',
                      },
                    ]}>
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <CreateActionModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onSelectGenerate={handleSelectGenerate}
          onSelectCreateTemplate={handleSelectCreateTemplate}
        />
      </View>
    );
  }

  // Mobile Bottom Navigation Bar
  return (
    <View
      style={[
        styles.bottomBarWrapper,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: isDark ? 'rgba(18, 18, 20, 0.96)' : 'rgba(248, 247, 244, 0.96)',
          borderTopColor: colors.border,
        },
      ]}>
      <View style={styles.bottomBarContainer}>
        {state.routes.map((route: TabRoute, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config: TabItemConfig = TAB_CONFIGS.find((c) => c.name === route.name) || {
            ...DEFAULT_CONFIG,
            name: route.name,
            label: options.title || route.name,
          };

          const badgeCount =
            route.name === 'notifications'
              ? unreadNotificationsCount
              : config.badgeCount || 0;

          const onPress = () => handleTabPress(route, isFocused);

          if (config.isAction) {
            // Emphasised Center "Create" CTA
            return (
              <View key={route.key} style={styles.centerActionWrapper}>
                <Pressable
                  onPress={() => setIsCreateModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Create AI Portrait or Template"
                  style={({ pressed }) => [
                    styles.centerActionButton,
                    {
                      backgroundColor: colors.text,
                      shadowColor: '#000000',
                    },
                    pressed && { transform: [{ scale: 0.94 }] },
                  ]}>
                  <Ionicons name="add" size={28} color={colors.background} />
                </Pressable>
                <Text
                  style={[
                    styles.tabLabel,
                    styles.createLabel,
                    { color: isFocused ? colors.text : colors.textSecondary, opacity: isFocused ? 1 : 0.6 },
                  ]}>
                  Create
                </Text>
              </View>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={({ pressed }) => [styles.tabButton, pressed && { opacity: 0.75 }]}>
              <View style={styles.iconWithBadge}>
                <Ionicons
                  name={isFocused ? config.iconActive : config.iconName}
                  size={24}
                  color={isFocused ? colors.text : colors.tabIconDefault}
                  style={{ opacity: isFocused ? 1 : 0.55 }}
                />
                {badgeCount > 0 && (
                  <View style={[styles.mobileBadge, { backgroundColor: colors.badge }]}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.text : colors.textSecondary,
                    opacity: isFocused ? 1 : 0.55,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <CreateActionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSelectGenerate={handleSelectGenerate}
        onSelectCreateTemplate={handleSelectCreateTemplate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop Header Styles
  desktopHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  desktopInner: {
    width: '100%',
    maxWidth: 1180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  desktopNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  desktopNavLabel: {
    fontSize: 14,
  },
  desktopCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginLeft: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  desktopCreateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Mobile Bottom Bar Styles
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    zIndex: 100,
    elevation: 10,
  },
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 52,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  createLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  iconWithBadge: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  desktopBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  centerActionWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -12,
  },
  centerActionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
