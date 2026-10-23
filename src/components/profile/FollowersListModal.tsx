import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Modal, Avatar, Button, Input } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

interface FollowersListModalProps {
  visible: boolean;
  onClose: () => void;
  initialType: 'followers' | 'following';
}

export function FollowersListModal({ visible, onClose, initialType }: FollowersListModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { followingCreators, toggleFollowUser, openCreatorProfile } = useApp();
  const [listType, setListType] = useState<'followers' | 'following'>(initialType);
  const [search, setSearch] = useState('');

  if (!visible) return null;

  const filteredCreators = followingCreators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={listType === 'followers' ? 'Followers' : 'Following'}>
      <View style={styles.container}>
        {/* Toggle between Followers & Following */}
        <View style={styles.typeSwitcher}>
          <Button
            size="sm"
            variant={listType === 'followers' ? 'primary' : 'ghost'}
            onPress={() => setListType('followers')}
            style={{ flex: 1 }}>
            Followers (1.4k)
          </Button>
          <Button
            size="sm"
            variant={listType === 'following' ? 'primary' : 'ghost'}
            onPress={() => setListType('following')}
            style={{ flex: 1 }}>
            Following ({followingCreators.filter((c) => c.isFollowing).length})
          </Button>
        </View>

        <Input
          placeholder="Search creators..."
          leftIcon="search"
          clearable
          value={search}
          onChangeText={setSearch}
        />

        <FlatList
          data={filteredCreators}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.userRow, { borderBottomColor: colors.border }]}>
              <View style={styles.userInfoRow}>
                <Avatar uri={item.avatar} name={item.name} size="md" isVerified={item.isVerified} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.nameText, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.handleText, { color: colors.textSecondary }]}>
                    @{item.username}
                  </Text>
                  {item.bio ? (
                    <Text
                      style={[styles.bioSnippet, { color: colors.textSecondary }]}
                      numberOfLines={1}>
                      {item.bio}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Button
                  size="sm"
                  variant={item.isFollowing ? 'secondary' : 'primary'}
                  onPress={() => toggleFollowUser(item.username)}>
                  {item.isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    onClose();
                    openCreatorProfile(item);
                  }}>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </Button>
              </View>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    maxHeight: 520,
  },
  typeSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  listContent: {
    gap: 8,
    paddingVertical: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  handleText: {
    fontSize: 12,
  },
  bioSnippet: {
    fontSize: 11,
  },
});
