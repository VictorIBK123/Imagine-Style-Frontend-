import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '@/components/ui/modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ActionSheetOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
}

export function ActionSheet({
  visible,
  onClose,
  title,
  subtitle,
  options,
}: ActionSheetProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Modal visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View style={styles.optionsList}>
        {options.map((opt, idx) => {
          const isDestructive = opt.destructive;
          const isLast = idx === options.length - 1;

          return (
            <Pressable
              key={opt.id}
              onPress={() => {
                onClose();
                setTimeout(() => opt.onPress(), 150);
              }}
              style={({ pressed }) => [
                styles.optionRow,
                { borderBottomColor: isLast ? 'transparent' : colors.border },
                pressed && { backgroundColor: colors.backgroundElement, opacity: 0.8 },
              ]}>
              {opt.icon && (
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={isDestructive ? colors.badge : colors.text}
                  style={styles.iconMargin}
                />
              )}
              <Text
                style={[
                  styles.optionLabel,
                  { color: isDestructive ? colors.badge : colors.text },
                ]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconMargin: {
    marginRight: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
