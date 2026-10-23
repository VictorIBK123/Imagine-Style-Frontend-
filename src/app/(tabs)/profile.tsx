import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Card, Badge, SegmentedControl, Modal, Input } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp, GeneratedPhoto, FeedPost } from '@/context/AppContext';

type ProfileSubSection = 'posts' | 'generated' | 'templates' | 'saved';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    currentUser,
    posts,
    templates,
    savedPosts,
    savedTemplates,
    generatedPhotos,
    publishPost,
    addCredits,
    updateProfile,
    openTemplateDetails,
    signOut,
    openAuthModal,
    showAlert,
    showConfirm,
    openImageViewer,
    loadMorePhotos,
    loadMoreSavedPosts,
    loadMoreSavedTemplates,
  } = useApp();

  const [activeSection, setActiveSection] = useState<ProfileSubSection>('posts');
  const [savedFilter, setSavedFilter] = useState<'posts' | 'templates'>('posts');

  // Edit Profile Modal State
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editBio, setEditBio] = useState(currentUser.bio || '');

  // Settings & Credits Modal State
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isCreditsTopUpVisible, setIsCreditsTopUpVisible] = useState(false);
  const [isCreditHistoryVisible, setIsCreditHistoryVisible] = useState(false);

  // Quick Publish from Private Portfolio State
  const [photoToPublish, setPhotoToPublish] = useState<GeneratedPhoto | null>(null);
  const [publishCaption, setPublishCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Filtered collections
  const userPosts = posts.filter((p) => p.creator.id === currentUser.id);
  const userTemplates = templates.filter(
    (t) => typeof t.creator === 'object' && t.creator.id === currentUser.id
  );

  // Handle Save Profile
  const handleSaveProfile = () => {
    if (!editName.trim()) {
      showAlert({
        title: 'Name Required',
        message: 'Please provide a display name.',
        type: 'warning',
      });
      return;
    }
    updateProfile({
      name: editName.trim(),
      username: editUsername.trim() || currentUser.username,
      bio: editBio.trim(),
    });
    setIsEditProfileVisible(false);
    showAlert({
      title: 'Profile Updated',
      message: 'Your profile details have been saved.',
      type: 'success',
    });
  };

  // Handle Credits Purchase simulation
  const handlePurchaseCredits = (amount: number, price: string) => {
    addCredits(amount);
    setIsCreditsTopUpVisible(false);
    showAlert({
      title: 'Credits Added! ⚡',
      message: `Successfully added ${amount} credits (${price}). Your new balance is ${currentUser.credits + amount} credits.`,
      type: 'success',
      icon: 'flash',
    });
  };

  // Handle Publishing private photo
  const handleConfirmPublish = () => {
    if (!photoToPublish) return;
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);
      publishPost(
        photoToPublish.uri,
        publishCaption.trim() || `Generated with ${photoToPublish.templateName || 'ImagineStyle'} ✨`,
        photoToPublish.templateId
      );
      setPhotoToPublish(null);
      setPublishCaption('');
      showAlert({
        title: 'Portrait Published!',
        message: 'Your photo is now live on the Home social feed.',
        type: 'success',
        buttons: [
          {
            text: 'Go to Feed',
            style: 'primary',
            onPress: () => router.push('/'),
          },
          { text: 'Stay Here', style: 'cancel' },
        ],
      });
    }, 500);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <Avatar
              uri={currentUser.avatar}
              name={currentUser.name}
              size="xl"
              isVerified={currentUser.isVerified}
            />

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{userPosts.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
              </View>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/followers', params: { type: 'followers' } })
                }
                style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {(currentUser.followersCount / 1000).toFixed(1)}k
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({ pathname: '/followers', params: { type: 'following' } })
                }
                style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{currentUser.followingCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
              </Pressable>
            </View>
          </View>

          {/* User Bio & Info */}
          <View style={styles.bioBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.displayName, { color: colors.text }]}>{currentUser.name}</Text>
              {currentUser.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.handleText, { color: colors.textSecondary }]}>
              @{currentUser.username}
            </Text>
            {currentUser.bio ? (
              <Text style={[styles.bioText, { color: colors.text }]}>{currentUser.bio}</Text>
            ) : null}
          </View>

          {/* Action Row: Credits Pill + Edit + Settings */}
          <View style={styles.headerActionsRow}>
            <Pressable
              onPress={() => router.push('/settings')}
              style={[styles.creditsBadge, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Text style={[styles.creditsValueText, { color: colors.text }]}>
                {currentUser.credits} Credits
              </Text>
              <View style={[styles.topUpPlusCircle, { backgroundColor: colors.text }]}>
                <Ionicons name="add" size={12} color={colors.background} />
              </View>
            </Pressable>

            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push('/edit-profile')}
              icon={<Ionicons name="create-outline" size={16} color={colors.text} />}>
              Edit Profile
            </Button>

            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push('/settings')}
              icon={<Ionicons name="settings-outline" size={16} color={colors.text} />}>
              Settings
            </Button>
          </View>
        </View>

        {/* Section Navigation Tabs */}
        <SegmentedControl
          variant="underline"
          options={[
            { value: 'posts', label: 'Posts', icon: 'grid', badge: userPosts.length },
            { value: 'generated', label: 'Private', icon: 'lock-closed', badge: generatedPhotos.length },
            { value: 'templates', label: 'Templates', icon: 'color-palette', badge: userTemplates.length },
            { value: 'saved', label: 'Saved', icon: 'bookmark', badge: savedPosts.length + savedTemplates.length },
          ]}
          value={activeSection}
          onChange={(val) => setActiveSection(val as ProfileSubSection)}
        />

        {/* TAB 1: USER'S PUBLISHED POSTS */}
        {activeSection === 'posts' && (
          <View style={styles.sectionBody}>
            {userPosts.length > 0 ? (
              <View style={[styles.postsGrid, isDesktop && styles.postsGridDesktop]}>
                {userPosts.map((post: FeedPost) => (
                  <Pressable
                    key={post.id}
                    onPress={() => router.push('/')}
                    style={[styles.postGridTile, isDesktop && styles.postGridTileDesktop]}>
                    <Image source={{ uri: post.portraitUrl }} style={styles.gridImg} />
                    <View style={styles.postTileOverlay}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="heart" size={14} color="#FFFFFF" />
                        <Text style={styles.overlayStatText}>{post.likesCount}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                        <Text style={styles.overlayStatText}>{post.commentsCount}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Card padding="lg" style={styles.emptyCard}>
                <Ionicons name="images-outline" size={44} color={colors.textSecondary} />
                <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No public posts yet</Text>
                <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
                  Generate studio portraits in the Create tab and publish them to appear in your public feed.
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => router.push('/create')}
                  icon={<Ionicons name="camera-outline" size={14} color="#FFFFFF" />}>
                  Create AI Portrait
                </Button>
              </Card>
            )}
          </View>
        )}

        {/* TAB 2: PRIVATE GENERATED PHOTOS */}
        {activeSection === 'generated' && (
          <View style={styles.sectionBody}>
            <Card padding="md" style={styles.privacyBanner}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.privacyBannerTitle, { color: colors.text }]}>
                  Private Creation Vault
                </Text>
                <Text style={[styles.privacyBannerSub, { color: colors.textSecondary }]}>
                  All portraits you generate are strictly private by default. You control what gets published.
                </Text>
              </View>
            </Card>

            {generatedPhotos.length > 0 ? (
              <View style={styles.generatedCardsList}>
                {generatedPhotos.map((photo) => (
                  <Card key={photo.id} padding="md" style={styles.generatedPhotoCard}>
                    <View style={styles.generatedPhotoRow}>
                      <Pressable
                        onPress={() =>
                          openImageViewer({
                            uri: photo.uri,
                            title: photo.templateName || 'Studio Portrait',
                            subtitle: `${photo.aspectRatio} • ${photo.styleStrength}`,
                          })
                        }>
                        <Image source={{ uri: photo.uri }} style={styles.generatedThumb} />
                      </Pressable>

                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.generatedStyleName, { color: colors.text }]} numberOfLines={1}>
                            {photo.templateName || 'Studio Portrait'}
                          </Text>
                          {photo.isPublished ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </View>

                        <Text style={[styles.generatedMetaText, { color: colors.textSecondary }]}>
                          Ratio: {photo.aspectRatio} • {photo.styleStrength} • {photo.createdAt}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                          {!photo.isPublished && (
                            <Button
                              variant="primary"
                              size="sm"
                              onPress={() => {
                                setPhotoToPublish(photo);
                                setPublishCaption('');
                              }}
                              icon={<Ionicons name="share-social" size={14} color="#FFFFFF" />}>
                              Publish to Feed
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() =>
                              showAlert({
                                title: 'Saved in HD',
                                message: 'Photo downloaded to your gallery.',
                                type: 'success',
                                icon: 'checkmark-circle',
                              })
                            }
                            icon={<Ionicons name="download-outline" size={14} color={colors.text} />}>
                            Save HD
                          </Button>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
                {generatedPhotos.length >= 15 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => loadMorePhotos?.(15)}
                    style={{ alignSelf: 'center', marginTop: 8 }}>
                    Load More Portraits
                  </Button>
                )}
              </View>
            ) : (
              <Card padding="lg" style={styles.emptyCard}>
                <Ionicons name="camera-outline" size={44} color={colors.textSecondary} />
                <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No generations yet</Text>
                <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
                  Pick a template, upload your selfie, and generate studio portraits in seconds.
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => router.push('/create')}
                  icon={<Ionicons name="camera-outline" size={14} color="#FFFFFF" />}>
                  Start Generating
                </Button>
              </Card>
            )}
          </View>
        )}

        {/* TAB 3: TEMPLATES CREATED BY USER */}
        {activeSection === 'templates' && (
          <View style={styles.sectionBody}>
            {userTemplates.length > 0 ? (
              <View style={styles.templatesList}>
                {userTemplates.map((tpl) => (
                  <Card key={tpl.id} padding="md" style={styles.userTemplateCard}>
                    <Pressable
                      onPress={() =>
                        openImageViewer({
                          uri: tpl.previewUrl,
                          title: tpl.name,
                          subtitle: `${tpl.category} Style`,
                        })
                      }>
                      <Image source={{ uri: tpl.previewUrl }} style={styles.userTemplateThumb} />
                    </Pressable>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.userTemplateName, { color: colors.text }]}>{tpl.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Badge variant="primary">{tpl.category}</Badge>
                        <Text style={[styles.userTemplateUsage, { color: colors.textSecondary }]}>
                          {tpl.usageCount.toLocaleString()} uses
                        </Text>
                      </View>
                    </View>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => openTemplateDetails(tpl.id)}>
                      View
                    </Button>
                  </Card>
                ))}
              </View>
            ) : (
              <Card padding="lg" style={styles.emptyCard}>
                <Ionicons name="color-wand-outline" size={44} color={colors.textSecondary} />
                <Text style={[styles.emptyCardTitle, { color: colors.text }]}>
                  You haven&apos;t created any templates yet
                </Text>
                <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
                  Design a signature portrait aesthetic with custom prompt recipes and share it with the creator community.
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => router.push('/create')}
                  icon={<Ionicons name="add" size={16} color="#FFFFFF" />}>
                  Create New Template
                </Button>
              </Card>
            )}
          </View>
        )}

        {/* TAB 4: SAVED BOOKMARKS */}
        {activeSection === 'saved' && (
          <View style={styles.sectionBody}>
            {/* Sub-Switch: Saved Posts vs Saved Templates */}
            <View style={styles.savedFilterRow}>
              <Pressable
                onPress={() => setSavedFilter('posts')}
                style={[
                  styles.savedFilterTab,
                  savedFilter === 'posts' && {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
                    borderColor: colors.text,
                  },
                ]}>
                <Text
                  style={[
                    styles.savedFilterTabText,
                    {
                      color: colors.text,
                      opacity: savedFilter === 'posts' ? 1 : 0.7,
                      fontWeight: savedFilter === 'posts' ? '700' : '500',
                    },
                  ]}>
                  Saved Posts ({savedPosts.length})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSavedFilter('templates')}
                style={[
                  styles.savedFilterTab,
                  savedFilter === 'templates' && {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
                    borderColor: colors.text,
                  },
                ]}>
                <Text
                  style={[
                    styles.savedFilterTabText,
                    {
                      color: colors.text,
                      opacity: savedFilter === 'templates' ? 1 : 0.7,
                      fontWeight: savedFilter === 'templates' ? '700' : '500',
                    },
                  ]}>
                  Saved Templates ({savedTemplates.length})
                </Text>
              </Pressable>
            </View>

            {savedFilter === 'posts' ? (
              savedPosts.length > 0 ? (
                <>
                  <View style={[styles.postsGrid, isDesktop && styles.postsGridDesktop]}>
                    {savedPosts.map((post) => (
                      <Pressable
                        key={post.id}
                        onPress={() => router.push('/')}
                        style={[styles.postGridTile, isDesktop && styles.postGridTileDesktop]}>
                        <Image source={{ uri: post.portraitUrl }} style={styles.gridImg} />
                      </Pressable>
                    ))}
                  </View>
                  {savedPosts.length >= 15 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => loadMoreSavedPosts?.(15)}
                      style={{ marginTop: 12, alignSelf: 'center' }}>
                      Load More Saved Posts
                    </Button>
                  )}
                </>
              ) : (
                <Card padding="lg" style={styles.emptyCard}>
                  <Ionicons name="bookmark-outline" size={40} color={colors.textSecondary} />
                  <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No saved posts</Text>
                  <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
                    Tap the bookmark icon on any portrait in the social feed to save it here.
                  </Text>
                </Card>
              )
            ) : savedTemplates.length > 0 ? (
              <View style={styles.templatesList}>
                {savedTemplates.map((tpl) => (
                  <Card key={tpl.id} padding="md" style={styles.userTemplateCard}>
                    <Image source={{ uri: tpl.previewUrl }} style={styles.userTemplateThumb} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.userTemplateName, { color: colors.text }]}>{tpl.name}</Text>
                      <Badge variant="primary">{tpl.category}</Badge>
                    </View>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => openTemplateDetails(tpl.id)}>
                      Try Style
                    </Button>
                  </Card>
                ))}
                {savedTemplates.length >= 15 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => loadMoreSavedTemplates?.(15)}
                    style={{ marginTop: 12, alignSelf: 'center' }}>
                    Load More Saved Templates
                  </Button>
                )}
              </View>
            ) : (
              <Card padding="lg" style={styles.emptyCard}>
                <Ionicons name="bookmark-outline" size={40} color={colors.textSecondary} />
                <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No saved templates</Text>
                <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
                  Bookmark templates from the catalogue to quickly try them anytime.
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* MODAL: Edit Profile */}
        <Modal
          visible={isEditProfileVisible}
          onClose={() => setIsEditProfileVisible(false)}
          title="Edit Profile">
          <View style={styles.modalContent}>
            <Input
              label="Display Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
            />
            <Input
              label="Username"
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="username (no spaces)"
            />
            <Input
              label="Bio"
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell other creators about your style..."
              multiline
            />
            <View style={styles.modalActions}>
              <Button variant="primary" size="lg" onPress={handleSaveProfile} fullWidth>
                Save Changes
              </Button>
              <Button variant="ghost" onPress={() => setIsEditProfileVisible(false)}>
                Cancel
              </Button>
            </View>
          </View>
        </Modal>

        {/* MODAL: Top Up Credits */}
        <Modal
          visible={isCreditsTopUpVisible}
          onClose={() => setIsCreditsTopUpVisible(false)}
          title="Top Up Studio Credits">
          <View style={styles.modalContent}>
            <View style={[styles.creditBalanceBanner, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.currentBalanceNum, { color: colors.text }]}>
                  {currentUser.credits} Credits
                </Text>
                <Text style={[styles.currentBalanceSub, { color: colors.textSecondary }]}>
                  Each AI portrait generation costs 5 credits
                </Text>
              </View>
            </View>

            <View style={styles.pricingPacksContainer}>
              <Pressable
                onPress={() => handlePurchaseCredits(50, '$4.99')}
                style={[styles.pricingPackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.packCreditsTitle, { color: colors.text }]}>50 Credits</Text>
                  <Text style={[styles.packCreditsSub, { color: colors.textSecondary }]}>10 Studio Portraits</Text>
                </View>
                <Badge variant="primary">$4.99</Badge>
              </Pressable>

              <Pressable
                onPress={() => handlePurchaseCredits(150, '$9.99')}
                style={[styles.pricingPackCard, { backgroundColor: colors.card, borderColor: colors.text, borderWidth: 1.5 }]}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.packCreditsTitle, { color: colors.text }]}>150 Credits</Text>
                    <Badge variant="success">Popular</Badge>
                  </View>
                  <Text style={[styles.packCreditsSub, { color: colors.textSecondary }]}>30 Studio Portraits</Text>
                </View>
                <Badge variant="primary">$9.99</Badge>
              </Pressable>

              <Pressable
                onPress={() => handlePurchaseCredits(500, '$24.99')}
                style={[styles.pricingPackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.packCreditsTitle, { color: colors.text }]}>500 Credits</Text>
                    <Badge variant="official">Best Value</Badge>
                  </View>
                  <Text style={[styles.packCreditsSub, { color: colors.textSecondary }]}>100 Studio Portraits</Text>
                </View>
                <Badge variant="primary">$24.99</Badge>
              </Pressable>
            </View>

            <Button variant="ghost" onPress={() => setIsCreditsTopUpVisible(false)}>
              Close
            </Button>
          </View>
        </Modal>

        {/* MODAL: Settings Sheet */}
        <Modal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
          title="Account Settings">
          <View style={styles.modalContent}>
            <Card padding="md" style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Credits & Billing</Text>
              <View style={styles.settingItemRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="flash" size={18} color={colors.primary} />
                  <Text style={[styles.settingItemText, { color: colors.text }]}>Available Balance</Text>
                </View>
                <Badge variant="primary">{currentUser.credits} Credits</Badge>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => {
                    setIsSettingsVisible(false);
                    setIsCreditsTopUpVisible(true);
                  }}
                  icon={<Ionicons name="add-circle-outline" size={14} color="#FFFFFF" />}>
                  Top Up Credits
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setIsCreditHistoryVisible(true);
                  }}
                  icon={<Ionicons name="receipt-outline" size={14} color={colors.text} />}>
                  Credit History
                </Button>
              </View>
            </Card>

            <Card padding="md" style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Preferences</Text>
              <View style={styles.settingItemRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="moon-outline" size={18} color={colors.text} />
                  <Text style={[styles.settingItemText, { color: colors.text }]}>Current Theme</Text>
                </View>
                <Badge variant="secondary">{isDark ? 'Dark Mode' : 'Light Mode'}</Badge>
              </View>

              <View style={styles.settingItemRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.text} />
                  <Text style={[styles.settingItemText, { color: colors.text }]}>Account Privacy</Text>
                </View>
                <Badge variant="success">Secured</Badge>
              </View>
            </Card>

            <Card padding="md" style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>About & Support</Text>
              <Pressable
                onPress={() =>
                  showAlert({
                    title: 'ImagineStyle',
                    message: 'Version 1.2.0 • Electric Indigo Edition',
                    icon: 'information-circle',
                  })
                }
                style={styles.settingItemRow}>
                <Text style={[styles.settingItemText, { color: colors.text }]}>App Version</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>v1.2.0</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  showAlert({
                    title: 'Support',
                    message: 'Contact support@imaginestyle.ai for assistance.',
                    icon: 'help-buoy-outline',
                  })
                }
                style={styles.settingItemRow}>
                <Text style={[styles.settingItemText, { color: colors.text }]}>Help & Community Support</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </Card>

            <View style={{ gap: 8 }}>
              <Button
                variant="outline"
                onPress={() => {
                  setIsSettingsVisible(false);
                  signOut();
                  openAuthModal();
                }}
                icon={<Ionicons name="log-out-outline" size={16} color={colors.text} />}>
                Sign Out
              </Button>

              <Button
                variant="danger"
                onPress={() => {
                  showConfirm({
                    title: 'Delete Account',
                    message:
                      'Are you sure you want to delete your ImagineStyle account? This action is permanent and will delete all your generated portraits, created templates, and published posts.',
                    confirmText: 'Delete Permanently',
                    destructive: true,
                    icon: 'trash-outline',
                    onConfirm: () => {
                      setIsSettingsVisible(false);
                      signOut();
                      showAlert({
                        title: 'Account Deleted',
                        message:
                          'Your account and all associated personal data have been completely deleted.',
                        type: 'info',
                      });
                      openAuthModal();
                    },
                  });
                }}
                icon={<Ionicons name="trash-outline" size={16} color="#FFFFFF" />}>
                Delete Account
              </Button>
            </View>
          </View>
        </Modal>

        {/* MODAL: Credit Transaction History (PRD §6 line 165) */}
        <Modal
          visible={isCreditHistoryVisible}
          onClose={() => setIsCreditHistoryVisible(false)}
          title="Credit Transaction History"
          subtitle={`Current Balance: ${currentUser.credits} Credits`}>
          <View style={{ gap: 12 }}>
            {[
              { id: 'tx-1', title: 'Creator Pro Pack (+100 Credits)', amount: '+100', type: 'credit', date: 'Today, 11:30 AM', price: '$9.99' },
              { id: 'tx-2', title: 'Studio Generation (Cyberpunk Executive)', amount: '-5', type: 'debit', date: 'Today, 10:15 AM' },
              { id: 'tx-3', title: 'Studio Generation (Founder Aesthetic)', amount: '-5', type: 'debit', date: 'Yesterday, 4:20 PM' },
              { id: 'tx-4', title: 'Welcome Onboarding Grant', amount: '+50', type: 'credit', date: '3 days ago', price: 'Free' },
              { id: 'tx-5', title: 'Studio Generation (Amalfi Coast)', amount: '-5', type: 'debit', date: '4 days ago' },
            ].map((tx) => (
              <View
                key={tx.id}
                style={[
                  styles.settingItemRow,
                  {
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: colors.backgroundElement,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.settingItemText, { color: colors.text, fontWeight: '700' }]}>
                    {tx.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {tx.date} {tx.price ? `• ${tx.price}` : ''}
                  </Text>
                </View>
                <Badge variant={tx.type === 'credit' ? 'success' : 'secondary'}>
                  {tx.amount}
                </Badge>
              </View>
            ))}

            <Button
              variant="ghost"
              onPress={() => setIsCreditHistoryVisible(false)}>
              Close
            </Button>
          </View>
        </Modal>

        {/* MODAL: Publish Private Photo to Feed */}
        <Modal
          visible={!!photoToPublish}
          onClose={() => setPhotoToPublish(null)}
          title="Publish Portrait to Social Feed">
          <View style={styles.modalContent}>
            {photoToPublish && (
              <Image source={{ uri: photoToPublish.uri }} style={styles.publishPreviewThumb} />
            )}

            <Input
              label="Caption"
              value={publishCaption}
              onChangeText={setPublishCaption}
              placeholder="Write a caption or describe your look..."
              multiline
            />

            <View style={styles.modalActions}>
              <Button
                variant="primary"
                size="lg"
                loading={isPublishing}
                onPress={handleConfirmPublish}
                icon={<Ionicons name="share-social" size={18} color="#FFFFFF" />}
                fullWidth>
                Publish to Home Feed
              </Button>
              <Button variant="ghost" onPress={() => setPhotoToPublish(null)}>
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  headerCard: {
    gap: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
  },
  bioBlock: {
    gap: 4,
  },
  displayName: {
    fontSize: 19,
    fontWeight: '800',
  },
  handleText: {
    fontSize: 13,
  },
  bioText: {
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 2,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  creditsValueText: {
    fontSize: 13,
    fontWeight: '800',
  },
  topUpPlusCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBody: {
    gap: 14,
    marginTop: 4,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  postsGridDesktop: {
    gap: 8,
  },
  postGridTile: {
    width: '32.5%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  postGridTileDesktop: {
    width: '32%',
  },
  gridImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postTileOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  overlayStatText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  privacyBannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  generatedCardsList: {
    gap: 10,
  },
  generatedPhotoCard: {
    borderRadius: 14,
  },
  generatedPhotoRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  generatedThumb: {
    width: 80,
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  generatedStyleName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  generatedMetaText: {
    fontSize: 12,
  },
  templatesList: {
    gap: 10,
  },
  userTemplateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  userTemplateThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  userTemplateName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userTemplateUsage: {
    fontSize: 12,
  },
  savedFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  savedFilterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  savedFilterTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 44,
    gap: 10,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyCardSub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  modalContent: {
    gap: 14,
  },
  modalActions: {
    gap: 8,
    marginTop: 6,
  },
  creditBalanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentBalanceNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  currentBalanceSub: {
    fontSize: 12,
  },
  pricingPacksContainer: {
    gap: 10,
  },
  pricingPackCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  packCreditsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  packCreditsSub: {
    fontSize: 12,
    marginTop: 2,
  },
  settingsSection: {
    gap: 10,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingItemText: {
    fontSize: 13,
  },
  publishPreviewThumb: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    resizeMode: 'cover',
  },
});
