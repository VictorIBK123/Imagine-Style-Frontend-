export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isFollowing?: boolean;
  isVerified?: boolean;
}

export interface CurrentUser extends Creator {
  credits: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  phone?: string;
  age?: string;
  gender?: string;
  location?: string;
  website?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  author: Creator;
  content: string;
  timeAgo: string;
  createdAt?: string;
}

export interface FeedPost {
  id: string;
  creator: Creator;
  portraitUrl: string;
  caption: string;
  template: {
    id: string;
    name: string;
    category: string;
    previewUrl?: string;
    isOfficial?: boolean;
  };
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
  createdAt?: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  creator: Creator | 'Official';
  isOfficial: boolean;
  usageCount: number;
  isSaved: boolean;
  promptGuidance?: string;
  communityResults?: string[];
}

export interface GeneratedPhoto {
  id: string;
  uri: string;
  templateId?: string;
  templateName?: string;
  aspectRatio: '4:5' | '1:1' | '9:16';
  styleStrength: 'Natural' | 'Balanced' | 'Intense';
  resolution?: '0.5K' | '1K' | '2K' | '4K';
  additionalPrompt?: string;
  createdAt: string;
  isPublished: boolean;
}

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'template_use';
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  targetTitle?: string;
  timeAgo: string;
  isRead: boolean;
  linkRoute?: string;
  createdAt?: string;
}
