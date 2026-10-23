import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Modal, Avatar, Input, Button } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp, PostComment } from '@/context/AppContext';
import { formatTimeAgo } from '@/utils/time';

export interface CommentSheetProps {
  postId: string | null;
  visible: boolean;
  onClose: () => void;
}

export function CommentSheet({ postId, visible, onClose }: CommentSheetProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { comments, addComment, currentUser, openCreatorProfile, loadCommentsForPost } = useApp();
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (visible && postId) {
      loadCommentsForPost(postId);
    }
  }, [visible, postId, loadCommentsForPost]);

  if (!postId) return null;

  const postComments: PostComment[] = comments[postId] || [];

  const handleSend = () => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Comments"
      subtitle={`${postComments.length} thoughts`}>
      <View style={styles.container}>
        {/* Comments List */}
        <View style={styles.commentList}>
          {postComments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubbles-outline" size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No comments yet. Be the first to share your thoughts!
              </Text>
            </View>
          ) : (
            postComments.map((comment) => {
              const isMe =
                comment.author.id === currentUser.id ||
                comment.author.username === currentUser.username;
              return (
                <View key={comment.id} style={styles.commentRow}>
                  <Pressable
                    onPress={() => {
                      onClose();
                      if (isMe) {
                        router.push('/profile');
                      } else {
                        openCreatorProfile(comment.author);
                      }
                    }}>
                    <Avatar uri={comment.author.avatar} name={comment.author.name} size="sm" />
                  </Pressable>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <Pressable
                        onPress={() => {
                          onClose();
                          if (isMe) {
                            router.push('/profile');
                          } else {
                            openCreatorProfile(comment.author);
                          }
                        }}>
                        <Text style={[styles.authorUsername, { color: colors.text, fontWeight: isMe ? '700' : '600' }]}>
                          @{comment.author.username}
                        </Text>
                      </Pressable>
                      <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
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

        {/* New Comment Input */}
        <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
          <Avatar uri={currentUser.avatar} name={currentUser.name} size="sm" />
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              containerStyle={{ width: '100%' }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <Button
            size="sm"
            disabled={!commentText.trim()}
            onPress={handleSend}
            style={styles.postBtn}>
            Post
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
  commentList: {
    gap: 16,
    minHeight: 120,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  commentBody: {
    flex: 1,
    gap: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorUsername: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  postBtn: {
    height: 44,
  },
});
