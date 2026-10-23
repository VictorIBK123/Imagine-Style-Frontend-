import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export interface AppLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
  rounded?: boolean;
}

export function AppLogo({ size = 24, style, rounded = true }: AppLogoProps) {
  return (
    <Image
      source={require('@/assets/images/app-logo.png')}
      style={[
        {
          width: size,
          height: size,
          borderRadius: rounded ? Math.round(size * 0.22) : 0,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}
