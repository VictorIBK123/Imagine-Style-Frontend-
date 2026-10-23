import { FeedPost, Creator } from '@/types/models';

const SAMPLE_CREATORS: Creator[] = [
  {
    id: 'creator-elena',
    name: 'Elena Rostova',
    username: 'elena_ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-marcus',
    name: 'Marcus Vance',
    username: 'marcus_v',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-amara',
    name: 'Amara Okafor',
    username: 'amara_art',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
    isVerified: true,
  },
  {
    id: 'creator-kenji',
    name: 'Kenji Sato',
    username: 'kenji_lens',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
    isVerified: false,
  },
  {
    id: 'creator-chloe',
    name: 'Chloé Dubois',
    username: 'chloe_couture',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-david',
    name: 'David Chen',
    username: 'dchen_creative',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
    isVerified: false,
  },
  {
    id: 'creator-zara',
    name: 'Zara Morales',
    username: 'zara_styles',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
    isVerified: true,
  },
  {
    id: 'creator-mateo',
    name: 'Mateo Silva',
    username: 'mateo_ai',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
    isVerified: true,
  },
  {
    id: 'creator-sophia',
    name: 'Sophia Lindqvist',
    username: 'sophia_nordic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'creator-kai',
    name: 'Kai Takahashi',
    username: 'kai_cyber',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
    isVerified: true,
  },
];

const SAMPLE_TEMPLATES = [
  { id: 'tpl-1', name: 'Neon Cyberpunk Executive', category: 'Corporate', isOfficial: true },
  { id: 'tpl-2', name: 'Amalfi Coast Vintage', category: 'Fashion', isOfficial: false },
  { id: 'tpl-3', name: 'Wall Street Minimalist', category: 'Corporate', isOfficial: true },
  { id: 'tpl-4', name: 'Tokyo Nightscape Bokeh', category: 'Creative', isOfficial: true },
  { id: 'tpl-5', name: 'Editorial Vogue Cover', category: 'Fashion', isOfficial: false },
  { id: 'tpl-6', name: 'Golden Hour Safari', category: 'Creative', isOfficial: false },
  { id: 'tpl-7', name: 'Haute Couture Monochrome', category: 'Fashion', isOfficial: true },
  { id: 'tpl-8', name: 'Kyoto Cherry Blossom', category: 'Traditional', isOfficial: false },
  { id: 'tpl-9', name: 'Emerald Gala Soirée', category: 'Birthday', isOfficial: false },
  { id: 'tpl-10', name: 'Nordic Crisp Winter', category: 'Corporate', isOfficial: true },
  { id: 'tpl-11', name: '90s Flash Grain Retro', category: 'Fashion', isOfficial: false },
  { id: 'tpl-12', name: 'Velvet Renaissance Noir', category: 'Creative', isOfficial: true },
];

const SAMPLE_PORTRAITS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=800&auto=format&fit=crop&q=80',
];

const CAPTIONS = [
  'Cyberpunk neon corporate portrait test. The lighting reflections came out incredible!',
  'Old Money Italian Riviera look for summer vibes. Highly recommend this preset.',
  'Studio executive headshot with dramatic Rembrandt rim lighting. Clean and authoritative.',
  'Shinjuku neon bokeh nightscape. The chromatic aberration highlights are subtle and sharp.',
  'High fashion editorial monochrome. Direct flash and deep velvet contrasts.',
  'Golden hour warmth across the terracotta courtyard. Dreamy soft-focus background.',
  'Moody film noir aesthetic shot on simulated 35mm Tri-X 400. Beautiful fine grain.',
  'Ceremonial kimono silk textures with soft pastel daylight. Super authentic fold physics.',
  'Black tie gala styling with deep emerald accents and luxury studio strobe lights.',
  'Minimalist Scandinavian knitwear portrait. 85mm prime lens depth of field.',
  '90s analog magazine aesthetic with authentic color bleeding and vintage flash vignette.',
  'Renaissance oil painting lighting palette blended with modern high-fashion styling.',
  'Crisp architectural background with clean daylight fill. Perfect for LinkedIn and press kits.',
  'Sunset rim light kissing the lapel. The neural styling nailed the natural skin texture.',
  'Subtle ambient lighting accents and soft velvet contrast for an evening celebration.',
  'Cybernetic holographic reflections across sleek satin fabric. 4K high resolution render.',
  'Vintage Kodachrome color science with rich warm greens and golden skin tones.',
  'Urban streetwear portrait with wet pavement reflections and dual-tone gels.',
  'Monochrome studio portrait focusing on razor-sharp eye reflection and soft shadow gradients.',
  'Futuristic glass atrium background with soft overcast natural lighting. Very natural look.',
];

/**
 * Generates 100 realistic, production-grade feed posts for testing database efficiency,
 * indexing performance, and on-demand pagination.
 */
export function generate100Posts(): FeedPost[] {
  const posts: FeedPost[] = [];
  const baseTime = Date.now();

  for (let i = 1; i <= 100; i++) {
    const creator = SAMPLE_CREATORS[(i - 1) % SAMPLE_CREATORS.length];
    const template = SAMPLE_TEMPLATES[(i - 1) % SAMPLE_TEMPLATES.length];
    const portraitUrl = SAMPLE_PORTRAITS[(i - 1) % SAMPLE_PORTRAITS.length];
    const caption = CAPTIONS[(i - 1) % CAPTIONS.length];

    // Compute realistic relative time and createdAt timestamp
    const minutesAgo = i * 25;
    let timeAgo = `${minutesAgo}m ago`;
    if (minutesAgo >= 1440) {
      timeAgo = `${Math.floor(minutesAgo / 1440)}d ago`;
    } else if (minutesAgo >= 60) {
      timeAgo = `${Math.floor(minutesAgo / 60)}h ago`;
    }

    const createdAt = new Date(baseTime - minutesAgo * 60000).toISOString();
    const likesCount = 45 + ((i * 37) % 850);
    const commentsCount = (i * 3) % 18;

    posts.push({
      id: `post-${i}`,
      creator,
      portraitUrl,
      caption: `${caption} #Style${template.category} #AIStyle${i}`,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        isOfficial: template.isOfficial,
        previewUrl: portraitUrl,
      },
      likesCount,
      commentsCount,
      timeAgo,
      isLiked: false,
      isSaved: false,
      createdAt,
    });
  }

  return posts;
}

export const SAMPLE_100_POSTS = generate100Posts();
