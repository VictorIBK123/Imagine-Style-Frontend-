import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Card, Badge } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp, AppNotification } from '@/context/AppContext';
import { formatTimeAgo } from '@/utils/time';

type NotificationFilter = 'all' | 'like' | 'comment' | 'follow' | 'template_use';

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleEndReached = () => {
    if (loadingMore || visibleCount >= filteredNotifications.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 4, filteredNotifications.length));
      setLoadingMore(false);
    }, 500);
  };

  const paginatedNotifications = filteredNotifications.slice(0, visibleCount);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getEventIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={13} color="#EF4444" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={13} color="#3B82F6" />;
      case 'follow':
        return <Ionicons name="person-add" size={13} color="#10B981" />;
      case 'template_use':
        return <Ionicons name="color-wand" size={13} color={colors.primary} />;
    }
  };

  const getEventDescription = (item: AppNotification) => {
    switch (item.type) {
      case 'like':
        return `liked your portrait: "${item.targetTitle}"`;
      case 'comment':
        return `commented: ${item.targetTitle}`;
      case 'follow':
        return 'started following you';
      case 'template_use':
        return `generated a portrait using your template: ${item.targetTitle}`;
    }
  };

  const handleNotificationPress = (item: AppNotification) => {
    markNotificationAsRead(item.id);
    if (item.type === 'follow') {
      router.push({ pathname: '/creator/[id]', params: { id: item.user.username } });
    } else if (item.type === 'template_use') {
      router.push({ pathname: '/template/[id]', params: { id: 'tpl-1' } });
    } else if (item.type === 'like' || item.type === 'comment') {
      router.push({ pathname: '/post/[id]', params: { id: 'post-1' } });
    } else if (item.linkRoute) {
      router.push(item.linkRoute as any);
    }
  };

  const filterButtons: { label: string; value: NotificationFilter; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'All', value: 'all', icon: 'notifications-outline' },
    { label: 'Likes', value: 'like', icon: 'heart-outline' },
    { label: 'Comments', value: 'comment', icon: 'chatbubble-outline' },
    { label: 'Follows', value: 'follow', icon: 'person-add-outline' },
    { label: 'Templates', value: 'template_use', icon: 'color-wand-outline' },
  ];

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Activity</Text>
              {unreadCount > 0 && (
                <Badge variant="primary">
                  {unreadCount} New
                </Badge>
              )}
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {unreadCount > 0 ? `${unreadCount} unread interactions` : 'All caught up on social activity'}
            </Text>
          </View>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onPress={markAllNotificationsAsRead}
              icon={<Ionicons name="checkmark-done" size={16} color={colors.text} />}>
              Mark all read
            </Button>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterButtons}
            keyExtractor={(btn) => btn.value}
            contentContainerStyle={styles.filterPillsContainer}
            renderItem={({ item: btn }) => {
              const isSelected = activeFilter === btn.value;
              return (
                <Pressable
                  onPress={() => {
                    setActiveFilter(btn.value);
                    setVisibleCount(6);
                  }}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.14)'
                          : 'rgba(0, 0, 0, 0.08)'
                        : colors.backgroundElement,
                      borderColor: isSelected ? colors.text : colors.border,
                    },
                  ]}>
                  <Ionicons
                    name={btn.icon}
                    size={14}
                    color={isSelected ? colors.text : colors.textSecondary}
                    style={{ opacity: isSelected ? 1 : 0.7 }}
                  />
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: isSelected ? colors.text : colors.textSecondary,
                        opacity: isSelected ? 1 : 0.7,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {btn.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Notifications Feed with Pagination (PRD §5 line 151) */}
        <FlatList
          data={paginatedNotifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  Loading activity...
                </Text>
              </View>
            ) : undefined
          }
          renderItem={({ item }) => {
            return (
              <Card
                bordered
                onPress={() => handleNotificationPress(item)}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: item.isRead ? colors.card : colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={styles.avatarWrapper}>
                  <Avatar uri={item.user.avatar} name={item.user.name} size="md" />
                  <View style={[styles.eventIconBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {getEventIcon(item.type)}
                  </View>
                </View>

                <View style={styles.contentWrapper}>
                  <Text style={[styles.itemText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>@{item.user.username} </Text>
                    {getEventDescription(item)}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                    {formatTimeAgo(item.createdAt || item.timeAgo, item.id)}
                  </Text>
                </View>

                {!item.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
              </Card>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="notifications-off-outline" size={38} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications in this category</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                When creators like your portraits or try your templates, updates will appear here.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  filterBar: {
    paddingVertical: 10,
  },
  filterPillsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  eventIconBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  contentWrapper: {
    flex: 1,
    gap: 4,
  },
  itemText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
  },
});
