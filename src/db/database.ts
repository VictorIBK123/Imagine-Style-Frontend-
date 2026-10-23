import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import { CREATE_TABLES_SQL } from './schema';
import { GeneratedPhoto, FeedPost, TemplateItem, Creator, PostComment, AppNotification } from '@/types/models';
import { formatTimeAgo } from '@/utils/time';
import { logger } from '@/utils/logger';

const DB_NAME = 'imaginestyle.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton SQLite database instance, initializing schema if needed.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    // Graceful web fallback
    return null;
  }

  if (!dbInstance) {
    try {
      dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
      await dbInstance.execAsync('PRAGMA foreign_keys = ON;\n' + CREATE_TABLES_SQL);
      try {
        await dbInstance.execAsync(`ALTER TABLE offline_posts ADD COLUMN created_at TEXT;`);
      } catch {
        // already has column
      }
      logger.info('Database', 'Native SQLite database opened and schema verified');
    } catch (err) {
      logger.error('Database', 'Failed to initialize SQLite database', err);
      return null;
    }
  }

  return dbInstance;
}

/**
 * Initialize database schema on app start.
 */
export async function initDatabase(): Promise<void> {
  await getDatabase();
}

// -------------------------------------------------------------
// Generated Photos SQLite Store
// -------------------------------------------------------------

interface PhotoRow {
  id: string;
  uri: string;
  local_file_path: string | null;
  template_id: string | null;
  template_name: string | null;
  aspect_ratio: '4:5' | '1:1' | '9:16' | null;
  style_strength: 'Natural' | 'Balanced' | 'Intense' | null;
  resolution: '0.5K' | '1K' | '2K' | '4K' | null;
  additional_prompt: string | null;
  is_published: number;
  created_at: string;
}

export async function saveGeneratedPhotoToDb(photo: GeneratedPhoto): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO generated_photos (
        id, uri, local_file_path, template_id, template_name,
        aspect_ratio, style_strength, resolution, additional_prompt,
        is_published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        photo.id,
        photo.uri,
        photo.uri,
        photo.templateId || null,
        photo.templateName || null,
        photo.aspectRatio || '4:5',
        photo.styleStrength || 'Balanced',
        photo.resolution || '2K',
        photo.additionalPrompt || null,
        photo.isPublished ? 1 : 0,
        photo.createdAt,
      ]
    );
  } catch {
    // ignore db error
  }
}

export async function getGeneratedPhotosFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<GeneratedPhoto[]> {
  const { limit = 15, offset = 0 } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<PhotoRow>(
      `SELECT * FROM generated_photos ORDER BY created_at DESC LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    return rows.map((r) => ({
      id: r.id,
      uri: r.uri,
      templateId: r.template_id || undefined,
      templateName: r.template_name || undefined,
      aspectRatio: r.aspect_ratio || '4:5',
      styleStrength: r.style_strength || 'Balanced',
      resolution: r.resolution || '2K',
      additionalPrompt: r.additional_prompt || undefined,
      isPublished: r.is_published === 1,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function deleteGeneratedPhotoFromDb(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    await db.runAsync(`DELETE FROM generated_photos WHERE id = ?;`, [id]);
  } catch {
    // ignore db error
  }
}

// -------------------------------------------------------------
// Offline Posts Cache
// -------------------------------------------------------------

interface PostRow {
  id: string;
  creator_json: string;
  portrait_url: string;
  caption: string | null;
  template_id: string | null;
  likes_count: number;
  comments_count: number;
  time_ago: string | null;
  is_liked: number;
  is_saved: number;
  created_at?: string | null;
  // Joined columns from offline_templates
  template_name?: string | null;
  template_category?: string | null;
  template_preview_url?: string | null;
  template_is_official?: number | null;
}

export async function cachePostsToDb(posts: FeedPost[]): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    for (const post of posts) {
      if (post.template?.id) {
        // Ensure template row exists so foreign key doesn't fail
        await db.runAsync(
          `INSERT OR IGNORE INTO offline_templates (id, name, preview_url, creator_str, created_at)
           VALUES (?, ?, ?, ?, ?);`,
          [
            post.template.id,
            post.template.name,
            post.template.previewUrl || post.portraitUrl,
            'Official',
            new Date().toISOString(),
          ]
        );
      }

      await db.runAsync(
        `INSERT OR REPLACE INTO offline_posts (
          id, creator_json, portrait_url, caption, template_id,
          likes_count, comments_count, time_ago, is_liked, is_saved, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          post.id,
          JSON.stringify(post.creator),
          post.portraitUrl,
          post.caption || null,
          post.template?.id || null,
          post.likesCount,
          post.commentsCount,
          formatTimeAgo(post.createdAt || post.timeAgo, post.id),
          post.isLiked ? 1 : 0,
          post.isSaved ? 1 : 0,
          post.createdAt || new Date().toISOString(),
        ]
      );
    }
  } catch {
    // ignore cache write error
  }
}

export async function getCachedPostsFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<FeedPost[]> {
  const { limit = 15, offset = 0 } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<PostRow>(
      `SELECT 
        p.id,
        p.creator_json,
        p.portrait_url,
        p.caption,
        p.template_id,
        p.likes_count,
        p.comments_count,
        p.time_ago,
        p.is_liked,
        p.is_saved,
        p.created_at,
        t.name AS template_name,
        t.category AS template_category,
        t.preview_url AS template_preview_url,
        t.is_official AS template_is_official
      FROM offline_posts p
      LEFT JOIN offline_templates t ON p.template_id = t.id
      ORDER BY p.created_at DESC, p.rowid DESC
      LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    return rows.map((r) => {
      let creator: Creator = {
        id: 'creator-unknown',
        username: 'Creator',
        name: 'Creator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      try {
        creator = JSON.parse(r.creator_json);
      } catch {
        // fallback
      }

      const template = {
        id: r.template_id || 'tpl-custom',
        name: r.template_name || 'Studio Style',
        category: r.template_category || 'Creative',
        previewUrl: r.template_preview_url || undefined,
        isOfficial: r.template_is_official === 1,
      };

      return {
        id: r.id,
        creator,
        portraitUrl: r.portrait_url,
        caption: r.caption || '',
        template,
        likesCount: r.likes_count,
        commentsCount: r.comments_count,
        timeAgo: formatTimeAgo(r.created_at || r.time_ago, r.id),
        isLiked: r.is_liked === 1,
        isSaved: r.is_saved === 1,
        createdAt: r.created_at || undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function getSavedPostsFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<FeedPost[]> {
  const { limit = 15, offset = 0 } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<PostRow>(
      `SELECT 
        p.id,
        p.creator_json,
        p.portrait_url,
        p.caption,
        p.template_id,
        p.likes_count,
        p.comments_count,
        p.time_ago,
        p.is_liked,
        p.is_saved,
        p.created_at,
        t.name AS template_name,
        t.category AS template_category,
        t.preview_url AS template_preview_url,
        t.is_official AS template_is_official
      FROM offline_posts p
      LEFT JOIN offline_templates t ON p.template_id = t.id
      WHERE p.is_saved = 1
      ORDER BY p.created_at DESC, p.rowid DESC
      LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    return rows.map((r) => {
      let creator: Creator = {
        id: 'creator-unknown',
        username: 'Creator',
        name: 'Creator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      try {
        creator = JSON.parse(r.creator_json);
      } catch {
        // fallback
      }

      const template = {
        id: r.template_id || 'tpl-custom',
        name: r.template_name || 'Studio Style',
        category: r.template_category || 'Creative',
        previewUrl: r.template_preview_url || undefined,
        isOfficial: r.template_is_official === 1,
      };

      return {
        id: r.id,
        creator,
        portraitUrl: r.portrait_url,
        caption: r.caption || '',
        template,
        likesCount: r.likes_count,
        commentsCount: r.comments_count,
        timeAgo: formatTimeAgo(r.created_at || r.time_ago, r.id),
        isLiked: r.is_liked === 1,
        isSaved: true,
        createdAt: r.created_at || undefined,
      };
    });
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Offline Templates Cache
// -------------------------------------------------------------

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  preview_url: string;
  creator_str: string;
  is_official: number;
  usage_count: number;
  prompt_guidance: string | null;
  is_saved: number;
  created_at: string;
}

export async function cacheTemplatesToDb(templates: TemplateItem[]): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    for (const t of templates) {
      const creatorStr = typeof t.creator === 'string' ? t.creator : JSON.stringify(t.creator);

      await db.runAsync(
        `INSERT OR REPLACE INTO offline_templates (
          id, name, description, category, preview_url, creator_str,
          is_official, usage_count, prompt_guidance, is_saved, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          t.id,
          t.name,
          t.description || null,
          t.category || null,
          t.previewUrl,
          creatorStr,
          t.isOfficial ? 1 : 0,
          t.usageCount || 0,
          t.promptGuidance || null,
          t.isSaved ? 1 : 0,
          new Date().toISOString(),
        ]
      );
    }
  } catch {
    // ignore cache write error
  }
}

export async function getCachedTemplatesFromDb(
  options: { limit?: number; offset?: number; category?: string } = {}
): Promise<TemplateItem[]> {
  const { limit = 15, offset = 0, category } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    let query = `SELECT * FROM offline_templates`;
    const params: (string | number)[] = [];

    if (category && category !== 'All') {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY usage_count DESC LIMIT ? OFFSET ?;`;
    params.push(limit, offset);

    const rows = await db.getAllAsync<TemplateRow>(query, params);

    return rows.map((r) => {
      let creator: Creator | 'Official' = 'Official';
      if (r.creator_str) {
        if (r.creator_str === 'Official') {
          creator = 'Official';
        } else {
          try {
            creator = JSON.parse(r.creator_str);
          } catch {
            creator = 'Official';
          }
        }
      }

      return {
        id: r.id,
        name: r.name,
        description: r.description || '',
        category: r.category || 'General',
        previewUrl: r.preview_url,
        creator,
        isOfficial: r.is_official === 1,
        usageCount: r.usage_count,
        promptGuidance: r.prompt_guidance || undefined,
        isSaved: r.is_saved === 1,
      };
    });
  } catch {
    return [];
  }
}

export async function getSavedTemplatesFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<TemplateItem[]> {
  const { limit = 15, offset = 0 } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<TemplateRow>(
      `SELECT * FROM offline_templates WHERE is_saved = 1 ORDER BY usage_count DESC LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    return rows.map((r) => {
      let creator: Creator | 'Official' = 'Official';
      if (r.creator_str) {
        if (r.creator_str === 'Official') {
          creator = 'Official';
        } else {
          try {
            creator = JSON.parse(r.creator_str);
          } catch {
            creator = 'Official';
          }
        }
      }

      return {
        id: r.id,
        name: r.name,
        description: r.description || '',
        category: r.category || 'General',
        previewUrl: r.preview_url,
        creator,
        isOfficial: r.is_official === 1,
        usageCount: r.usage_count,
        promptGuidance: r.prompt_guidance || undefined,
        isSaved: true,
      };
    });
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Offline Comments SQLite Store
// -------------------------------------------------------------

interface CommentRow {
  id: string;
  post_id: string;
  author_json: string;
  content: string;
  time_ago: string | null;
  created_at: string;
}

export async function addCommentToDb(comment: PostComment): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    // Ensure parent post row exists so foreign key doesn't fail
    await db.runAsync(
      `INSERT OR IGNORE INTO offline_posts (id, creator_json, portrait_url, created_at)
       VALUES (?, ?, ?, ?);`,
      [
        comment.postId,
        JSON.stringify(comment.author),
        '',
        new Date().toISOString(),
      ]
    );

    await db.runAsync(
      `INSERT OR REPLACE INTO offline_comments (
        id, post_id, author_json, content, time_ago, created_at
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        comment.id,
        comment.postId,
        JSON.stringify(comment.author),
        comment.content,
        formatTimeAgo(comment.createdAt || comment.timeAgo, comment.id),
        comment.createdAt || new Date().toISOString(),
      ]
    );

    // Update comments_count in offline_posts
    await db.runAsync(
      `UPDATE offline_posts SET comments_count = comments_count + 1 WHERE id = ?;`,
      [comment.postId]
    );
  } catch {
    // Ignore db write error
  }
}

export async function getCommentsForPostFromDb(postId: string): Promise<PostComment[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<CommentRow>(
      `SELECT * FROM offline_comments WHERE post_id = ? ORDER BY created_at ASC;`,
      [postId]
    );

    return rows.map((r) => {
      let author: Creator = {
        id: 'creator-unknown',
        username: 'User',
        name: 'User',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      };
      try {
        author = JSON.parse(r.author_json);
      } catch {
        // fallback
      }

      return {
        id: r.id,
        postId: r.post_id,
        author,
        content: r.content,
        timeAgo: formatTimeAgo(r.created_at || r.time_ago, r.id),
        createdAt: r.created_at || undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function getAllCommentsFromDb(): Promise<Record<string, PostComment[]>> {
  const db = await getDatabase();
  if (!db) return {};

  try {
    const rows = await db.getAllAsync<CommentRow>(
      `SELECT * FROM offline_comments ORDER BY created_at ASC;`
    );

    const map: Record<string, PostComment[]> = {};
    for (const r of rows) {
      let author: Creator = {
        id: 'creator-unknown',
        username: 'User',
        name: 'User',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      };
      try {
        author = JSON.parse(r.author_json);
      } catch {
        // fallback
      }

      const comment: PostComment = {
        id: r.id,
        postId: r.post_id,
        author,
        content: r.content,
        timeAgo: formatTimeAgo(r.created_at || r.time_ago, r.id),
        createdAt: r.created_at || undefined,
      };

      if (!map[r.post_id]) {
        map[r.post_id] = [];
      }
      map[r.post_id].push(comment);
    }
    return map;
  } catch {
    return {};
  }
}

export async function seedInitialCommentsIfEmpty(
  initialComments: Record<string, PostComment[]>
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const countRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM offline_comments;`
    );
    if (countRow && countRow.count > 0) {
      return;
    }

    for (const [postId, commentsList] of Object.entries(initialComments)) {
      for (const comment of commentsList) {
        await db.runAsync(
          `INSERT OR IGNORE INTO offline_posts (id, creator_json, portrait_url, created_at)
           VALUES (?, ?, ?, ?);`,
          [
            postId,
            JSON.stringify(comment.author),
            '',
            new Date().toISOString(),
          ]
        );

        await db.runAsync(
          `INSERT OR REPLACE INTO offline_comments (
            id, post_id, author_json, content, time_ago, created_at
          ) VALUES (?, ?, ?, ?, ?, ?);`,
          [
            comment.id,
            comment.postId,
            JSON.stringify(comment.author),
            comment.content,
            formatTimeAgo(comment.createdAt || comment.timeAgo, comment.id),
            comment.createdAt || new Date().toISOString(),
          ]
        );
      }
    }
  } catch {
    // Ignore seed error
  }
}

// -------------------------------------------------------------
// Following Creators SQLite Store
// -------------------------------------------------------------

interface FollowingCreatorRow {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string | null;
  is_verified: number;
  is_following: number;
  created_at: string;
}

export async function getFollowingCreatorsFromDb(
  options: { limit?: number; offset?: number; onlyActive?: boolean } = {}
): Promise<Creator[]> {
  const { limit = 15, offset = 0, onlyActive = false } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    const query = onlyActive
      ? `SELECT * FROM following_creators WHERE is_following = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?;`
      : `SELECT * FROM following_creators ORDER BY created_at DESC LIMIT ? OFFSET ?;`;

    const rows = await db.getAllAsync<FollowingCreatorRow>(query, [limit, offset]);
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      name: r.name,
      avatar: r.avatar,
      bio: r.bio || undefined,
      isVerified: r.is_verified === 1,
      isFollowing: r.is_following === 1,
    }));
  } catch {
    return [];
  }
}

export async function toggleFollowCreatorInDb(creator: Creator): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    const existing = await db.getFirstAsync<FollowingCreatorRow>(
      `SELECT * FROM following_creators WHERE username = ?;`,
      [creator.username]
    );

    if (existing) {
      const nextFollowing = existing.is_following === 1 ? 0 : 1;
      await db.runAsync(
        `UPDATE following_creators SET is_following = ? WHERE username = ?;`,
        [nextFollowing, creator.username]
      );
      return nextFollowing === 1;
    } else {
      await db.runAsync(
        `INSERT INTO following_creators (id, username, name, avatar, bio, is_verified, is_following, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?);`,
        [
          creator.id || `creator-${creator.username}`,
          creator.username,
          creator.name,
          creator.avatar,
          creator.bio || null,
          creator.isVerified ? 1 : 0,
          new Date().toISOString(),
        ]
      );
      return true;
    }
  } catch {
    return false;
  }
}

export async function seedInitialFollowingIfEmpty(creators: Creator[]): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const countRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM following_creators;`
    );
    if (countRow && countRow.count > 0) return;

    for (const c of creators) {
      await db.runAsync(
        `INSERT OR REPLACE INTO following_creators (
          id, username, name, avatar, bio, is_verified, is_following, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          c.id || `creator-${c.username}`,
          c.username,
          c.name,
          c.avatar,
          c.bio || null,
          c.isVerified ? 1 : 0,
          c.isFollowing ? 1 : 0,
          new Date().toISOString(),
        ]
      );
    }
  } catch {
    // ignore
  }
}

export async function seedInitialPostsIfEmpty(initialPosts: FeedPost[]): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const countRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM offline_posts;`
    );
    if (countRow && countRow.count >= 100) return;

    const now = Date.now();
    for (let i = 0; i < initialPosts.length; i++) {
      const post = initialPosts[i];
      if (post.template?.id) {
        await db.runAsync(
          `INSERT OR IGNORE INTO offline_templates (id, name, preview_url, creator_str, created_at)
           VALUES (?, ?, ?, ?, ?);`,
          [
            post.template.id,
            post.template.name,
            post.template.previewUrl || post.portraitUrl,
            'Official',
            new Date().toISOString(),
          ]
        );
      }

      await db.runAsync(
        `INSERT OR IGNORE INTO offline_posts (
          id, creator_json, portrait_url, caption, template_id,
          likes_count, comments_count, time_ago, is_liked, is_saved, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          post.id,
          JSON.stringify(post.creator),
          post.portraitUrl,
          post.caption || null,
          post.template?.id || null,
          post.likesCount,
          post.commentsCount,
          formatTimeAgo(post.createdAt || post.timeAgo, post.id),
          post.isLiked ? 1 : 0,
          post.isSaved ? 1 : 0,
          post.createdAt || new Date(now - i * 60000).toISOString(),
        ]
      );
    }
  } catch {
    // ignore
  }
}

export async function seedInitialTemplatesIfEmpty(initialTemplates: TemplateItem[]): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const countRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM offline_templates;`
    );
    if (countRow && countRow.count >= 80) return;

    for (const t of initialTemplates) {
      const creatorStr = typeof t.creator === 'string' ? t.creator : JSON.stringify(t.creator);
      await db.runAsync(
        `INSERT OR IGNORE INTO offline_templates (
          id, name, description, category, preview_url, creator_str,
          is_official, usage_count, prompt_guidance, is_saved, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          t.id,
          t.name,
          t.description || null,
          t.category || null,
          t.previewUrl,
          creatorStr,
          t.isOfficial ? 1 : 0,
          t.usageCount || 0,
          t.promptGuidance || null,
          t.isSaved ? 1 : 0,
          new Date().toISOString(),
        ]
      );
    }
  } catch {
    // ignore
  }
}

export async function updatePostLikeInDb(
  postId: string,
  isLiked: boolean,
  likesCount: number
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(
      `UPDATE offline_posts SET is_liked = ?, likes_count = ? WHERE id = ?;`,
      [isLiked ? 1 : 0, likesCount, postId]
    );
  } catch {
    // ignore
  }
}

export async function updatePostSaveInDb(
  postId: string,
  isSaved: boolean
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(
      `UPDATE offline_posts SET is_saved = ? WHERE id = ?;`,
      [isSaved ? 1 : 0, postId]
    );
  } catch {
    // ignore
  }
}

export async function updateTemplateSaveInDb(
  templateId: string,
  isSaved: boolean
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(
      `UPDATE offline_templates SET is_saved = ? WHERE id = ?;`,
      [isSaved ? 1 : 0, templateId]
    );
  } catch {
    // ignore
  }
}

export async function deletePostFromDb(postId: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(`DELETE FROM offline_posts WHERE id = ?;`, [postId]);
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// Offline Notifications SQLite Store
// -------------------------------------------------------------

interface NotificationRow {
  id: string;
  type: string;
  user_json: string;
  target_title: string | null;
  time_ago: string | null;
  is_read: number;
  link_route: string | null;
  created_at: string;
}

export async function getNotificationsFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<AppNotification[]> {
  const { limit = 50, offset = 0 } = options;
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<NotificationRow>(
      `SELECT * FROM offline_notifications ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    return rows.map((r) => {
      let user = {
        name: 'User',
        username: 'user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      try {
        user = JSON.parse(r.user_json);
      } catch {
        // fallback
      }

      return {
        id: r.id,
        type: r.type as AppNotification['type'],
        user,
        targetTitle: r.target_title || undefined,
        timeAgo: formatTimeAgo(r.created_at || r.time_ago, r.id),
        isRead: r.is_read === 1,
        linkRoute: r.link_route || undefined,
        createdAt: r.created_at || undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function markNotificationAsReadInDb(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(`UPDATE offline_notifications SET is_read = 1 WHERE id = ?;`, [id]);
  } catch {
    // ignore
  }
}

export async function markAllNotificationsAsReadInDb(): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(`UPDATE offline_notifications SET is_read = 1;`);
  } catch {
    // ignore
  }
}

export async function addNotificationToDb(notification: AppNotification): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO offline_notifications (
        id, type, user_json, target_title, time_ago, is_read, link_route, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        notification.id,
        notification.type,
        JSON.stringify(notification.user),
        notification.targetTitle || null,
        formatTimeAgo(notification.createdAt || notification.timeAgo, notification.id),
        notification.isRead ? 1 : 0,
        notification.linkRoute || null,
        notification.createdAt || new Date().toISOString(),
      ]
    );
  } catch {
    // ignore
  }
}

export async function seedInitialNotificationsIfEmpty(
  initialNotifications: AppNotification[]
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const countRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM offline_notifications;`
    );
    if (countRow && countRow.count > 0) return;

    for (const n of initialNotifications) {
      await db.runAsync(
        `INSERT OR IGNORE INTO offline_notifications (
          id, type, user_json, target_title, time_ago, is_read, link_route, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          n.id,
          n.type,
          JSON.stringify(n.user),
          n.targetTitle || null,
          formatTimeAgo(n.createdAt || n.timeAgo, n.id),
          n.isRead ? 1 : 0,
          n.linkRoute || null,
          n.createdAt || new Date().toISOString(),
        ]
      );
    }
  } catch {
    // ignore
  }
}



