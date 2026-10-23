import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input, Badge, Button } from '@/components/ui';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

const CATEGORIES = [
  'All',
  'For You',
  'Trending',
  'Most Used',
  'Corporate',
  'Traditional',
  'Fashion',
  'Birthday',
  'Couples',
  'Graduation',
  'Wedding',
  'Creative',
];

export default function TemplatesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width } = useWindowDimensions();

  const { templates, loadMoreTemplates } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingMore, setLoadingMore] = useState(false);

  const numColumns = width >= 900 ? 3 : 2;

  const filteredTemplates = templates.filter((item) => {
    const creatorString =
      item.creator === 'Official' ? 'Official' : item.creator.username;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creatorString.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'For You' && (item.isOfficial || item.usageCount > 10000)) ||
      (selectedCategory === 'Trending' && item.usageCount > 10000) ||
      (selectedCategory === 'Most Used' && item.usageCount > 15000) ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <ScreenContainer>
      {/* Header Area */}
      <View style={styles.headerArea}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Templates</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Unified catalogue of official and community styles
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <Input
          placeholder="Search styles, categories, creators..."
          leftIcon="search"
          clearable
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category Pills Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Badge
                key={cat}
                variant={isSelected ? 'active' : 'secondary'}
                onPress={() => setSelectedCategory(cat)}
                style={styles.categoryBadge}>
                {cat}
              </Badge>
            );
          })}
        </ScrollView>
      </View>

      {/* Unified Catalogue Grid */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={async () => {
          if (loadingMore) return;
          setLoadingMore(true);
          await loadMoreTemplates?.(15, selectedCategory !== 'All' ? selectedCategory : undefined);
          setLoadingMore(false);
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching styles found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Try searching with another keyword or pick a different category.
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              style={{ marginTop: 8 }}>
              Reset Filters
            </Button>
          </View>
        }
        renderItem={({ item }) => <TemplateCard template={item} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  categoryBadge: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  gridContent: {
    padding: 16,
    gap: 14,
  },
  columnWrapper: {
    gap: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
