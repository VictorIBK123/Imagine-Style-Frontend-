import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Modal, Button, Badge, Avatar } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export function TemplateDetailModal() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    selectedTemplateDetail,
    closeTemplateDetails,
    toggleSaveTemplate,
    openImageViewer,
  } = useApp();

  if (!selectedTemplateDetail) return null;

  const template = selectedTemplateDetail;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Try out the "${template.name}" AI style on ImagineStyle!`,
      });
    } catch {
      // Ignored
    }
  };

  const handleTryStyle = () => {
    closeTemplateDetails();
    router.push({
      pathname: '/create',
      params: { templateId: template.id, templateName: template.name },
    });
  };

  const creatorName =
    template.creator === 'Official'
      ? 'ImagineStyle Official'
      : `@${template.creator.username}`;

  const creatorAvatar =
    template.creator === 'Official' ? undefined : template.creator.avatar;

  return (
    <Modal
      visible={Boolean(selectedTemplateDetail)}
      onClose={closeTemplateDetails}
      title={template.name}
      subtitle={template.category}>
      <View style={styles.container}>
        {/* Main Preview Image with Fullscreen Action */}
        <Pressable
          onPress={() =>
            openImageViewer({
              uri: template.previewUrl,
              title: template.name,
              subtitle: `${template.category} Style`,
              creatorName,
            })
          }
          style={styles.imageWrapper}>
          <Image source={{ uri: template.previewUrl }} style={styles.previewImage} />

          {/* Floating Actions on Preview */}
          <View style={styles.floatingTopActions}>
            <Badge
              variant={template.isOfficial ? 'official' : 'default'}
              icon={template.isOfficial ? 'shield-checkmark' : 'person'}>
              {template.isOfficial ? 'Official' : creatorName}
            </Badge>

            <Pressable
              onPress={() => toggleSaveTemplate(template.id)}
              style={styles.circleActionBtn}>
              <Ionicons
                name={template.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={template.isSaved ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)'}
              />
            </Pressable>
          </View>
        </Pressable>

        {/* Creator & Metadata Row */}
        <View style={[styles.metaCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.creatorRow}>
            <Avatar
              uri={creatorAvatar}
              name={creatorName}
              size="md"
              isVerified={template.isOfficial || (typeof template.creator !== 'string' && template.creator.isVerified)}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.creatorLabel, { color: colors.textSecondary }]}>
                Style Creator
              </Text>
              <Text style={[styles.creatorTitle, { color: colors.text }]}>
                {creatorName}
              </Text>
            </View>
            <View style={styles.usagePill}>
              <Ionicons name="flame-outline" size={14} color={colors.text} style={{ marginRight: 4, opacity: 0.8 }} />
              <Text style={[styles.usageText, { color: colors.text }]}>
                {(template.usageCount / 1000).toFixed(1)}k uses
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Style</Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {template.description}
          </Text>
        </View>

        {/* Prompt Guidance */}
        {template.promptGuidance && (
          <View style={[styles.guidanceBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <View style={styles.guidanceHeader}>
              <Ionicons name="bulb-outline" size={16} color={colors.text} />
              <Text style={[styles.guidanceTitle, { color: colors.text }]}>
                Aesthetic Recipe & Settings
              </Text>
            </View>
            <Text style={[styles.guidanceContent, { color: colors.text }]}>
              {template.promptGuidance}
            </Text>
          </View>
        )}

        {/* Public Results Created With This Template */}
        {template.communityResults && template.communityResults.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Community Results
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Portraits generated by other users with this style
            </Text>

            <View style={styles.communityGrid}>
              {template.communityResults.map((imgUri, idx) => (
                <View key={idx} style={styles.communityThumbWrapper}>
                  <Image source={{ uri: imgUri }} style={styles.communityThumb} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionFooter}>
          <Button
            variant="outline"
            icon={<Ionicons name="share-social-outline" size={18} color={colors.text} />}
            onPress={handleShare}
            style={styles.shareBtn}>
            Share
          </Button>

          <Button
            variant="primary"
            icon={<Ionicons name="color-wand-outline" size={18} color="#FFFFFF" />}
            onPress={handleTryStyle}
            style={styles.tryBtn}>
            Try This Style
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#16161A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  floatingTopActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCard: {
    padding: 12,
    borderRadius: 14,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  creatorTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  usagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  usageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  guidanceBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guidanceTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  guidanceContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  communityGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  communityThumbWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#16161A',
  },
  communityThumb: {
    width: '100%',
    height: '100%',
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  shareBtn: {
    flex: 1,
  },
  tryBtn: {
    flex: 2,
  },
});
