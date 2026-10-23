export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS offline_templates (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  preview_url TEXT NOT NULL,
  creator_str TEXT NOT NULL,
  is_official INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  prompt_guidance TEXT,
  is_saved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_posts (
  id TEXT PRIMARY KEY NOT NULL,
  creator_json TEXT NOT NULL,
  portrait_url TEXT NOT NULL,
  caption TEXT,
  template_id TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  time_ago TEXT,
  is_liked INTEGER DEFAULT 0,
  is_saved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (template_id) REFERENCES offline_templates(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS generated_photos (
  id TEXT PRIMARY KEY NOT NULL,
  uri TEXT NOT NULL,
  local_file_path TEXT,
  template_id TEXT,
  template_name TEXT,
  aspect_ratio TEXT,
  style_strength TEXT,
  resolution TEXT,
  additional_prompt TEXT,
  is_published INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL,
  author_json TEXT NOT NULL,
  content TEXT NOT NULL,
  time_ago TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES offline_posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS following_creators (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  bio TEXT,
  is_verified INTEGER DEFAULT 0,
  is_following INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_notifications (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  user_json TEXT NOT NULL,
  target_title TEXT,
  time_ago TEXT,
  is_read INTEGER DEFAULT 0,
  link_route TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_photos_created ON generated_photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_template_id ON offline_posts(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON offline_templates(category);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON offline_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_following_username ON following_creators(username);
CREATE INDEX IF NOT EXISTS idx_posts_is_saved ON offline_posts(is_saved);
CREATE INDEX IF NOT EXISTS idx_templates_is_saved ON offline_templates(is_saved);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON offline_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON offline_notifications(is_read);
`;
