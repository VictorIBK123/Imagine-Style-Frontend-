import { create } from 'zustand';
import {
  saveGeneratedPhotoToDb,
  getGeneratedPhotosFromDb,
  addCommentToDb,
  getCommentsForPostFromDb,
  getCachedPostsFromDb,
  getSavedPostsFromDb,
  cachePostsToDb,
  getCachedTemplatesFromDb,
  getSavedTemplatesFromDb,
  cacheTemplatesToDb,
  getFollowingCreatorsFromDb,
  toggleFollowCreatorInDb,
  seedInitialFollowingIfEmpty,
  seedInitialPostsIfEmpty,
  seedInitialTemplatesIfEmpty,
  seedInitialCommentsIfEmpty,
  seedInitialNotificationsIfEmpty,
  getNotificationsFromDb,
  markNotificationAsReadInDb,
  markAllNotificationsAsReadInDb,
  updatePostLikeInDb,
  updatePostSaveInDb,
  updateTemplateSaveInDb,
  deletePostFromDb,
} from '@/db/database';
import { SAMPLE_100_POSTS } from '@/db/mockPosts';
import { SAMPLE_TEMPLATES_CATALOGUE } from '@/db/mockTemplates';
import { savePortraitToLocalStorage } from '@/storage/mediaStorage';
import { formatTimeAgo } from '@/utils/time';
import { logger } from '@/utils/logger';
import {
  FeedPost,
  TemplateItem,
  PostComment,
  GeneratedPhoto,
  AppNotification,
  Creator,
} from '@/types/models';

export interface AppStoreState {
  posts: FeedPost[];
  templates: TemplateItem[];
  savedPosts: FeedPost[];
  savedTemplates: TemplateItem[];
  comments: Record<string, PostComment[]>;
  generatedPhotos: GeneratedPhoto[];
  notifications: AppNotification[];
  followingCreators: Creator[];
  selectedTemplateDetail: TemplateItem | null;
  selectedCreatorProfile: Creator | null;

  // Actions
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleSaveTemplate: (templateId: string) => void;
  addComment: (postId: string, content: string, author?: Creator) => void;
  loadCommentsForPost: (postId: string) => Promise<void>;
  toggleFollowUser: (username: string) => void;
  loadMorePosts: (pageSize?: number) => Promise<boolean>;
  loadMoreTemplates: (pageSize?: number, category?: string) => Promise<boolean>;
  loadMorePhotos: (pageSize?: number) => Promise<boolean>;
  loadMoreSavedPosts: (pageSize?: number) => Promise<boolean>;
  loadMoreSavedTemplates: (pageSize?: number) => Promise<boolean>;
  loadInitialDataFromDb: () => Promise<void>;
  hidePost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  openTemplateDetails: (templateId: string) => void;
  closeTemplateDetails: () => void;
  openCreatorProfile: (creator: Creator) => void;
  closeCreatorProfile: () => void;
  publishPost: (
    portraitUrl: string,
    caption: string,
    templateId?: string,
    creator?: Creator
  ) => FeedPost;
  addGeneratedPhoto: (photo: {
    uri: string;
    templateId?: string;
    templateName?: string;
    aspectRatio?: '4:5' | '1:1' | '9:16';
    styleStrength?: 'Natural' | 'Balanced' | 'Intense';
    resolution?: '0.5K' | '1K' | '2K' | '4K';
    additionalPrompt?: string;
  }) => GeneratedPhoto;
  addTemplate: (
    templateData: {
      name: string;
      description: string;
      category: string;
      previewUrl: string;
      promptGuidance?: string;
    },
    creator?: Creator
  ) => TemplateItem;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

export const INITIAL_TEMPLATES: TemplateItem[] = SAMPLE_TEMPLATES_CATALOGUE;


export const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    creator: {
      id: 'creator-elena',
      name: 'Elena Rostova',
      username: 'elena_ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    caption: 'Cyberpunk neon corporate portrait test. The lighting reflections came out incredible!',
    template: {
      id: 'tpl-1',
      name: 'Neon Cyberpunk Executive',
      category: 'Corporate',
      isOfficial: true,
    },
    likesCount: 142,
    commentsCount: 3,
    timeAgo: '15m ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-2',
    creator: {
      id: 'creator-marcus',
      name: 'Marcus Vance',
      username: 'marcus_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    caption: 'Old Money Italian Riviera look for summer vibes. Highly recommend this preset.',
    template: {
      id: 'tpl-2',
      name: 'Amalfi Coast Vintage',
      category: 'Fashion',
      isOfficial: false,
    },
    likesCount: 389,
    commentsCount: 2,
    timeAgo: '1h ago',
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'post-3',
    creator: {
      id: 'user-me',
      name: 'Alex Rivera',
      username: 'alex_creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isFollowing: false,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    caption: 'Tested out Silicon Valley Founder style for my new pitch deck and LinkedIn headshot. Loving the subtle depth.',
    template: {
      id: 'tpl-4',
      name: 'Silicon Valley Founder',
      category: 'Corporate',
      isOfficial: true,
    },
    likesCount: 215,
    commentsCount: 3,
    timeAgo: '2h ago',
    isLiked: false,
    isSaved: true,
  },
  {
    id: 'post-4',
    creator: {
      id: 'creator-amara',
      name: 'Amara Okafor',
      username: 'amara_art',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    caption: 'Traditional Royal Ankara styled photoshoot generated in under 30 seconds. The golden embroidery came out super crisp.',
    template: {
      id: 'tpl-3',
      name: 'Royal Heritage Gold',
      category: 'Traditional',
      isOfficial: false,
    },
    likesCount: 612,
    commentsCount: 4,
    timeAgo: '3h ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-5',
    creator: {
      id: 'creator-kenji',
      name: 'Kenji Sato',
      username: 'kenji_lens',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80',
    caption: 'Clean Scandinavian editorial portraits with neutral earth tones. Simplicity is the ultimate sophistication.',
    template: {
      id: 'tpl-10',
      name: 'Nordic Minimalist Studio',
      category: 'Corporate',
      isOfficial: true,
    },
    likesCount: 478,
    commentsCount: 2,
    timeAgo: '4h ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-6',
    creator: {
      id: 'creator-chloe',
      name: 'Chloé Dubois',
      username: 'chloe_couture',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    caption: 'Parisian Haute Couture runway lighting. The drama and high-contrast shadows are unmatched.',
    template: {
      id: 'tpl-7',
      name: 'Parisian Runway Editorial',
      category: 'Fashion',
      isOfficial: false,
    },
    likesCount: 890,
    commentsCount: 5,
    timeAgo: '6h ago',
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'post-7',
    creator: {
      id: 'creator-david',
      name: 'David Chen',
      username: 'dchen_creative',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: false,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    caption: 'That direct flash 90s disposable camera mood. Perfect for birthday parties and festival memories.',
    template: {
      id: 'tpl-12',
      name: '90s Film Flash Polaroid',
      category: 'Birthday',
      isOfficial: false,
    },
    likesCount: 523,
    commentsCount: 3,
    timeAgo: '8h ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-8',
    creator: {
      id: 'creator-zara',
      name: 'Zara Morales',
      username: 'zara_styles',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    caption: 'Met Gala sculptural silhouette inspired by celestial architecture. Pure high-fashion art.',
    template: {
      id: 'tpl-5',
      name: 'Met Gala Avant-Garde',
      category: 'Fashion',
      isOfficial: false,
    },
    likesCount: 1044,
    commentsCount: 6,
    timeAgo: '11h ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-9',
    creator: {
      id: 'creator-marcus',
      name: 'Marcus Vance',
      username: 'marcus_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset rooftop candid shot. Soft rim lighting with ambient city dusk bokeh.',
    template: {
      id: 'tpl-11',
      name: 'Sunset Rooftop Romance',
      category: 'Couples',
      isOfficial: false,
    },
    likesCount: 712,
    commentsCount: 4,
    timeAgo: '14h ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-10',
    creator: {
      id: 'user-me',
      name: 'Alex Rivera',
      username: 'alex_creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isFollowing: false,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    caption: 'Celebrating convocation day with the Ivy League cap & gown preset. Stately university architecture in the back!',
    template: {
      id: 'tpl-6',
      name: 'Ivy League Graduation',
      category: 'Graduation',
      isOfficial: true,
    },
    likesCount: 341,
    commentsCount: 2,
    timeAgo: '18h ago',
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'post-11',
    creator: {
      id: 'creator-amara',
      name: 'Amara Okafor',
      username: 'amara_art',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
    caption: 'Emerald gala look with studio catchlights and deep jewel tones. Feels straight out of Vogue.',
    template: {
      id: 'tpl-9',
      name: 'Emerald Gala Soirée',
      category: 'Birthday',
      isOfficial: false,
    },
    likesCount: 894,
    commentsCount: 5,
    timeAgo: '1d ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-12',
    creator: {
      id: 'creator-kenji',
      name: 'Kenji Sato',
      username: 'kenji_lens',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    caption: 'Sun-drenched coastal wedding vibe. Warm natural breeze and effortless elegance.',
    template: {
      id: 'tpl-8',
      name: 'Golden Hour Coastal Wedding',
      category: 'Wedding',
      isOfficial: true,
    },
    likesCount: 654,
    commentsCount: 3,
    timeAgo: '1d ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-13',
    creator: {
      id: 'creator-mateo',
      name: 'Mateo Silva',
      username: 'mateo_ai',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    caption: 'Moody noir studio lighting with deep natural shadows. Generated with 85mm portrait lens parameter.',
    template: {
      id: 'tpl-10',
      name: 'Nordic Minimalist Studio',
      category: 'Corporate',
      isOfficial: true,
    },
    likesCount: 422,
    commentsCount: 2,
    timeAgo: '2d ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-14',
    creator: {
      id: 'creator-elena',
      name: 'Elena Rostova',
      username: 'elena_ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    caption: 'Prism laser lighting series, volume 2. Neon magenta paired with steel teal rim accents.',
    template: {
      id: 'tpl-1',
      name: 'Neon Cyberpunk Executive',
      category: 'Corporate',
      isOfficial: true,
    },
    likesCount: 780,
    commentsCount: 4,
    timeAgo: '2d ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-15',
    creator: {
      id: 'creator-david',
      name: 'David Chen',
      username: 'dchen_creative',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: false,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    caption: 'Vintage warm tones inspired by 70s cinema. Really happy with the color grading here.',
    template: {
      id: 'tpl-2',
      name: 'Amalfi Coast Vintage',
      category: 'Fashion',
      isOfficial: false,
    },
    likesCount: 310,
    commentsCount: 1,
    timeAgo: '3d ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-16',
    creator: {
      id: 'creator-chloe',
      name: 'Chloé Dubois',
      username: 'chloe_couture',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    caption: 'Silk draping and golden hour reflections. Fashion week runway ready.',
    template: {
      id: 'tpl-7',
      name: 'Parisian Runway Editorial',
      category: 'Fashion',
      isOfficial: false,
    },
    likesCount: 945,
    commentsCount: 6,
    timeAgo: '3d ago',
    isLiked: true,
    isSaved: false,
  },
  {
    id: 'post-17',
    creator: {
      id: 'user-me',
      name: 'Alex Rivera',
      username: 'alex_creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isFollowing: false,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    caption: 'Exploring classic tailoring with modern AI portrait synthesis. Clean, timeless, sharp.',
    template: {
      id: 'tpl-4',
      name: 'Silicon Valley Founder',
      category: 'Corporate',
      isOfficial: true,
    },
    likesCount: 560,
    commentsCount: 3,
    timeAgo: '4d ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-18',
    creator: {
      id: 'creator-zara',
      name: 'Zara Morales',
      username: 'zara_styles',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
      isVerified: true,
    },
    portraitUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    caption: 'Subtle ambient lighting accents and soft velvet contrast for an evening celebration.',
    template: {
      id: 'tpl-9',
      name: 'Emerald Gala Soirée',
      category: 'Birthday',
      isOfficial: false,
    },
    likesCount: 688,
    commentsCount: 2,
    timeAgo: '5d ago',
    isLiked: false,
    isSaved: false,
  },
];

const INITIAL_COMMENTS: Record<string, PostComment[]> = {
  'post-1': [
    {
      id: 'c-1',
      postId: 'post-1',
      author: {
        id: 'creator-marcus',
        name: 'Marcus Vance',
        username: 'marcus_v',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      content: 'The rim light on the jacket is stunning! Which base image did you use?',
      timeAgo: '12m ago',
    },
    {
      id: 'c-2',
      postId: 'post-1',
      author: {
        id: 'user-me',
        name: 'Alex Rivera',
        username: 'alex_creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      },
      content: 'Just tapped Try This Style, going to run this right now!',
      timeAgo: '8m ago',
    },
    {
      id: 'c-3',
      postId: 'post-1',
      author: {
        id: 'creator-elena',
        name: 'Elena Rostova',
        username: 'elena_ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      content: '@alex_creator Awesome! Make sure to use a front-facing portrait for optimal sharpness.',
      timeAgo: '5m ago',
    },
  ],
  'post-2': [
    {
      id: 'c-4',
      postId: 'post-2',
      author: {
        id: 'creator-amara',
        name: 'Amara Okafor',
        username: 'amara_art',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Major vintage summer vibes. The film grain looks so authentic.',
      timeAgo: '1h ago',
    },
    {
      id: 'c-5',
      postId: 'post-2',
      author: {
        id: 'creator-marcus',
        name: 'Marcus Vance',
        username: 'marcus_v',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Thank you @amara_art! That was the goal with this custom prompt.',
      timeAgo: '45m ago',
    },
  ],
  'post-3': [
    {
      id: 'c-6',
      postId: 'post-3',
      author: {
        id: 'creator-kenji',
        name: 'Kenji Sato',
        username: 'kenji_lens',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Very crisp and executive. Great contrast balance on the collar!',
      timeAgo: '1h ago',
    },
    {
      id: 'c-7',
      postId: 'post-3',
      author: {
        id: 'creator-marcus',
        name: 'Marcus Vance',
        username: 'marcus_v',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Solid work Alex. Perfect for professional branding.',
      timeAgo: '45m ago',
    },
    {
      id: 'c-8',
      postId: 'post-3',
      author: {
        id: 'user-me',
        name: 'Alex Rivera',
        username: 'alex_creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      },
      content: 'Thanks Marcus! Used the Balanced style strength setting.',
      timeAgo: '30m ago',
    },
  ],
  'post-4': [
    {
      id: 'c-9',
      postId: 'post-4',
      author: {
        id: 'user-me',
        name: 'Alex Rivera',
        username: 'alex_creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      },
      content: 'The gold embroidery detail is breathtaking!',
      timeAgo: '2h ago',
    },
    {
      id: 'c-10',
      postId: 'post-4',
      author: {
        id: 'creator-amara',
        name: 'Amara Okafor',
        username: 'amara_art',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Thank you @alex_creator! Took a few prompt iterations to get the thread texture right.',
      timeAgo: '1h ago',
    },
  ],
  'post-6': [
    {
      id: 'c-11',
      postId: 'post-6',
      author: {
        id: 'creator-zara',
        name: 'Zara Morales',
        username: 'zara_styles',
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Obsessed with the runway atmosphere here Chloé!',
      timeAgo: '4h ago',
    },
    {
      id: 'c-12',
      postId: 'post-6',
      author: {
        id: 'user-me',
        name: 'Alex Rivera',
        username: 'alex_creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      },
      content: 'Saved to my favorites. Will try this with an evening portrait.',
      timeAgo: '3h ago',
    },
  ],
};

const INITIAL_GENERATED_PHOTOS: GeneratedPhoto[] = [
  {
    id: 'gen-1',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    templateId: 'tpl-1',
    templateName: 'Neon Cyberpunk Executive',
    aspectRatio: '4:5',
    styleStrength: 'Balanced',
    createdAt: '1 hour ago',
    isPublished: false,
  },
  {
    id: 'gen-2',
    uri: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    templateId: 'tpl-4',
    templateName: 'Silicon Valley Founder',
    aspectRatio: '1:1',
    styleStrength: 'Natural',
    createdAt: 'Yesterday',
    isPublished: false,
  },
  {
    id: 'gen-3',
    uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    templateId: 'tpl-2',
    templateName: 'Amalfi Coast Vintage',
    aspectRatio: '4:5',
    styleStrength: 'Intense',
    createdAt: '3 days ago',
    isPublished: false,
  },
  {
    id: 'gen-4',
    uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    templateId: 'tpl-6',
    templateName: 'Ivy League Graduation',
    aspectRatio: '4:5',
    styleStrength: 'Balanced',
    createdAt: '4 days ago',
    isPublished: true,
  },
  {
    id: 'gen-5',
    uri: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80',
    templateId: 'tpl-10',
    templateName: 'Nordic Minimalist Studio',
    aspectRatio: '1:1',
    styleStrength: 'Natural',
    createdAt: '5 days ago',
    isPublished: false,
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'like',
    user: {
      name: 'Elena Rostova',
      username: 'elena_ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    targetTitle: 'Cyberpunk neon corporate portrait',
    timeAgo: '10m ago',
    isRead: false,
    linkRoute: '/',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'template_use',
    user: {
      name: 'David Chen',
      username: 'dchen_creative',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    },
    targetTitle: 'Neon Cyberpunk Executive template',
    timeAgo: '45m ago',
    isRead: false,
    linkRoute: '/templates',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'comment',
    user: {
      name: 'Amara Okafor',
      username: 'amara_art',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    targetTitle: 'Silicon Valley Founder headshot',
    timeAgo: '2h ago',
    isRead: false,
    linkRoute: '/',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'follow',
    user: {
      name: 'Marcus Vance',
      username: 'marcus_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    timeAgo: '1d ago',
    isRead: true,
    linkRoute: '/profile',
    createdAt: new Date(Date.now() - 1440 * 60000).toISOString(),
  },
  {
    id: 'notif-5',
    type: 'like',
    user: {
      name: 'Chloé Dubois',
      username: 'chloe_couture',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    targetTitle: 'Ivy League Graduation photoshoot',
    timeAgo: '1d ago',
    isRead: true,
    linkRoute: '/',
    createdAt: new Date(Date.now() - 1500 * 60000).toISOString(),
  },
];

const INITIAL_FOLLOWING_CREATORS: Creator[] = [
  {
    id: 'creator-marcus',
    name: 'Marcus Vance',
    username: 'marcus_v',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Photographer & AI visual artist. Exploring film aesthetics & Old Money summer styles.',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-elena',
    name: 'Elena Rostova',
    username: 'elena_ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Cyberpunk & futuristic studio portraits. Neon rim lighting enthusiast ⚡',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-amara',
    name: 'Amara Okafor',
    username: 'amara_art',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Celebrating African royal fashion & ceremonial golden textiles through AI artistry.',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-kenji',
    name: 'Kenji Sato',
    username: 'kenji_lens',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Minimalist Tokyo portraiture. Soft window light & natural organic textures.',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-chloe',
    name: 'Chloé Dubois',
    username: 'chloe_couture',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Parisian fashion designer bridging couture runway aesthetics and neural rendering.',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-david',
    name: 'David Chen',
    username: 'dchen_creative',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Vintage analog film lover. 35mm grain, direct flash, and retro nostalgia.',
    isFollowing: true,
    isVerified: false,
  },
  {
    id: 'creator-zara',
    name: 'Zara Morales',
    username: 'zara_styles',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
    bio: 'Gala evening wear, high jewelry, and opulent cinematic lighting.',
    isFollowing: false,
    isVerified: true,
  },
  {
    id: 'creator-mateo',
    name: 'Mateo Silva',
    username: 'mateo_ai',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'São Paulo street style meets dramatic studio noir. 85mm prime lens aesthetics.',
    isFollowing: false,
    isVerified: true,
  },
];
export const useAppStore = create<AppStoreState>()((set, get) => ({
  posts: SAMPLE_100_POSTS.slice(0, 15),
  templates: INITIAL_TEMPLATES.slice(0, 15),
  savedPosts: SAMPLE_100_POSTS.filter((p) => p.isSaved).slice(0, 15),
  savedTemplates: INITIAL_TEMPLATES.filter((t) => t.isSaved).slice(0, 15),
  comments: INITIAL_COMMENTS,
  generatedPhotos: INITIAL_GENERATED_PHOTOS.slice(0, 15),
  notifications: INITIAL_NOTIFICATIONS,
  followingCreators: INITIAL_FOLLOWING_CREATORS,
  selectedTemplateDetail: null,
  selectedCreatorProfile: null,

  toggleLikePost: (postId: string) => {
    let nextIsLiked = false;
    let nextLikesCount = 0;

    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          nextIsLiked = !post.isLiked;
          nextLikesCount = post.likesCount + (nextIsLiked ? 1 : -1);
          return {
            ...post,
            isLiked: nextIsLiked,
            likesCount: nextLikesCount,
          };
        }
        return post;
      }),
    }));

    updatePostLikeInDb(postId, nextIsLiked, nextLikesCount).catch(() => {});
    logger.action('Toggle Post Like', { postId, isLiked: nextIsLiked, likesCount: nextLikesCount });
  },

  toggleSavePost: (postId: string) => {
    let nextIsSaved = false;
    let targetPost: FeedPost | undefined;

    set((state) => {
      const updatedPosts = state.posts.map((post) => {
        if (post.id === postId) {
          nextIsSaved = !post.isSaved;
          targetPost = { ...post, isSaved: nextIsSaved };
          return targetPost;
        }
        return post;
      });

      if (!targetPost) {
        const found = state.savedPosts.find((p) => p.id === postId);
        if (found) {
          nextIsSaved = false;
          targetPost = { ...found, isSaved: false };
        }
      }

      const updatedSavedPosts = nextIsSaved
        ? targetPost && !state.savedPosts.some((p) => p.id === postId)
          ? [targetPost, ...state.savedPosts]
          : state.savedPosts
        : state.savedPosts.filter((p) => p.id !== postId);

      return {
        posts: updatedPosts,
        savedPosts: updatedSavedPosts,
      };
    });

    updatePostSaveInDb(postId, nextIsSaved).catch(() => {});
    logger.action('Toggle Post Save', { postId, isSaved: nextIsSaved });
  },

  toggleSaveTemplate: (templateId: string) => {
    let nextIsSaved = false;
    let targetTemplate: TemplateItem | undefined;

    set((state) => {
      const updatedTemplates = state.templates.map((tpl) => {
        if (tpl.id === templateId) {
          nextIsSaved = !tpl.isSaved;
          targetTemplate = { ...tpl, isSaved: nextIsSaved };
          return targetTemplate;
        }
        return tpl;
      });

      if (!targetTemplate) {
        const found = state.savedTemplates.find((t) => t.id === templateId);
        if (found) {
          nextIsSaved = false;
          targetTemplate = { ...found, isSaved: false };
        } else if (state.selectedTemplateDetail && state.selectedTemplateDetail.id === templateId) {
          nextIsSaved = !state.selectedTemplateDetail.isSaved;
          targetTemplate = { ...state.selectedTemplateDetail, isSaved: nextIsSaved };
        }
      }

      const updatedSelected =
        state.selectedTemplateDetail && state.selectedTemplateDetail.id === templateId
          ? { ...state.selectedTemplateDetail, isSaved: nextIsSaved }
          : state.selectedTemplateDetail;

      const updatedSavedTemplates = nextIsSaved
        ? targetTemplate && !state.savedTemplates.some((t) => t.id === templateId)
          ? [targetTemplate, ...state.savedTemplates]
          : state.savedTemplates
        : state.savedTemplates.filter((t) => t.id !== templateId);

      return {
        templates: updatedTemplates,
        selectedTemplateDetail: updatedSelected,
        savedTemplates: updatedSavedTemplates,
      };
    });

    updateTemplateSaveInDb(templateId, nextIsSaved).catch(() => {});
    logger.action('Toggle Template Save', { templateId, isSaved: nextIsSaved });
  },

  addComment: (postId: string, content: string, author?: Creator) => {
    if (!content.trim()) return;

    const commentAuthor: Creator = author || {
      id: 'user-me',
      name: 'Alex Rivera',
      username: 'alex_creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
    };

    const createdAt = new Date().toISOString();
    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      postId,
      author: commentAuthor,
      content: content.trim(),
      timeAgo: formatTimeAgo(createdAt),
      createdAt,
    };

    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: [...(state.comments[postId] || []), newComment],
      },
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post
      ),
    }));

    // Persist to SQLite
    addCommentToDb(newComment).catch(() => {});
    logger.action('Add Comment', { postId, commentId: newComment.id, author: commentAuthor.username });
  },

  loadCommentsForPost: async (postId: string) => {
    try {
      const dbComments = await getCommentsForPostFromDb(postId);
      if (dbComments && dbComments.length > 0) {
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: dbComments,
          },
        }));
      }
    } catch {
      // ignore
    }
  },

  toggleFollowUser: (username: string) => {
    const creator =
      get().followingCreators.find((c) => c.username === username) ||
      get().posts.find((p) => p.creator.username === username)?.creator;

    if (creator) {
      toggleFollowCreatorInDb(creator).catch(() => {});
    }
    logger.action('Toggle Follow User', { username });

    set((state) => {
      const posts = state.posts.map((post) => {
        if (post.creator.username === username) {
          const nextIsFollowing = !post.creator.isFollowing;
          return {
            ...post,
            creator: {
              ...post.creator,
              isFollowing: nextIsFollowing,
            },
          };
        }
        return post;
      });

      let followingCreators = state.followingCreators;
      const existingIndex = followingCreators.findIndex((c) => c.username === username);
      if (existingIndex >= 0) {
        followingCreators = followingCreators.map((c) =>
          c.username === username ? { ...c, isFollowing: !c.isFollowing } : c
        );
      } else if (creator) {
        followingCreators = [{ ...creator, isFollowing: true }, ...followingCreators];
      }

      return {
        posts,
        followingCreators,
        selectedCreatorProfile:
          state.selectedCreatorProfile && state.selectedCreatorProfile.username === username
            ? {
                ...state.selectedCreatorProfile,
                isFollowing: !state.selectedCreatorProfile.isFollowing,
              }
            : state.selectedCreatorProfile,
      };
    });
  },

  hidePost: (postId: string) => {
    logger.action('Hide Post from Feed', { postId });
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
    deletePostFromDb(postId).catch(() => {});
  },

  reportPost: (postId: string, _reason: string) => {
    logger.action('Report Post', { postId, reason: _reason });
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },

  openTemplateDetails: (templateId: string) => {
    const found = get().templates.find((t) => t.id === templateId);
    if (found) {
      set({ selectedTemplateDetail: found });
    }
  },

  closeTemplateDetails: () => {
    set({ selectedTemplateDetail: null });
  },

  openCreatorProfile: (creator: Creator) => {
    set({ selectedCreatorProfile: creator });
  },

  closeCreatorProfile: () => {
    set({ selectedCreatorProfile: null });
  },

  publishPost: (portraitUrl: string, caption: string, templateId?: string, creator?: Creator) => {
    const template = get().templates.find((t) => t.id === templateId);
    const author: Creator = creator || {
      id: 'user-me',
      name: 'Alex Rivera',
      username: 'alex_creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
    };

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      creator: author,
      portraitUrl,
      caption,
      template: template
        ? {
            id: template.id,
            name: template.name,
            category: template.category,
            isOfficial: template.isOfficial,
          }
        : {
            id: 'tpl-custom',
            name: 'Custom AI Studio',
            category: 'Creative',
            isOfficial: false,
          },
      likesCount: 0,
      commentsCount: 0,
      timeAgo: formatTimeAgo(new Date().toISOString()),
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
      generatedPhotos: state.generatedPhotos.map((photo) =>
        photo.uri === portraitUrl ? { ...photo, isPublished: true } : photo
      ),
    }));

    // Cache to SQLite
    cachePostsToDb([newPost]).catch(() => {});
    logger.action('Publish Post', { id: newPost.id, caption: newPost.caption, template: newPost.template?.name });

    return newPost;
  },

  addGeneratedPhoto: (photo) => {
    const createdAt = new Date().toISOString();
    const newPhoto: GeneratedPhoto = {
      id: `gen-${Date.now()}`,
      uri: photo.uri,
      templateId: photo.templateId,
      templateName: photo.templateName || 'Custom AI Style',
      aspectRatio: photo.aspectRatio || '4:5',
      styleStrength: photo.styleStrength || 'Balanced',
      resolution: photo.resolution || '2K',
      additionalPrompt: photo.additionalPrompt,
      createdAt,
      isPublished: false,
    };

    set((state) => ({
      generatedPhotos: [newPhoto, ...state.generatedPhotos],
    }));

    // Offline-first sync: Persist metadata record to SQLite DB
    saveGeneratedPhotoToDb(newPhoto).catch(() => {});
    logger.action('Save Generated Photo to Studio', { id: newPhoto.id, templateName: newPhoto.templateName, aspectRatio: newPhoto.aspectRatio });

    // Offline-first sync: Save image file to local device filesystem
    savePortraitToLocalStorage(photo.uri, newPhoto.id)
      .then((localUri) => {
        if (localUri && localUri !== newPhoto.uri) {
          set((state) => ({
            generatedPhotos: state.generatedPhotos.map((p) =>
              p.id === newPhoto.id ? { ...p, uri: localUri } : p
            ),
          }));
        }
      })
      .catch(() => {});

    return newPhoto;
  },

  addTemplate: (templateData, creator) => {
    const author: Creator = creator || {
      id: 'user-me',
      name: 'Alex Rivera',
      username: 'alex_creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
    };

    const newTemplate: TemplateItem = {
      id: `tpl-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      previewUrl: templateData.previewUrl,
      creator: author,
      isOfficial: false,
      usageCount: 1,
      isSaved: false,
      promptGuidance: templateData.promptGuidance,
      communityResults: [templateData.previewUrl],
    };

    set((state) => ({
      templates: [newTemplate, ...state.templates],
    }));

    // Cache to SQLite
    cacheTemplatesToDb([newTemplate]).catch(() => {});

    return newTemplate;
  },

  markNotificationAsRead: (id: string) => {
    logger.action('Mark Notification Read', { id });
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
    markNotificationAsReadInDb(id).catch(() => {});
  },

  markAllNotificationsAsRead: () => {
    logger.action('Mark All Notifications Read');
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    markAllNotificationsAsReadInDb().catch(() => {});
  },

  loadMorePosts: async (pageSize = 15) => {
    try {
      const currentOffset = get().posts.length;
      logger.waiting('Loading more posts from local DB...', { offset: currentOffset, pageSize });
      const nextBatch = await getCachedPostsFromDb({ limit: pageSize, offset: currentOffset });
      if (nextBatch.length > 0) {
        set((state) => ({
          posts: [
            ...state.posts,
            ...nextBatch.filter((np) => !state.posts.some((p) => p.id === np.id)),
          ],
        }));
        logger.info('Feed', `Loaded ${nextBatch.length} more posts from local DB`);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Feed', 'Error loading more posts from DB', err);
      return false;
    }
  },

  loadMoreTemplates: async (pageSize = 15, category?: string) => {
    try {
      const currentOffset = get().templates.length;
      logger.waiting('Loading more templates from local DB...', { offset: currentOffset, pageSize, category });
      const nextBatch = await getCachedTemplatesFromDb({
        limit: pageSize,
        offset: currentOffset,
        category,
      });
      if (nextBatch.length > 0) {
        set((state) => ({
          templates: [
            ...state.templates,
            ...nextBatch.filter((nt) => !state.templates.some((t) => t.id === nt.id)),
          ],
        }));
        logger.info('Templates', `Loaded ${nextBatch.length} more templates from local DB`);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Templates', 'Error loading more templates from DB', err);
      return false;
    }
  },

  loadMorePhotos: async (pageSize = 15) => {
    try {
      const currentOffset = get().generatedPhotos.length;
      const nextBatch = await getGeneratedPhotosFromDb({ limit: pageSize, offset: currentOffset });
      if (nextBatch.length > 0) {
        set((state) => ({
          generatedPhotos: [
            ...state.generatedPhotos,
            ...nextBatch.filter((np) => !state.generatedPhotos.some((p) => p.id === np.id)),
          ],
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  loadMoreSavedPosts: async (pageSize = 15) => {
    try {
      const currentOffset = get().savedPosts.length;
      const nextBatch = await getSavedPostsFromDb({ limit: pageSize, offset: currentOffset });
      if (nextBatch.length > 0) {
        set((state) => ({
          savedPosts: [
            ...state.savedPosts,
            ...nextBatch.filter((np) => !state.savedPosts.some((p) => p.id === np.id)),
          ],
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  loadMoreSavedTemplates: async (pageSize = 15) => {
    try {
      const currentOffset = get().savedTemplates.length;
      const nextBatch = await getSavedTemplatesFromDb({ limit: pageSize, offset: currentOffset });
      if (nextBatch.length > 0) {
        set((state) => ({
          savedTemplates: [
            ...state.savedTemplates,
            ...nextBatch.filter((nt) => !state.savedTemplates.some((t) => t.id === nt.id)),
          ],
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  loadInitialDataFromDb: async () => {
    try {
      logger.waiting('Initializing local database and seeding default collections if empty...');
      // Seed initial collections into SQLite if empty (mobile only)
      await seedInitialPostsIfEmpty(SAMPLE_100_POSTS);
      await seedInitialTemplatesIfEmpty(INITIAL_TEMPLATES);
      await seedInitialFollowingIfEmpty(INITIAL_FOLLOWING_CREATORS);
      await seedInitialCommentsIfEmpty(INITIAL_COMMENTS);
      await seedInitialNotificationsIfEmpty(INITIAL_NOTIFICATIONS);

      // Fetch first batch of items on demand from SQLite
      const [
        dbPosts,
        dbTemplates,
        dbPhotos,
        dbFollowing,
        dbSavedPosts,
        dbSavedTemplates,
        dbNotifications,
      ] = await Promise.all([
        getCachedPostsFromDb({ limit: 15, offset: 0 }),
        getCachedTemplatesFromDb({ limit: 15, offset: 0 }),
        getGeneratedPhotosFromDb({ limit: 15, offset: 0 }),
        getFollowingCreatorsFromDb({ limit: 15, offset: 0 }),
        getSavedPostsFromDb({ limit: 15, offset: 0 }),
        getSavedTemplatesFromDb({ limit: 15, offset: 0 }),
        getNotificationsFromDb({ limit: 50, offset: 0 }),
      ]);

      set((state) => ({
        posts: dbPosts.length > 0 ? dbPosts : state.posts,
        templates: dbTemplates.length > 0 ? dbTemplates : state.templates,
        generatedPhotos: dbPhotos.length > 0 ? dbPhotos : state.generatedPhotos,
        followingCreators: dbFollowing.length > 0 ? dbFollowing : state.followingCreators,
        savedPosts: dbSavedPosts.length > 0 ? dbSavedPosts : state.savedPosts,
        savedTemplates: dbSavedTemplates.length > 0 ? dbSavedTemplates : state.savedTemplates,
        notifications: dbNotifications.length > 0 ? dbNotifications : state.notifications,
      }));

      logger.info('Database', 'Local storage initialized successfully', {
        posts: dbPosts.length,
        templates: dbTemplates.length,
        photos: dbPhotos.length,
        saved: dbSavedPosts.length,
      });
    } catch (err) {
      logger.warn('Database', 'Fallback to in-memory initial data', err);
    }
  },
}));


