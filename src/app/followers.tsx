import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Input, SegmentedControl } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export default function FollowersScreen() {
  const { type } = useLocalSearchParams<{ type?: 'followers' | 'following' }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { followingCreators, toggleFollowUser } = useApp();

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    type === 'following' ? 'following' : 'followers'
  );
  const [search, setSearch] = useState('');

  const followedList = followingCreators.filter((c) => c.isFollowing);
  const displayList = activeTab === 'following' ? followedList : followingCreators;

  const filteredList = displayList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenContainer>
      {/* Header with Back Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {activeTab === 'followers' ? 'Followers' : 'Following'}
        </Text>

        <View style={{ width: 38 }} />
      </View>

      <View style={styles.topControls}>
        {/* Segmented Switcher */}
        <SegmentedControl
          variant="pill"
          options={[
            { value: 'followers', label: 'Followers (1.4k)' },
            { value: 'following', label: `Following (${followedList.length})` },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'followers' | 'following')}
        />

        {/* Search */}
        <Input
          placeholder="Search by name or @username..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search-outline"
          clearable
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={36} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No users found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {search
                ? `No creators matching "${search}"`
                : activeTab === 'following'
                ? "You aren't following anyone yet."
                : 'No followers found.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isFollowing = !!item.isFollowing;
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/creator/[id]',
                  params: { id: item.id || item.username },
                })
              }
              style={[
                styles.creatorRow,
                { borderBottomColor: colors.border },
              ]}>
              <Avatar
                uri={item.avatar}
                name={item.name}
                size="md"
                isVerified={item.isVerified}
              />
              <View style={styles.creatorInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.creatorName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  {item.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color={colors.text} />
                  )}
                </View>
                <Text style={[styles.creatorHandle, { color: colors.textSecondary }]}>
                  @{item.username}
                </Text>
                {item.bio ? (
                  <Text
                    style={[styles.creatorBio, { color: colors.textSecondary }]}
                    numberOfLines={1}>
                    {item.bio}
                  </Text>
                ) : null}
              </View>

              <Button
                size="sm"
                variant={isFollowing ? 'secondary' : 'outline'}
                onPress={() => toggleFollowUser(item.username)}
                icon={
                  <Ionicons
                    name={isFollowing ? 'checkmark' : 'person-add-outline'}
                    size={14}
                    color={colors.text}
                  />
                }>
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </Pressable>
          );
        }}
      />
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
  topControls: {
    padding: 16,
    gap: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  creatorInfo: {
    flex: 1,
    gap: 2,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorHandle: {
    fontSize: 12,
  },
  creatorBio: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
