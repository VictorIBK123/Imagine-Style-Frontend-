import React from 'react';
import { Image, ImageStyle } from 'expo-image';
import { StyleProp } from 'react-native';

export interface GoogleIconProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function GoogleIcon({ size = 18, style }: GoogleIconProps) {
  return (
    <Image
      source={require('@/assets/images/google-icon.png')}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      transition={100}
    />
  );
}
