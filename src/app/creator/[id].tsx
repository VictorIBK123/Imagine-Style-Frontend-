import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Card, Badge, SegmentedControl } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    posts,
    templates,
    followingCreators,
    toggleFollowUser,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'portraits' | 'templates'>('portraits');

  // Match creator
  const isMe =
    id === currentUser.id ||
    id === 'user-me' ||
    id === currentUser.username;

  const foundCreator = isMe
    ? currentUser
    : followingCreators.find((c) => c.id === id || c.username === id) ||
      posts.find((p) => p.creator.id === id || p.creator.username === id)?.creator;

  const creator = foundCreator || {
    id: id || 'creator-unknown',
    name: 'Creator',
    username: id || 'creator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    bio: 'AI visual artist and stylist on ImagineStyle.',
    isFollowing: false,
    isVerified: true,
  };

  const isFollowing = !isMe && !!creator.isFollowing;

  // Filter creator posts and templates
  const creatorPosts = isMe
    ? posts.filter((p) => p.creator.id === currentUser.id)
    : posts.filter(
        (p) =>
          p.creator.id === creator.id ||
          p.creator.username === creator.username
      );

  const creatorTemplates = isMe
    ? templates.filter(
        (t) => typeof t.creator === 'object' && t.creator.id === currentUser.id
      )
    : templates.filter(
        (t) =>
          typeof t.creator === 'object' &&
          (t.creator.id === creator.id || t.creator.username === creator.username)
      );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out @${creator.username}'s AI portraits and styles on ImagineStyle!`,
      });
    } catch {
      // Ignored
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isMe ? 'Your Profile' : `@${creator.username}`}
          </Text>
          {creator.isVerified && (
            <Ionicons name="checkmark-circle" size={15} color={colors.text} style={{ marginLeft: 4 }} />
          )}
        </View>

        <Pressable
          onPress={handleShare}
          hitSlop={10}
          style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="share-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Creator Bio Header Card */}
        <View style={styles.profileHero}>
          <View style={styles.avatarStatsRow}>
            <Avatar
              uri={creator.avatar}
              name={creator.name}
              size="xl"
              isVerified={creator.isVerified}
            />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {creatorPosts.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
              </View>

              <Pressable
                onPress={() => router.push({ pathname: '/followers', params: { type: 'followers' } })}
                style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>12.4k</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push({ pathname: '/followers', params: { type: 'following' } })}
                style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>340</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
              </Pressable>
            </View>
          </View>

          {/* Name & Bio */}
          <View style={styles.bioBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.displayName, { color: colors.text }]}>
                {creator.name}
              </Text>
            </View>
            <Text style={[styles.handleText, { color: colors.textSecondary }]}>
              @{creator.username}
            </Text>
            {creator.bio ? (
              <Text style={[styles.bioText, { color: colors.text }]}>
                {creator.bio}
              </Text>
            ) : (
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>
                AI Portrait Stylist & Digital Creator on ImagineStyle ✨
              </Text>
            )}
          </View>

          {/* Action Button: Follow vs Edit Profile */}
          {isMe ? (
            <Button
              variant="outline"
              size="md"
              onPress={() => router.push('/edit-profile')}
              icon={<Ionicons name="create-outline" size={16} color={colors.text} />}
              fullWidth>
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'secondary' : 'outline'}
              size="md"
              onPress={() => toggleFollowUser(creator.username)}
              icon={
                <Ionicons
                  name={isFollowing ? 'checkmark' : 'person-add-outline'}
                  size={16}
                  color={colors.text}
                />
              }
              fullWidth>
              {isFollowing ? 'Following' : 'Follow Creator'}
            </Button>
          )}
        </View>

        {/* Sub-tabs: Portraits vs Templates */}
        <SegmentedControl
          variant="pill"
          options={[
            { value: 'portraits', label: 'Portraits', icon: 'grid', badge: creatorPosts.length },
            { value: 'templates', label: 'Templates', icon: 'color-palette', badge: creatorTemplates.length },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'portraits' | 'templates')}
        />

        {/* Tab Content */}
        {activeTab === 'portraits' ? (
          creatorPosts.length > 0 ? (
            <View style={styles.gridContainer}>
              {creatorPosts.map((post) => (
                <Pressable
                  key={post.id}
                  onPress={() =>
                    router.push({ pathname: '/post/[id]', params: { id: post.id } })
                  }
                  style={styles.gridItem}>
                  <Image source={{ uri: post.portraitUrl }} style={styles.gridImg} />
                  <View style={styles.postOverlay}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="heart" size={12} color="#FFFFFF" />
                      <Text style={styles.postOverlayText}>{post.likesCount}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Card padding="lg" style={styles.emptyCard}>
              <Ionicons name="images-outline" size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No public portraits published yet.
              </Text>
            </Card>
          )
        ) : creatorTemplates.length > 0 ? (
          <View style={styles.templatesList}>
            {creatorTemplates.map((tpl) => (
              <Pressable
                key={tpl.id}
                onPress={() =>
                  router.push({ pathname: '/template/[id]', params: { id: tpl.id } })
                }>
                <Card padding="sm" style={styles.templateCard}>
                  <Image source={{ uri: tpl.previewUrl }} style={styles.templateThumb} />
                  <View style={{ flex: 1, gap: 4, marginLeft: 12 }}>
                    <Text style={[styles.templateName, { color: colors.text }]}>
                      {tpl.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge variant="secondary">
                        {tpl.category}
                      </Badge>
                      <Text style={[styles.templateUsage, { color: colors.textSecondary }]}>
                        {(tpl.usageCount / 1000).toFixed(1)}k uses
                      </Text>
                    </View>
                  </View>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/create',
                        params: { templateId: tpl.id, templateName: tpl.name },
                      })
                    }>
                    Use Style
                  </Button>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : (
          <Card padding="lg" style={styles.emptyCard}>
            <Ionicons name="color-palette-outline" size={36} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No public style templates created yet.
            </Text>
          </Card>
        )}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 18,
    paddingBottom: 40,
  },
  profileHero: {
    gap: 14,
  },
  avatarStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginRight: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  bioBlock: {
    gap: 4,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
  },
  handleText: {
    fontSize: 13,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridItem: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  postOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  templatesList: {
    gap: 10,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateUsage: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
  },
});
