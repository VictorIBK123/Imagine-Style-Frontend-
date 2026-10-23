import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button, Card, Badge, Modal, Input, AppLogo } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { logger } from '@/utils/logger';

export default function GenerationResultScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const {
    photoId,
    photoUri,
    originalUri,
    templateId,
    templateName,
    aspectRatio = '4:5',
    styleStrength = 'Balanced',
    resolution = '2K',
    additionalPrompt,
  } = useLocalSearchParams<{
    photoId?: string;
    photoUri?: string;
    originalUri?: string;
    templateId?: string;
    templateName?: string;
    aspectRatio?: '4:5' | '1:1' | '9:16';
    styleStrength?: 'Natural' | 'Balanced' | 'Intense';
    resolution?: '0.5K' | '1K' | '2K' | '4K';
    additionalPrompt?: string;
  }>();

  const {
    generatedPhotos,
    templates,
    publishPost,
    showAlert,
    openImageViewer,
    openTemplateDetails,
  } = useApp();

  // Find canonical photo from vault if exists
  const vaultPhoto = photoId ? generatedPhotos.find((p) => p.id === photoId) : null;
  const activeResultUri =
    vaultPhoto?.uri ||
    photoUri ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';
  const activeOriginalUri = originalUri || null;
  const activeTemplateName = vaultPhoto?.templateName || templateName || 'Studio Aesthetic';
  const activeRatio = vaultPhoto?.aspectRatio || aspectRatio || '4:5';
  const activeStrength = vaultPhoto?.styleStrength || styleStrength || 'Balanced';
  const activeResolution = vaultPhoto?.resolution || resolution || '2K';
  const activeCustomPrompt = vaultPhoto?.additionalPrompt || additionalPrompt || '';

  const matchedTemplate = templateId
    ? templates.find((t) => t.id === templateId)
    : templates.find((t) => t.name.toLowerCase() === activeTemplateName.toLowerCase());

  // Interactive Before / After toggle
  const [showOriginal, setShowOriginal] = useState(false);

  // Publishing Modal states
  const [isPublishModalVisible, setIsPublishModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasPublished, setHasPublished] = useState(vaultPhoto?.isPublished || false);

  const displayedImageUri = showOriginal && activeOriginalUri ? activeOriginalUri : activeResultUri;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/create');
    }
  };

  const handleDownloadHD = () => {
    logger.action('Export Portrait to Photos Library', { resolution: activeResolution });
    showAlert({
      title: 'Saved to Photos',
      message: `Your studio portrait has been exported in ${activeResolution} resolution to your device photo library.`,
      type: 'success',
      icon: 'checkmark-circle',
    });
  };

  const handlePublish = () => {
    if (!activeResultUri) return;
    logger.action('Publishing Generated Photo to Community Feed', { templateName: activeTemplateName, uri: activeResultUri });
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);
      setIsPublishModalVisible(false);
      setHasPublished(true);

      const defaultCaption = activeCustomPrompt
        ? `${activeCustomPrompt} ✨ (${activeTemplateName})`
        : `Generated with ${activeTemplateName} on ImagineStyle ✨`;

      publishPost(activeResultUri, caption.trim() || defaultCaption, templateId || undefined);

      showAlert({
        title: 'Masterpiece Published!',
        message: 'Your portrait is now live on the public community feed. Other creators can discover and like it.',
        type: 'success',
        icon: 'checkmark-circle',
        buttons: [
          {
            text: 'View in Feed',
            onPress: () => router.replace('/(tabs)'),
          },
          {
            text: 'Awesome',
            style: 'default',
          },
        ],
      });
    }, 600);
  };

  const numericAspectRatio =
    activeRatio === '1:1' ? 1 : activeRatio === '9:16' ? 9 / 16 : 4 / 5;

  return (
    <ScreenContainer scrollable hasTabBar={false}>
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handleClose}
          hitSlop={12}
          style={[styles.navButton, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.topBarCenter}>
          <View style={styles.revealBadge}>
            <AppLogo size={14} style={{ marginRight: 3 }} />
            <Text style={[styles.revealBadgeText, { color: colors.primary }]}>STUDIO REVEAL</Text>
          </View>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Masterpiece Ready</Text>
        </View>

        <Pressable
          onPress={handleClose}
          hitSlop={12}
          style={[styles.doneButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Hero Interactive Portrait Canvas */}
        <Card padding="none" style={[styles.heroCard, { borderColor: colors.border }]}>
          <View style={styles.imageWrapper}>
            <Pressable
              onPress={() =>
                openImageViewer({
                  uri: displayedImageUri,
                  title: showOriginal ? 'Original Selfie' : activeTemplateName,
                  subtitle: `${activeRatio} • ${activeStrength} Style`,
                })
              }
              style={{ width: '100%' }}>
              <Image
                source={{ uri: displayedImageUri }}
                style={[
                  styles.heroImage,
                  {
                    aspectRatio: numericAspectRatio,
                  },
                ]}
                resizeMode="cover"
              />
            </Pressable>

            {/* Floating Top Mode Badge */}
            <View style={styles.floatingTopBar}>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(0, 0, 0, 0.72)' }]}>
                <Ionicons
                  name={showOriginal ? 'person-circle-outline' : 'aperture'}
                  size={14}
                  color={showOriginal ? '#60A5FA' : '#10B981'}
                />
                <Text style={styles.statusPillText}>
                  {showOriginal ? 'Original Selfie' : 'AI Studio Result'}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  openImageViewer({
                    uri: displayedImageUri,
                    title: showOriginal ? 'Original Selfie' : activeTemplateName,
                    subtitle: `${activeRatio} • ${activeStrength}`,
                  })
                }
                style={[styles.expandPill, { backgroundColor: 'rgba(0, 0, 0, 0.72)' }]}>
                <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                <Text style={styles.expandPillText}>Full Screen</Text>
              </Pressable>
            </View>

            {/* Floating Bottom Comparison Toggle */}
            {activeOriginalUri && (
              <View style={styles.floatingBottomBar}>
                <Pressable
                  onPress={() => setShowOriginal(!showOriginal)}
                  style={[
                    styles.compareTogglePill,
                    {
                      backgroundColor: showOriginal
                        ? colors.primary
                        : 'rgba(15, 23, 42, 0.88)',
                    },
                  ]}>
                  <Ionicons
                    name="swap-horizontal"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.compareToggleText}>
                    {showOriginal ? 'Switch back to AI Studio' : 'Compare with Original Selfie'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Card>

        {/* Primary Action Suite */}
        <View style={styles.actionGrid}>
          <Button
            variant="primary"
            size="lg"
            icon={<Ionicons name="share-social" size={20} color="#FFFFFF" />}
            onPress={() => setIsPublishModalVisible(true)}
            disabled={hasPublished}
            fullWidth>
            {hasPublished ? 'Published to Community Feed' : 'Publish to Social Feed'}
          </Button>

          <View style={[styles.secondaryActionRow, isDesktop && { flexDirection: 'row' }]}>
            <Button
              variant="secondary"
              size="lg"
              icon={<Ionicons name="download-outline" size={20} color={colors.text} />}
              onPress={handleDownloadHD}
              style={{ flex: 1 }}>
              Download Portrait
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<Ionicons name="camera-outline" size={18} color={colors.text} />}
              onPress={() => router.replace('/(tabs)/create')}
              style={{ flex: 1 }}>
              Create Another
            </Button>
          </View>
        </View>

        {/* The Studio Recipe & Neural Metadata Dossier */}
        <Card padding="lg" style={[styles.dossierCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={styles.dossierHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="finger-print-outline" size={22} color={colors.primary} />
              <Text style={[styles.dossierTitle, { color: colors.text }]}>Generation Recipe</Text>
            </View>
            <Badge variant="success" icon="lock-closed">
              Saved Privately
            </Badge>
          </View>

          {/* Template Info Row */}
          <Pressable
            onPress={() => {
              if (matchedTemplate) {
                openTemplateDetails(matchedTemplate.id);
              }
            }}
            style={[styles.templatePreviewRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {matchedTemplate?.previewUrl ? (
              <Image source={{ uri: matchedTemplate.previewUrl }} style={styles.templateThumb} />
            ) : (
              <View style={[styles.templateThumbFallback, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.templateLabel, { color: colors.textSecondary }]}>Style Template</Text>
              <Text style={[styles.templateName, { color: colors.text }]} numberOfLines={1}>
                {activeTemplateName}
              </Text>
              {matchedTemplate?.category && (
                <Text style={[styles.templateCategory, { color: colors.primary }]}>
                  {matchedTemplate.category}
                </Text>
              )}
            </View>
            {matchedTemplate && (
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            )}
          </Pressable>

          {/* Custom Prompt Callout (If user provided one) */}
          {Boolean(activeCustomPrompt && activeCustomPrompt.trim().length > 0) && (
            <View style={[styles.promptCallout, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="color-wand" size={15} color={colors.primary} />
                <Text style={[styles.promptCalloutTitle, { color: colors.primary }]}>
                  Custom Prompt Tuning
                </Text>
                <View style={[styles.customBadge, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={[styles.customBadgeText, { color: colors.primary }]}>Custom</Text>
                </View>
              </View>
              <Text style={[styles.promptCalloutText, { color: colors.text }]}>
                &ldquo;{activeCustomPrompt.trim()}&rdquo;
              </Text>
            </View>
          )}

          {/* Technical Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={[styles.specItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Aspect Ratio</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{activeRatio}</Text>
            </View>
            <View style={[styles.specItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Style Strength</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{activeStrength}</Text>
            </View>
            <View style={[styles.specItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Resolution</Text>
              <Text style={[styles.specValue, { color: colors.primary }]}>{activeResolution}</Text>
            </View>
            <View style={[styles.specItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Skin Micro-Texture</Text>
              <Text style={[styles.specValue, { color: '#10B981' }]}>Preserved</Text>
            </View>
          </View>
        </Card>

        {/* Portfolio Vault Shortcut */}
        <Pressable
          onPress={() => router.replace('/(tabs)/profile')}
          style={[styles.vaultLinkRow, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="folder-open-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.vaultLinkText, { color: colors.text }]}>
              View in Private Portfolio ({generatedPhotos.length} portraits)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Publish to Feed Modal */}
      <Modal
        visible={isPublishModalVisible}
        onClose={() => setIsPublishModalVisible(false)}
        title="Publish to Social Feed"
        subtitle="Share your studio portrait with the ImagineStyle creator community">
        <View style={{ gap: 16 }}>
          <View style={styles.publishPreviewRow}>
            <Image source={{ uri: activeResultUri }} style={styles.publishModalThumb} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.publishModalTitle, { color: colors.text }]}>
                {activeTemplateName}
              </Text>
              <Text style={[styles.publishModalSubtitle, { color: colors.textSecondary }]}>
                {activeRatio} • {activeStrength} Style
              </Text>
              <Badge variant="success" icon="globe-outline">
                Public Community
              </Badge>
            </View>
          </View>

          <Input
            label="Caption (Optional)"
            placeholder="Share thoughts on this look, lighting tips, or prompt notes..."
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />

          <View style={styles.publishModalActions}>
            <Button
              variant="primary"
              size="lg"
              loading={isPublishing}
              onPress={handlePublish}
              icon={<Ionicons name="share-social" size={18} color="#FFFFFF" />}
              fullWidth>
              Publish Now
            </Button>
            <Button
              variant="ghost"
              onPress={() => setIsPublishModalVisible(false)}
              disabled={isPublishing}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarCenter: {
    alignItems: 'center',
    gap: 2,
  },
  revealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revealBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    padding: 16,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000000',
  },
  heroImage: {
    width: '100%',
  },
  floatingTopBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  expandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expandPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  compareTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  compareToggleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionGrid: {
    gap: 12,
  },
  secondaryActionRow: {
    gap: 12,
  },
  dossierCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dossierTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  templatePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  templateThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  templateThumbFallback: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '700',
  },
  templateCategory: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  promptCallout: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  promptCalloutTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  promptCalloutText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specItem: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  vaultLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  vaultLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  publishPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  publishModalThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  publishModalTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  publishModalSubtitle: {
    fontSize: 12,
  },
  publishModalActions: {
    gap: 8,
    marginTop: 8,
  },
});
