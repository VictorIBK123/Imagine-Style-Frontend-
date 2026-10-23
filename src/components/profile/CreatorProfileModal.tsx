import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Modal, Avatar, Button, Card, Badge, SegmentedControl } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export function CreatorProfileModal() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    selectedCreatorProfile,
    closeCreatorProfile,
    toggleFollowUser,
    posts,
    templates,
    openTemplateDetails,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'portraits' | 'templates'>('portraits');

  if (!selectedCreatorProfile) return null;

  const creatorPosts = posts.filter(
    (p) => p.creator.username === selectedCreatorProfile.username
  );
  const creatorTemplates = templates.filter(
    (t) =>
      typeof t.creator === 'object' &&
      t.creator.username === selectedCreatorProfile.username
  );

  const isFollowing = !!selectedCreatorProfile.isFollowing;

  return (
    <Modal
      visible={!!selectedCreatorProfile}
      onClose={closeCreatorProfile}
      title={`@${selectedCreatorProfile.username}`}>
      <View style={styles.container}>
        {/* Creator Header */}
        <View style={styles.headerRow}>
          <Avatar
            uri={selectedCreatorProfile.avatar}
            name={selectedCreatorProfile.name}
            size="lg"
            isVerified={selectedCreatorProfile.isVerified}
          />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {creatorPosts.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>12.4k</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>340</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {selectedCreatorProfile.name}
          </Text>
          {selectedCreatorProfile.bio ? (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {selectedCreatorProfile.bio}
            </Text>
          ) : (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              AI Portrait Stylist & Digital Creator on ImagineStyle ✨
            </Text>
          )}
        </View>

        {/* Action Button: Follow / Following */}
        <Button
          variant={isFollowing ? 'secondary' : 'outline'}
          size="md"
          onPress={() => toggleFollowUser(selectedCreatorProfile.username)}
          icon={
            <Ionicons
              name={isFollowing ? 'checkmark' : 'person-add'}
              size={16}
              color={colors.text}
            />
          }
          fullWidth>
          {isFollowing ? 'Following' : 'Follow Creator'}
        </Button>

        {/* Sub-tabs */}
        <SegmentedControl
          variant="pill"
          options={[
            { value: 'portraits', label: 'Portraits', icon: 'grid', badge: creatorPosts.length },
            { value: 'templates', label: 'Templates', icon: 'color-palette', badge: creatorTemplates.length },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'portraits' | 'templates')}
        />

        {/* Content based on tab */}
        {activeTab === 'portraits' ? (
          creatorPosts.length > 0 ? (
            <View style={styles.gridContainer}>
              {creatorPosts.map((post) => (
                <View key={post.id} style={styles.gridItem}>
                  <Image source={{ uri: post.portraitUrl }} style={styles.gridImg} />
                  <View style={styles.postOverlay}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="heart" size={12} color="#FFFFFF" />
                      <Text style={styles.postOverlayText}>{post.likesCount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Card padding="md" style={styles.emptyCard}>
              <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No public portraits yet from this creator.
              </Text>
            </Card>
          )
        ) : creatorTemplates.length > 0 ? (
          <View style={styles.templatesList}>
            {creatorTemplates.map((tpl) => (
              <Card key={tpl.id} padding="sm" style={styles.templateCard}>
                <Image source={{ uri: tpl.previewUrl }} style={styles.templateThumb} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.templateName, { color: colors.text }]}>{tpl.name}</Text>
                  <Badge variant="primary">{tpl.category}</Badge>
                </View>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    closeCreatorProfile();
                    openTemplateDetails(tpl.id);
                  }}>
                  Try Style
                </Button>
              </Card>
            ))}
          </View>
        ) : (
          <Card padding="md" style={styles.emptyCard}>
            <Ionicons name="color-palette-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No created templates from this creator yet.
            </Text>
          </Card>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  bioContainer: {
    gap: 3,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridItem: {
    width: '31.8%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  gridImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  postOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  templatesList: {
    gap: 8,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
  },
  templateThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  templateName: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
