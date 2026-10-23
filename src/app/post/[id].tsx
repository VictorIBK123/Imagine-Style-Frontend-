import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Input } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { formatTimeAgo } from '@/utils/time';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    posts,
    comments,
    addComment,
    toggleLikePost,
    toggleSavePost,
    currentUser,
    openImageViewer,
    loadCommentsForPost,
  } = useApp();

  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (id) {
      loadCommentsForPost(id);
    }
  }, [id, loadCommentsForPost]);

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <ScreenContainer>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>Post Not Found</Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}>
            This post does not exist or has been removed.
          </Text>
          <Button variant="outline" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const postComments = comments[post.id] || [];

  const isCreatorMe =
    post.creator.id === currentUser.id ||
    post.creator.username === currentUser.username ||
    post.creator.id === 'user-me';

  const creatorName = post.creator.name;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this AI portrait on ImagineStyle! ${post.caption}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleCreatorPress = () => {
    if (isCreatorMe) {
      router.push('/profile');
    } else {
      router.push({
        pathname: '/creator/[id]',
        params: { id: post.creator.id || post.creator.username },
      });
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

        <Text style={[styles.headerTitle, { color: colors.text }]}>Portrait</Text>

        <Pressable
          onPress={handleShare}
          hitSlop={10}
          style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="share-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Post Header */}
          <View style={styles.postHeaderRow}>
            <Pressable onPress={handleCreatorPress} style={styles.creatorMeta}>
              <Avatar
                uri={post.creator.avatar}
                name={creatorName}
                size="md"
                isVerified={post.creator.isVerified}
              />
              <View style={{ marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.creatorNameText, { color: colors.text }]}>
                    {creatorName}
                  </Text>
                </View>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  {formatTimeAgo(post.createdAt || post.timeAgo, post.id)}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Full Portrait Image with Fullscreen Action */}
          <Pressable
            onPress={() =>
              openImageViewer({
                uri: post.portraitUrl,
                title: post.template?.name || 'Studio Portrait',
                caption: post.caption,
                creatorName: post.creator.name,
              })
            }
            style={styles.imageCard}>
            <Image source={{ uri: post.portraitUrl }} style={styles.portraitImg} />

            {/* Try This Style Pill Badge */}
            {post.template && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/template/[id]',
                    params: { id: post.template.id },
                  })
                }
                style={[styles.templatePill, { backgroundColor: 'rgba(0, 0, 0, 0.72)' }]}>
                <Ionicons name="color-wand-outline" size={14} color="#FFFFFF" />
                <Text style={styles.templatePillText}>{post.template.name}</Text>
                <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
              </Pressable>
            )}
          </Pressable>

          {/* Actions Bar */}
          <View style={styles.actionsBar}>
            <View style={styles.leftActions}>
              <Pressable
                onPress={() => toggleLikePost(post.id)}
                style={styles.actionBtn}>
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={post.isLiked ? '#EF4444' : colors.text}
                />
                <Text style={[styles.actionCount, { color: colors.text }]}>
                  {post.likesCount}
                </Text>
              </Pressable>

              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
                <Text style={[styles.actionCount, { color: colors.text }]}>
                  {postComments.length}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => toggleSavePost(post.id)}
              hitSlop={8}
              style={styles.actionBtn}>
              <Ionicons
                name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={post.isSaved ? colors.text : colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Caption */}
          {post.caption ? (
            <View style={styles.captionBlock}>
              <Text style={[styles.captionText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>{creatorName} </Text>
                {post.caption}
              </Text>
            </View>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsSectionTitle, { color: colors.text }]}>
              Comments ({postComments.length})
            </Text>

            {postComments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubbles-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>
                  No comments yet. Be the first to share your thoughts!
                </Text>
              </View>
            ) : (
              postComments.map((comment) => {
                const isCommentMe =
                  comment.author.id === currentUser.id ||
                  comment.author.username === currentUser.username;
                const authorName = `@${comment.author.username}`;

                return (
                  <View key={comment.id} style={styles.commentRow}>
                    <Pressable
                      onPress={() => {
                        if (isCommentMe) {
                          router.push('/profile');
                        } else {
                          router.push({
                            pathname: '/creator/[id]',
                            params: { id: comment.author.id || comment.author.username },
                          });
                        }
                      }}>
                      <Avatar
                        uri={comment.author.avatar}
                        name={comment.author.name}
                        size="sm"
                      />
                    </Pressable>

                    <View style={styles.commentBody}>
                      <View style={styles.commentHeader}>
                        <Pressable
                          onPress={() => {
                            if (isCommentMe) {
                              router.push('/profile');
                            } else {
                              router.push({
                                pathname: '/creator/[id]',
                                params: { id: comment.author.id || comment.author.username },
                              });
                            }
                          }}>
                          <Text
                            style={[
                              styles.commentAuthorName,
                              { color: colors.text, fontWeight: isCommentMe ? '700' : '600' },
                            ]}>
                            {authorName}
                          </Text>
                        </Pressable>
                        <Text style={[styles.commentTimeAgo, { color: colors.textSecondary }]}>
                          {formatTimeAgo(comment.createdAt || comment.timeAgo, comment.id)}
                        </Text>
                      </View>
                      <Text style={[styles.commentContent, { color: colors.text }]}>
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Bottom Comment Input */}
        <View
          style={[
            styles.bottomInputWrap,
            { backgroundColor: colors.background, borderTopColor: colors.border },
          ]}>
          <Avatar uri={currentUser.avatar} name={currentUser.name} size="sm" />
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              containerStyle={{ width: '100%' }}
              onSubmitEditing={handleSendComment}
              returnKeyType="send"
            />
          </View>
          <Button
            size="sm"
            disabled={!commentText.trim()}
            onPress={handleSendComment}
            style={styles.postCommentBtn}>
            Post
          </Button>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 20,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creatorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
  },
  imageCard: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 4 / 5,
    backgroundColor: '#1E1E22',
  },
  portraitImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  templatePill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  templatePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  captionBlock: {
    marginTop: 2,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  commentsSection: {
    gap: 14,
  },
  commentsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyCommentsText: {
    fontSize: 13,
    textAlign: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthorName: {
    fontSize: 13,
  },
  commentTimeAgo: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  postCommentBtn: {
    paddingHorizontal: 16,
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
  },
  notFoundSubtitle: {
    fontSize: 14,
  },
});
