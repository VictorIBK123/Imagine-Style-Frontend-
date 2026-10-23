import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SegmentedControl, Button } from '@/components/ui';
import { PostCard } from '@/components/feed/PostCard';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { posts, loadMorePosts, loadInitialDataFromDb } = useApp();
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialDataFromDb?.();
    setHasMore(true);
    setRefreshing(false);
  };

  const displayedPosts =
    activeTab === 'forYou'
      ? posts
      : posts.filter((p) => p.creator.isFollowing);

  const handleEndReached = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const loaded = await loadMorePosts?.(15);
    if (!loaded) {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  return (
    <ScreenContainer>
      {/* Feed Filter Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.segmentWrapper}>
          <SegmentedControl
            options={[
              { value: 'forYou', label: 'For You', icon: 'compass' },
              { value: 'following', label: 'Following', icon: 'people' },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as 'forYou' | 'following');
            }}
            variant="pill"
          />
        </View>
      </View>

      {/* Feed List with Infinite Scroll (PRD §2 lines 57-58) */}
      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            colors={[colors.text]}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Loading more portraits...
              </Text>
            </View>
          ) : !hasMore && displayedPosts.length > 0 ? (
            <View style={styles.caughtUpContainer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {"You're all caught up"}
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: colors.backgroundElement },
              ]}>
              <Ionicons name="people-outline" size={44} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No posts from followed creators yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Switch to the For You feed to discover incredible portraits and styles from the community.
            </Text>
            <Button
              variant="primary"
              icon={<Ionicons name="compass-outline" size={16} color="#FFFFFF" />}
              onPress={() => setActiveTab('forYou')}
              style={styles.emptyBtn}>
              Explore For You
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onOpenComments={(id) =>
              router.push({ pathname: '/post/[id]', params: { id } })
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    width: '100%',
  },
  segmentWrapper: {
    width: '100%',
    maxWidth: 340,
  },
  feedContent: {
    padding: 16,
    gap: 20,
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  emptyBtn: {
    marginTop: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  caughtUpContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
