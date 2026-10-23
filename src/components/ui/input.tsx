import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  clearable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  clearable = false,
  containerStyle,
  inputStyle,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [isFocused, setIsFocused] = useState(false);

  const showClear = clearable && Boolean(value && value.length > 0);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: error
              ? colors.badge
              : isFocused
              ? colors.text
              : colors.border,
          },
          props.multiline && styles.multilineContainer,
          props.editable === false && {
            opacity: 0.6,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderColor: colors.border,
          },
          inputStyle,
        ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={props.editable === false ? colors.textSecondary : isFocused ? colors.text : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            { color: props.editable === false ? colors.textSecondary : colors.text },
            props.multiline && styles.multilineInput,
          ]}
          {...props}
        />

        {showClear && (
          <Pressable onPress={() => onChangeText?.('')} style={styles.iconBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}

        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.iconBtn}>
            <Ionicons name={rightIcon} size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {error && <Text style={[styles.errorText, { color: colors.badge }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    minHeight: 88,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  iconBtn: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
