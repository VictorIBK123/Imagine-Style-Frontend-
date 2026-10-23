import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AlertProvider, useAlert } from './AlertContext';
import { ImageViewerProvider, useImageViewer } from './ImageViewerContext';
import { useAppStore } from '@/store/useAppStore';
import { Creator } from '@/types/models';
import { router } from 'expo-router';

export * from '@/types/models';
export { useAppStore } from '@/store/useAppStore';
export { AuthProvider, useAuth } from './AuthContext';
export { AlertProvider, useAlert } from './AlertContext';
export { ImageViewerProvider, useImageViewer } from './ImageViewerContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <ImageViewerProvider>
        <AuthProvider>{children}</AuthProvider>
      </ImageViewerProvider>
    </AlertProvider>
  );
}

export function useApp() {
  const auth = useAuth();
  const alert = useAlert();
  const imageViewer = useImageViewer();
  const store = useAppStore();

  return {
    ...auth,
    ...alert,
    ...imageViewer,
    ...store,
    // Stack navigation wrappers
    openTemplateDetails: (templateId: string) => {
      store.openTemplateDetails(templateId);
      router.push({ pathname: '/template/[id]', params: { id: templateId } });
    },
    openCreatorProfile: (creator: Creator) => {
      store.openCreatorProfile(creator);
      router.push({ pathname: '/creator/[id]', params: { id: creator.id || creator.username } });
    },
    openAuthModal: () => {
      router.push('/auth/login');
    },
    openPostDetails: (postId: string) => {
      router.push({ pathname: '/post/[id]', params: { id: postId } });
    },
    // Wire publishPost to automatically increment auth.currentUser.postsCount
    publishPost: (portraitUrl: string, caption: string, templateId?: string) => {
      const post = store.publishPost(portraitUrl, caption, templateId, auth.currentUser);
      auth.incrementPostsCount();
      return post;
    },
    // Wire addGeneratedPhoto to deduct credits
    addGeneratedPhoto: (photo: {
      uri: string;
      templateId?: string;
      templateName?: string;
      aspectRatio?: '4:5' | '1:1' | '9:16';
      styleStrength?: 'Natural' | 'Balanced' | 'Intense';
      resolution?: '0.5K' | '1K' | '2K' | '4K';
      additionalPrompt?: string;
    }) => {
      auth.deductCredits(5);
      return store.addGeneratedPhoto(photo);
    },
    // Wire addTemplate to attribute to auth.currentUser
    addTemplate: (templateData: {
      name: string;
      description: string;
      category: string;
      previewUrl: string;
      promptGuidance?: string;
    }) => {
      return store.addTemplate(templateData, auth.currentUser);
    },
    // Wire addComment to use auth.currentUser if author is omitted
    addComment: (postId: string, content: string, author?: Creator) => {
      return store.addComment(postId, content, author || auth.currentUser);
    },
  };
}
