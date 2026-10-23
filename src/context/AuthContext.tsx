import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { CurrentUser } from '@/types/models';

export interface AuthContextType {
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  isAuthModalVisible: boolean;
  signIn: (email?: string) => void;
  signOut: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateProfile: (profile: Partial<CurrentUser>) => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  incrementPostsCount: () => void;
}

const INITIAL_USER: CurrentUser = {
  id: 'user-me',
  name: 'Alex Rivera',
  username: 'alex_creator',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  bio: 'Digital portrait creator & AI stylist. Exploring futuristic corporate & haute couture looks ✨',
  isVerified: true,
  credits: 120,
  postsCount: 18,
  followersCount: 1420,
  followingCount: 380,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState<boolean>(false);

  const signIn = useCallback((email?: string) => {
    setIsAuthenticated(true);
    setIsAuthModalVisible(false);
    if (email) {
      setCurrentUser((prev) => ({
        ...prev,
        username: email.split('@')[0] || prev.username,
      }));
    }
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const openAuthModal = useCallback(() => {
    setIsAuthModalVisible(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalVisible(false);
  }, []);

  const updateProfile = useCallback((profile: Partial<CurrentUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...profile }));
  }, []);

  const addCredits = useCallback((amount: number) => {
    setCurrentUser((prev) => ({ ...prev, credits: prev.credits + amount }));
  }, []);

  const deductCredits = useCallback((amount: number): boolean => {
    let success = false;
    setCurrentUser((prev) => {
      if (prev.credits >= amount) {
        success = true;
        return { ...prev, credits: prev.credits - amount };
      }
      return prev;
    });
    return success;
  }, []);

  const incrementPostsCount = useCallback(() => {
    setCurrentUser((prev) => ({ ...prev, postsCount: prev.postsCount + 1 }));
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      isAuthModalVisible,
      signIn,
      signOut,
      openAuthModal,
      closeAuthModal,
      updateProfile,
      addCredits,
      deductCredits,
      incrementPostsCount,
    }),
    [
      currentUser,
      isAuthenticated,
      isAuthModalVisible,
      signIn,
      signOut,
      openAuthModal,
      closeAuthModal,
      updateProfile,
      addCredits,
      deductCredits,
      incrementPostsCount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
