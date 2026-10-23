/**
 * Color and styling constants for ImagineStyle
 * Palette: Electric Indigo & Cobalt
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1917',
    textSecondary: '#78716C',
    background: '#F8F7F4',
    backgroundElement: '#EFECE6',
    backgroundSelected: '#E5E1D8',
    card: '#FFFFFF',
    cardBorder: '#E8E4DC',
    primary: '#0066FF',
    primaryHover: '#0052CC',
    primaryGradientStart: '#0066FF',
    primaryGradientEnd: '#0052CC',
    accent: '#0066FF',
    badge: '#EF4444',
    tint: '#1C1917',
    tabIconDefault: '#A8A29E',
    tabIconSelected: '#1C1917',
    border: '#E8E4DC',
  },
  dark: {
    text: '#EBE8E1',
    textSecondary: '#96948E',
    background: '#121214',
    backgroundElement: '#232328',
    backgroundSelected: '#2C2C33',
    card: '#1A1A1E',
    cardBorder: '#292930',
    primary: '#0066FF',
    primaryHover: '#0052CC',
    primaryGradientStart: '#0066FF',
    primaryGradientEnd: '#0052CC',
    accent: '#0066FF',
    badge: '#EF4444',
    tint: '#EBE8E1',
    tabIconDefault: '#63615C',
    tabIconSelected: '#EBE8E1',
    border: '#24242A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    rounded: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 88, android: 72 }) ?? 68;
export const MaxContentWidth = 1120;
