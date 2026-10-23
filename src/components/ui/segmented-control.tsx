import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number | string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'pill' | 'underline';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  style,
  variant = 'pill',
}: SegmentedControlProps<T>) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  if (variant === 'underline') {
    return (
      <View style={[styles.underlineContainer, { borderBottomColor: colors.border }, style]}>
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[
                styles.underlineTab,
                isSelected && { borderBottomColor: colors.text, borderBottomWidth: 2 },
              ]}>
              {opt.icon && (
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={isSelected ? colors.text : colors.textSecondary}
                  style={[styles.iconMargin, { opacity: isSelected ? 1 : 0.6 }]}
                />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                    opacity: isSelected ? 1 : 0.6,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}>
                {opt.label}
              </Text>
              {opt.badge !== undefined && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)'
                        : 'transparent',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.countBadgeText,
                      { color: isSelected ? colors.text : colors.textSecondary },
                    ]}>
                    {opt.badge}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Pill variant
  return (
    <View
      style={[
        styles.pillContainer,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.cardBorder,
        },
        style,
      ]}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.pillTab,
              isSelected && {
                backgroundColor: colors.card,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.35 : 0.07,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}>
            {opt.icon && (
              <Ionicons
                name={opt.icon}
                size={15}
                color={isSelected ? colors.text : colors.textSecondary}
                style={[styles.iconMargin, { opacity: isSelected ? 1 : 0.65 }]}
              />
            )}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isSelected ? colors.text : colors.textSecondary,
                  opacity: isSelected ? 1 : 0.65,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
  },
  pillTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  underlineContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  underlineTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
  },
  iconMargin: {
    marginRight: 6,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
