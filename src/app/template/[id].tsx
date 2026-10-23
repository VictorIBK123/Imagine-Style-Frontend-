import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button, Badge, Avatar } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { INITIAL_TEMPLATES } from '@/store/useAppStore';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    templates,
    toggleSaveTemplate,
    currentUser,
    openImageViewer,
  } = useApp();

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const template = templates.find((t) => t.id === id) || INITIAL_TEMPLATES.find((t) => t.id === id);

  if (!template) {
    return (
      <ScreenContainer>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>Template Not Found</Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}>
            The style you are looking for does not exist or was removed.
          </Text>
          <Button variant="outline" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

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
    router.push({
      pathname: '/create',
      params: { templateId: template.id, templateName: template.name },
    });
  };

  const isCreatorMe =
    typeof template.creator !== 'string' &&
    (template.creator.id === currentUser.id || template.creator.username === currentUser.username);

  const creatorName =
    template.creator === 'Official'
      ? 'ImagineStyle Official'
      : `@${template.creator.username}`;

  const creatorAvatar =
    template.creator === 'Official' ? undefined : template.creator.avatar;

  const handleCreatorPress = () => {
    if (typeof template.creator === 'object') {
      if (isCreatorMe) {
        router.push('/profile');
      } else {
        router.push({
          pathname: '/creator/[id]',
          params: { id: template.creator.id || template.creator.username },
        });
      }
    }
  };

  return (
    <ScreenContainer>
      {/* Stack Navigation Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerCategory, { color: colors.textSecondary }]}>
            {template.category} Style
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {template.name}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={handleShare}
            hitSlop={10}
            style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="share-outline" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => toggleSaveTemplate(template.id)}
            hitSlop={10}
            style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons
              name={template.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={template.isSaved ? colors.text : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Preview Image with Fullscreen Action */}
        <Pressable
          onPress={() =>
            openImageViewer({
              uri: template.previewUrl,
              title: template.name,
              subtitle: `${template.category} Style`,
              creatorName,
            })
          }
          style={styles.heroCard}>
          <Image source={{ uri: template.previewUrl }} style={styles.heroImage} />

          {/* Floating Pill Badges */}
          <View style={styles.floatingBadges}>
            <Badge
              variant={template.isOfficial ? 'secondary' : isCreatorMe ? 'secondary' : 'secondary'}
              icon={template.isOfficial ? 'shield-checkmark' : 'person'}>
              {template.isOfficial ? 'Official' : creatorName}
            </Badge>

            <View style={[styles.usageBadge, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]}>
              <Ionicons name="flame-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.usageText}>
                {(template.usageCount / 1000).toFixed(1)}k uses
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Creator Attribution Bar */}
        <Pressable
          onPress={handleCreatorPress}
          style={[
            styles.creatorCard,
            { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
          ]}>
          <Avatar
            uri={creatorAvatar}
            name={creatorName}
            size="md"
            isVerified={
              template.isOfficial ||
              (typeof template.creator !== 'string' && template.creator.isVerified)
            }
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.creatorSubtitle, { color: colors.textSecondary }]}>
              Created by
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.creatorDisplayName, { color: colors.text }]}>
                {creatorName}
              </Text>
            </View>
          </View>

          {typeof template.creator === 'object' && (
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          )}
        </Pressable>

        {/* Description Section */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>About This Style</Text>
          <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
            {template.description}
          </Text>
        </View>

        {/* Prompt Guidance Box */}
        {template.promptGuidance && (
          <View
            style={[
              styles.guidanceBox,
              { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
            ]}>
            <View style={styles.guidanceTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="bulb-outline" size={16} color={colors.text} />
                <Text style={[styles.guidanceTitle, { color: colors.text }]}>
                  Aesthetic Recipe & Settings
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                }}
                hitSlop={8}>
                <Text style={[styles.copyHint, { color: colors.textSecondary }]}>
                  {copiedPrompt ? 'Copied!' : 'Copy'}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.guidanceBody, { color: colors.text }]}>
              {template.promptGuidance}
            </Text>
          </View>
        )}

        {/* Community Results Gallery */}
        {template.communityResults && template.communityResults.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.communityHeader}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Community Results
              </Text>
              <Text style={[styles.communityCount, { color: colors.textSecondary }]}>
                {template.communityResults.length} sample
              </Text>
            </View>
            <Text style={[styles.sectionSubBody, { color: colors.textSecondary }]}>
              Portraits generated by the community with this preset
            </Text>

            <View style={styles.communityGrid}>
              {template.communityResults.map((url, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    openImageViewer({
                      uri: url,
                      title: `${template.name} Community Sample`,
                      subtitle: `${template.category} preset result`,
                    })
                  }
                  style={styles.communityImageCard}>
                  <Image source={{ uri: url }} style={styles.communityImage} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<Ionicons name="color-wand-outline" size={18} color="#FFFFFF" />}
          onPress={handleTryStyle}>
          Try This Style
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerCategory: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 20,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 4 / 5,
    backgroundColor: '#1E1E22',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingBadges: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  usageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  creatorSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  creatorDisplayName: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionBlock: {
    gap: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionSubBody: {
    fontSize: 13,
    marginBottom: 8,
  },
  guidanceBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  guidanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  copyHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  guidanceBody: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityCount: {
    fontSize: 12,
  },
  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  communityImageCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  communityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  notFoundSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
