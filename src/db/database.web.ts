import { GeneratedPhoto, FeedPost, TemplateItem, PostComment, Creator, AppNotification } from '@/types/models';
import { formatTimeAgo } from '@/utils/time';
import { logger } from '@/utils/logger';

/**
 * On Web, local SQLite C-native library is not supported directly.
 * Web uses window.localStorage as a local persistence layer,
 * matching SQLite's behavior so user actions survive page refreshes.
 */

const STORAGE_PREFIX = 'imaginestyle_db_';

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function initDatabase(): Promise<void> {
  logger.info('Database', 'Web storage persistence layer initialized (localStorage fallback)');
}

export async function saveGeneratedPhotoToDb(photo: GeneratedPhoto): Promise<void> {
  const photos = getStorage<GeneratedPhoto[]>('photos', []);
  const filtered = photos.filter((p) => p.id !== photo.id);
  setStorage('photos', [photo, ...filtered]);
}

export async function getGeneratedPhotosFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<GeneratedPhoto[]> {
  const { limit = 15, offset = 0 } = options;
  const photos = getStorage<GeneratedPhoto[]>('photos', []);
  return photos.slice(offset, offset + limit);
}

export async function deleteGeneratedPhotoFromDb(id: string): Promise<void> {
  const photos = getStorage<GeneratedPhoto[]>('photos', []);
  setStorage(
    'photos',
    photos.filter((p) => p.id !== id)
  );
}

export async function cachePostsToDb(posts: FeedPost[]): Promise<void> {
  const existing = getStorage<FeedPost[]>('posts', []);
  const map = new Map<string, FeedPost>();
  for (const p of posts) map.set(p.id, p);
  for (const p of existing) {
    if (!map.has(p.id)) map.set(p.id, p);
  }
  setStorage('posts', Array.from(map.values()));
}

export async function getCachedPostsFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<FeedPost[]> {
  const { limit = 15, offset = 0 } = options;
  const posts = getStorage<FeedPost[]>('posts', []);
  return posts.slice(offset, offset + limit).map((p) => ({
    ...p,
    timeAgo: formatTimeAgo(p.createdAt || p.timeAgo, p.id),
  }));
}

export async function getSavedPostsFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<FeedPost[]> {
  const { limit = 15, offset = 0 } = options;
  const posts = getStorage<FeedPost[]>('posts', []);
  const saved = posts.filter((p) => p.isSaved);
  return saved.slice(offset, offset + limit).map((p) => ({
    ...p,
    timeAgo: formatTimeAgo(p.createdAt || p.timeAgo, p.id),
  }));
}

export async function cacheTemplatesToDb(templates: TemplateItem[]): Promise<void> {
  const existing = getStorage<TemplateItem[]>('templates', []);
  const map = new Map<string, TemplateItem>();
  for (const t of templates) map.set(t.id, t);
  for (const t of existing) {
    if (!map.has(t.id)) map.set(t.id, t);
  }
  setStorage('templates', Array.from(map.values()));
}

export async function getCachedTemplatesFromDb(
  options: { limit?: number; offset?: number; category?: string } = {}
): Promise<TemplateItem[]> {
  const { limit = 15, offset = 0, category } = options;
  let templates = getStorage<TemplateItem[]>('templates', []);
  if (category && category !== 'All') {
    templates = templates.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }
  return templates.slice(offset, offset + limit);
}

export async function getSavedTemplatesFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<TemplateItem[]> {
  const { limit = 15, offset = 0 } = options;
  const templates = getStorage<TemplateItem[]>('templates', []);
  const saved = templates.filter((t) => t.isSaved);
  return saved.slice(offset, offset + limit);
}

export async function addCommentToDb(comment: PostComment): Promise<void> {
  const normalizedComment: PostComment = {
    ...comment,
    createdAt: comment.createdAt || new Date().toISOString(),
    timeAgo: formatTimeAgo(comment.createdAt || comment.timeAgo, comment.id),
  };
  const comments = getStorage<PostComment[]>('comments', []);
  setStorage('comments', [...comments.filter((c) => c.id !== normalizedComment.id), normalizedComment]);

  // Update comments count on post
  const posts = getStorage<FeedPost[]>('posts', []);
  setStorage(
    'posts',
    posts.map((p) => (p.id === comment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
  );
}

export async function getCommentsForPostFromDb(postId: string): Promise<PostComment[]> {
  const comments = getStorage<PostComment[]>('comments', []);
  return comments
    .filter((c) => c.postId === postId)
    .map((c) => ({
      ...c,
      timeAgo: formatTimeAgo(c.createdAt || c.timeAgo, c.id),
    }));
}

export async function getAllCommentsFromDb(): Promise<Record<string, PostComment[]>> {
  const comments = getStorage<PostComment[]>('comments', []);
  const map: Record<string, PostComment[]> = {};
  for (const c of comments) {
    if (!map[c.postId]) map[c.postId] = [];
    map[c.postId].push({
      ...c,
      timeAgo: formatTimeAgo(c.createdAt || c.timeAgo, c.id),
    });
  }
  return map;
}

export async function seedInitialCommentsIfEmpty(
  initialComments: Record<string, PostComment[]>
): Promise<void> {
  const existing = getStorage<PostComment[]>('comments', []);
  if (existing.length > 0) return;
  const all: PostComment[] = [];
  for (const list of Object.values(initialComments)) {
    all.push(...list);
  }
  setStorage('comments', all);
}

export async function getFollowingCreatorsFromDb(
  options: { limit?: number; offset?: number; onlyActive?: boolean } = {}
): Promise<Creator[]> {
  const { limit = 15, offset = 0, onlyActive = false } = options;
  let list = getStorage<Creator[]>('following', []);
  if (onlyActive) {
    list = list.filter((c) => c.isFollowing);
  }
  return list.slice(offset, offset + limit);
}

export async function toggleFollowCreatorInDb(creator: Creator): Promise<boolean> {
  const list = getStorage<Creator[]>('following', []);
  const existingIdx = list.findIndex((c) => c.username === creator.username);
  let nextState = true;
  if (existingIdx >= 0) {
    nextState = !list[existingIdx].isFollowing;
    list[existingIdx] = { ...list[existingIdx], isFollowing: nextState };
  } else {
    list.push({ ...creator, isFollowing: true });
    nextState = true;
  }
  setStorage('following', list);
  return nextState;
}

export async function seedInitialFollowingIfEmpty(creators: Creator[]): Promise<void> {
  const existing = getStorage<Creator[]>('following', []);
  if (existing.length > 0) return;
  setStorage('following', creators);
}

export async function seedInitialPostsIfEmpty(initialPosts: FeedPost[]): Promise<void> {
  const existing = getStorage<FeedPost[]>('posts', []);
  if (existing.length >= 100) return;
  const map = new Map<string, FeedPost>();
  for (const p of existing) map.set(p.id, p);
  for (const p of initialPosts) {
    if (!map.has(p.id)) map.set(p.id, p);
  }
  setStorage('posts', Array.from(map.values()));
}

export async function seedInitialTemplatesIfEmpty(initialTemplates: TemplateItem[]): Promise<void> {
  const existing = getStorage<TemplateItem[]>('templates', []);
  if (existing.length >= 80) return;
  const map = new Map<string, TemplateItem>();
  for (const t of existing) map.set(t.id, t);
  for (const t of initialTemplates) {
    if (!map.has(t.id)) map.set(t.id, t);
  }
  setStorage('templates', Array.from(map.values()));
}

export async function updatePostLikeInDb(
  postId: string,
  isLiked: boolean,
  likesCount: number
): Promise<void> {
  const posts = getStorage<FeedPost[]>('posts', []);
  setStorage(
    'posts',
    posts.map((p) => (p.id === postId ? { ...p, isLiked, likesCount } : p))
  );
}

export async function updatePostSaveInDb(postId: string, isSaved: boolean): Promise<void> {
  const posts = getStorage<FeedPost[]>('posts', []);
  setStorage(
    'posts',
    posts.map((p) => (p.id === postId ? { ...p, isSaved } : p))
  );
}

export async function updateTemplateSaveInDb(templateId: string, isSaved: boolean): Promise<void> {
  const templates = getStorage<TemplateItem[]>('templates', []);
  setStorage(
    'templates',
    templates.map((t) => (t.id === templateId ? { ...t, isSaved } : t))
  );
}

export async function deletePostFromDb(postId: string): Promise<void> {
  const posts = getStorage<FeedPost[]>('posts', []);
  setStorage(
    'posts',
    posts.filter((p) => p.id !== postId)
  );
}

export async function getNotificationsFromDb(
  options: { limit?: number; offset?: number } = {}
): Promise<AppNotification[]> {
  const { limit = 50, offset = 0 } = options;
  const notifications = getStorage<AppNotification[]>('notifications', []);
  return notifications.slice(offset, offset + limit).map((n) => ({
    ...n,
    timeAgo: formatTimeAgo(n.createdAt || n.timeAgo, n.id),
  }));
}

export async function markNotificationAsReadInDb(id: string): Promise<void> {
  const notifications = getStorage<AppNotification[]>('notifications', []);
  setStorage(
    'notifications',
    notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
  );
}

export async function markAllNotificationsAsReadInDb(): Promise<void> {
  const notifications = getStorage<AppNotification[]>('notifications', []);
  setStorage(
    'notifications',
    notifications.map((n) => ({ ...n, isRead: true }))
  );
}

export async function addNotificationToDb(notification: AppNotification): Promise<void> {
  const notifications = getStorage<AppNotification[]>('notifications', []);
  setStorage('notifications', [notification, ...notifications]);
}

export async function seedInitialNotificationsIfEmpty(
  initialNotifications: AppNotification[]
): Promise<void> {
  const existing = getStorage<AppNotification[]>('notifications', []);
  if (existing.length > 0) return;
  setStorage('notifications', initialNotifications);
}
