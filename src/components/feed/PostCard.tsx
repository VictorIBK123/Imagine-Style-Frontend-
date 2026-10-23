import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Share,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card, Avatar, Badge, Button, ActionSheet } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp, FeedPost } from '@/context/AppContext';
import { formatTimeAgo } from '@/utils/time';

export interface PostCardProps {
  post: FeedPost;
  onOpenComments: (postId: string) => void;
}

export function PostCard({ post, onOpenComments }: PostCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    currentUser,
    toggleLikePost,
    toggleSavePost,
    toggleFollowUser,
    hidePost,
    reportPost,
    openTemplateDetails,
    openCreatorProfile,
    openImageViewer,
  } = useApp();

  const [optionsVisible, setOptionsVisible] = useState(false);

  // Double tap animation & Single tap viewer
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heartScale] = useState(() => new Animated.Value(0));

  const triggerDoubleTapHeart = () => {
    heartScale.setValue(0);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 250,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleImagePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      if (!post.isLiked) {
        toggleLikePost(post.id);
      }
      triggerDoubleTapHeart();
    } else {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
      singleTapTimerRef.current = setTimeout(() => {
        openImageViewer({
          uri: post.portraitUrl,
          title: post.template?.name || 'Studio Portrait',
          caption: post.caption,
          creatorName: post.creator.name,
        });
      }, DOUBLE_TAP_DELAY);
    }
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this AI portrait by @${post.creator.username} made with ImagineStyle: ${post.template.name}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleTryStyle = () => {
    // Open template detail modal
    openTemplateDetails(post.template.id);
  };

  const isCurrentUser =
    post.creator.id === currentUser.id ||
    post.creator.username === currentUser.username;

  return (
    <Card bordered style={styles.card}>
      {/* Post Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (isCurrentUser) {
              router.push('/profile');
            } else {
              openCreatorProfile(post.creator);
            }
          }}
          style={styles.creatorInfo}>
          <Avatar
            uri={post.creator.avatar}
            name={post.creator.name}
            size="md"
            isVerified={post.creator.isVerified}
          />
          <View style={styles.creatorMeta}>
            <View style={styles.creatorNameRow}>
              <Text style={[styles.creatorName, { color: colors.text }]}>
                {post.creator.name}
              </Text>
            </View>
            <Text style={[styles.creatorHandle, { color: colors.textSecondary }]}>
              @{post.creator.username} • {formatTimeAgo(post.createdAt || post.timeAgo, post.id)}
            </Text>
          </View>
        </Pressable>

        <View style={styles.headerRight}>
          {!isCurrentUser && (
            <Button
              size="sm"
              variant={post.creator.isFollowing ? 'outline' : 'secondary'}
              onPress={() => toggleFollowUser(post.creator.username)}
              style={styles.followBtn}>
              {post.creator.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}

          <Pressable
            hitSlop={10}
            onPress={() => setOptionsVisible(true)}
            style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Portrait Image with Double-Tap */}
      <Pressable onPress={handleImagePress} style={styles.imageContainer}>
        <Image source={{ uri: post.portraitUrl }} style={styles.portrait} />

        {/* Animated Pop Heart on Double Tap */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.doubleTapHeart,
            {
              transform: [{ scale: heartScale }],
              opacity: heartScale,
            },
          ]}>
          <Ionicons name="heart" size={88} color="#EF4444" />
        </Animated.View>

        {/* Floating "Try This Style" Badge Button */}
        <Pressable
          onPress={handleTryStyle}
          style={({ pressed }) => [
            styles.tryStyleOverlayBtn,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}>
          <Ionicons name="color-wand-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text style={styles.tryStyleOverlayText}>Try This Style</Text>
        </Pressable>
      </Pressable>

      {/* Social Actions Row */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          {/* Like */}
          <Pressable
            onPress={() => toggleLikePost(post.id)}
            hitSlop={8}
            style={styles.actionBtn}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={post.isLiked ? '#EF4444' : colors.text}
            />
            <Text
              style={[
                styles.actionCount,
                { color: post.isLiked ? '#EF4444' : colors.text },
              ]}>
              {post.likesCount}
            </Text>
          </Pressable>

          {/* Comment */}
          <Pressable
            onPress={() => onOpenComments(post.id)}
            hitSlop={8}
            style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
            <Text style={[styles.actionCount, { color: colors.text }]}>
              {post.commentsCount}
            </Text>
          </Pressable>

          {/* Share */}
          <Pressable onPress={handleShare} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="paper-plane-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Save */}
        <Pressable
          onPress={() => toggleSavePost(post.id)}
          hitSlop={8}
          style={styles.actionBtn}>
          <Ionicons
            name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* Template Attribution Tag & Caption */}
      <View style={styles.captionArea}>
        <Pressable onPress={handleTryStyle} style={styles.templatePillPressable}>
          <Badge
            variant="primary"
            icon="color-wand">
            {post.template.name}
          </Badge>
        </Pressable>

        {post.caption ? (
          <Text style={[styles.captionText, { color: colors.text }]}>
            <Text style={{ fontWeight: '700' }}>@{post.creator.username} </Text>
            {post.caption}
          </Text>
        ) : null}
      </View>

      {/* Context Options ActionSheet */}
      <ActionSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        title="Post Options"
        options={[
          {
            id: 'share',
            label: 'Share Post Link',
            icon: 'share-outline',
            onPress: handleShare,
          },
          {
            id: 'template',
            label: `View "${post.template.name}" Style`,
            icon: 'color-palette-outline',
            onPress: handleTryStyle,
          },
          {
            id: 'save',
            label: post.isSaved ? 'Remove from Saved' : 'Save to Bookmarks',
            icon: post.isSaved ? 'bookmark' : 'bookmark-outline',
            onPress: () => toggleSavePost(post.id),
          },
          ...(!isCurrentUser
            ? [
                {
                  id: 'hide',
                  label: 'Hide this post',
                  icon: 'eye-off-outline' as const,
                  onPress: () => hidePost(post.id),
                },
                {
                  id: 'report',
                  label: 'Report post',
                  icon: 'flag-outline' as const,
                  destructive: true,
                  onPress: () => reportPost(post.id, 'Inappropriate content'),
                },
              ]
            : []),
        ]}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  creatorMeta: {
    gap: 2,
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorHandle: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  menuBtn: {
    padding: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#16161A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  doubleTapHeart: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tryStyleOverlayBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  tryStyleOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  captionArea: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  templatePillPressable: {
    alignSelf: 'flex-start',
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewCommentsLink: {
    fontSize: 13,
    marginTop: 2,
  },
});
