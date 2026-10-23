import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card, Badge, Button } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TemplateItem, useApp } from '@/context/AppContext';

export interface TemplateCardProps {
  template: TemplateItem;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { toggleSaveTemplate, openTemplateDetails } = useApp();

  const handleCardPress = () => {
    openTemplateDetails(template.id);
  };

  const handleTryStyle = () => {
    router.push({
      pathname: '/create',
      params: { templateId: template.id, templateName: template.name },
    });
  };

  const creatorName =
    template.creator === 'Official'
      ? 'Official'
      : `@${template.creator.username}`;

  return (
    <Card bordered style={styles.card} onPress={handleCardPress}>
      {/* Thumbnail */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: template.previewUrl }} style={styles.image} />

        {/* Creator / Official Tag */}
        <View style={styles.topBadges}>
          <Badge
            variant={template.isOfficial ? 'official' : 'default'}
            icon={template.isOfficial ? 'shield-checkmark' : 'person'}
            style={styles.creatorBadge}>
            {creatorName}
          </Badge>

          {/* Bookmark Button */}
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              toggleSaveTemplate(template.id);
            }}
            style={styles.bookmarkBtn}>
            <Ionicons
              name={template.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={template.isSaved ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)'}
            />
          </Pressable>
        </View>

        {/* Usage pill on bottom-left of image */}
        <View style={styles.usageOverlay}>
          <Text style={styles.usageText}>
            {(template.usageCount / 1000).toFixed(1)}k uses
          </Text>
        </View>
      </View>

      {/* Details & CTA */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {template.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.category, { color: colors.textSecondary }]}>
            {template.category}
          </Text>
        </View>

        <Button
          size="sm"
          variant="primary"
          icon={<Ionicons name="color-wand-outline" size={13} color="#FFFFFF" />}
          onPress={handleTryStyle}
          style={styles.ctaButton}>
          Try This Style
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#16161A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorBadge: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  usageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 12,
  },
  ctaButton: {
    marginTop: 4,
    borderRadius: 9,
    paddingVertical: 7,
  },
});
