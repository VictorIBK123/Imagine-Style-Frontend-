import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { FeedPost, TemplateItem } from '@/types/models';
import { cachePostsToDb, getCachedPostsFromDb, cacheTemplatesToDb, getCachedTemplatesFromDb } from '@/db/database';
import { useAppStore } from '@/store/useAppStore';

// Query Keys
export const QUERY_KEYS = {
  feed: ['feed'] as const,
  templates: ['templates'] as const,
  userPortraits: ['userPortraits'] as const,
};

/**
 * Hook to query feed posts with offline SQLite fallback
 */
export function useFeedPosts(initialFallbackPosts: FeedPost[]) {
  return useQuery<FeedPost[]>({
    queryKey: QUERY_KEYS.feed,
    queryFn: async () => {
      try {
        // Attempt network fetch from Supabase if table exists
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const mappedPosts: FeedPost[] = data.map((d: any) => ({
            id: d.id,
            creator: d.creator || {
              id: d.creator_id || 'creator-unknown',
              username: d.creator_username || 'Creator',
              name: d.creator_name || 'Creator',
              avatar: d.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            },
            portraitUrl: d.portrait_url || d.portraitUrl,
            caption: d.caption || '',
            template: d.template || {
              id: d.template_id || 'tpl-default',
              name: d.template_name || 'Studio Style',
              category: d.template_category || 'Creative',
              isOfficial: d.is_official ?? false,
            },
            likesCount: d.likes_count || 0,
            commentsCount: d.comments_count || 0,
            timeAgo: d.time_ago || 'Just now',
            isLiked: false,
            isSaved: false,
          }));

          // Sync into local SQLite database
          await cachePostsToDb(mappedPosts);
          return mappedPosts;
        }
      } catch {
        // Network or table missing, fallback to SQLite
      }

      // Check local SQLite offline cache
      const cached = await getCachedPostsFromDb();
      if (cached.length > 0) {
        return cached;
      }

      // Fallback to store initial posts & cache them
      await cachePostsToDb(initialFallbackPosts);
      return initialFallbackPosts;
    },
    initialData: initialFallbackPosts,
  });
}

/**
 * Hook to query catalogue templates with offline SQLite fallback
 */
export function useTemplatesList(initialFallbackTemplates: TemplateItem[]) {
  return useQuery<TemplateItem[]>({
    queryKey: QUERY_KEYS.templates,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('usage_count', { ascending: false });

        if (!error && data && data.length > 0) {
          const mappedTemplates: TemplateItem[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            category: d.category || 'General',
            previewUrl: d.preview_url || d.previewUrl,
            creator: d.creator || 'Community',
            isOfficial: d.is_official ?? false,
            usageCount: d.usage_count || 0,
            promptGuidance: d.prompt_guidance,
            isSaved: false,
          }));

          await cacheTemplatesToDb(mappedTemplates);
          return mappedTemplates;
        }
      } catch {
        // Fallback
      }

      const cached = await getCachedTemplatesFromDb();
      if (cached.length > 0) {
        return cached;
      }

      await cacheTemplatesToDb(initialFallbackTemplates);
      return initialFallbackTemplates;
    },
    initialData: initialFallbackTemplates,
  });
}

/**
 * Mutation for liking posts with optimistic updates and sync
 */
export function useLikePostMutation() {
  const queryClient = useQueryClient();
  const toggleLikeStore = useAppStore((state) => state.toggleLikePost);

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      // Update local Zustand store immediately
      toggleLikeStore(postId);

      // Attempt background network sync with Supabase
      try {
        await supabase.rpc('increment_like', { post_id: postId });
      } catch {
        // Handled silently
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed });
    },
  });
}
