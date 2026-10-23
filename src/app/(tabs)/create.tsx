import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  useWindowDimensions,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button, Card, Badge, Input, Modal } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { logger } from '@/utils/logger';

type Mode = 'generate' | 'createTemplate';
type AspectRatio = '4:5' | '1:1' | '9:16';
type StyleStrength = 'Natural' | 'Balanced' | 'Intense';
type Resolution = '0.5K' | '1K' | '2K' | '4K';

interface SamplePhoto {
  id: string;
  name: string;
  uri: string;
}

const SAMPLE_SELFIES: SamplePhoto[] = [
  {
    id: 's-1',
    name: 'Natural Studio',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 's-2',
    name: 'Outdoor Sunlight',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 's-3',
    name: 'Warm Portrait',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 's-4',
    name: 'Executive Smile',
    uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
  },
];

const SAMPLE_STYLE_COVERS: SamplePhoto[] = [
  {
    id: 'c-1',
    name: 'Vintage Noir',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-2',
    name: 'Golden Hour Glow',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-3',
    name: 'Neon Cyberpunk',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-4',
    name: 'Editorial Vogue',
    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  },
];

const TEMPLATE_CATEGORIES = [
  'Corporate',
  'Fashion',
  'Traditional',
  'Creative',
  'Birthday',
  'Couples',
  'Graduation',
  'Wedding',
  'Artistic',
  'Casual',
];

const PROMPT_INSPIRATIONS = [
  'Golden Hour Lighting',
  'Cinematic Rim Light',
  '35mm Film Grain',
  'Soft Directional Sunlight',
  'Clean Minimalist Studio',
  'Executive Black Blazer',
];

export default function CreateScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { height } = useWindowDimensions();

  const params = useLocalSearchParams<{
    mode?: 'generate' | 'createTemplate';
    templateId?: string;
    templateName?: string;
    step?: string;
  }>();

  const {
    templates,
    currentUser,
    addTemplate,
    generatedPhotos,
    showAlert,
    showConfirm,
    openImageViewer,
  } = useApp();

  // Mode: generate vs createTemplate
  const [mode, setMode] = useState<Mode>(
    params.mode === 'createTemplate' ? 'createTemplate' : 'generate'
  );

  // Stepper: 1: Upload, 2: Output Config (for generate); 1: Image, 2: Info (for template)
  const [genStep, setGenStep] = useState<1 | 2>(1);
  const [tplStep, setTplStep] = useState<1 | 2>(1);

  // History modal
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // Flow A: Generation States
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    params.templateId || templates[0]?.id || 'tpl-1'
  );
  const [selfieUris, setSelfieUris] = useState<string[]>([
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  ]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [styleStrength, setStyleStrength] = useState<StyleStrength>('Balanced');
  const [resolution, setResolution] = useState<Resolution>('2K');
  const [enhanceFace, setEnhanceFace] = useState(true);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  // Flow B: Template Creation States
  const [newTemplateImage, setNewTemplateImage] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Fashion');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [templateSubmitted, setTemplateSubmitted] = useState(false);

  // Synchronize incoming params
  const [prevTemplateId, setPrevTemplateId] = useState<string | undefined>(params.templateId);
  if (params.templateId && params.templateId !== prevTemplateId) {
    setPrevTemplateId(params.templateId);
    setSelectedTemplateId(params.templateId);
    setMode('generate');
    setGenStep(1);
  }

  const [prevMode, setPrevMode] = useState<string | undefined>(params.mode);
  if (params.mode && params.mode !== prevMode) {
    setPrevMode(params.mode);
    setMode(params.mode === 'createTemplate' ? 'createTemplate' : 'generate');
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const activeHeroImage = selfieUris[activePhotoIndex] || selfieUris[0] || null;

  // Image Picking
  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: 'Permission Required',
          message: 'Please grant photo library access to upload your portrait.',
          type: 'warning',
          icon: 'images-outline',
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: Math.max(1, 5 - selfieUris.length),
        aspect: aspectRatio === '4:5' ? [4, 5] : aspectRatio === '1:1' ? [1, 1] : [9, 16],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets.map((a) => a.uri);
        setSelfieUris((prev) => {
          const next = [...prev, ...picked].slice(0, 5);
          setActivePhotoIndex(Math.max(0, next.length - 1));
          return next;
        });
        logger.action('user_uploaded_portraits', { count: picked.length });
      }
    } catch {
      showAlert({
        title: 'Image Picker',
        message: 'Unable to open gallery. You can pick a sample portrait below.',
        type: 'info',
      });
    }
  };

  const takeSelfie = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: 'Permission Required',
          message: 'Please grant camera access to take a selfie.',
          type: 'warning',
          icon: 'camera-outline',
        });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: aspectRatio === '4:5' ? [4, 5] : aspectRatio === '1:1' ? [1, 1] : [9, 16],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setSelfieUris((prev) => {
          const next = [...prev, uri].slice(0, 5);
          setActivePhotoIndex(next.length - 1);
          return next;
        });
        logger.action('user_took_selfie');
      }
    } catch {
      showAlert({
        title: 'Camera Unavailable',
        message: 'Camera access is not available. Please choose a photo from the gallery.',
        type: 'info',
      });
    }
  };

  const handlePickCoverImage = async (useCamera = false) => {
    try {
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showAlert({
            title: 'Permission Required',
            message: 'Please grant camera access to take a template photo.',
            type: 'warning',
            icon: 'camera-outline',
          });
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.9,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setNewTemplateImage(result.assets[0].uri);
          logger.action('template_cover_captured');
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          showAlert({
            title: 'Permission Required',
            message: 'Please grant photo library access to upload a template image.',
            type: 'warning',
            icon: 'images-outline',
          });
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.9,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setNewTemplateImage(result.assets[0].uri);
          logger.action('template_cover_picked');
        }
      }
    } catch {
      showAlert({
        title: 'Image Picker',
        message: 'Unable to load photo.',
        type: 'info',
      });
    }
  };

  const removePhoto = (index: number) => {
    setSelfieUris((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (activePhotoIndex >= next.length) {
        setActivePhotoIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  // Launch Synthesis
  const startGeneration = () => {
    if (selfieUris.length === 0) {
      showAlert({
        title: 'Upload Portrait',
        message: 'Please upload or select at least one portrait first.',
        type: 'warning',
        icon: 'person-outline',
      });
      return;
    }
    if (currentUser.credits < 5) {
      showConfirm({
        title: 'Insufficient Credits',
        message: 'You need 5 credits to generate a studio portrait. Would you like to top up credits?',
        confirmText: 'Get Credits',
        icon: 'flash',
        onConfirm: () => router.push('/settings'),
      });
      return;
    }

    logger.action('start_generation_requested', {
      templateId: selectedTemplate?.id,
      aspectRatio,
      resolution,
      styleStrength,
      photosCount: selfieUris.length,
    });

    router.push({
      pathname: '/generating',
      params: {
        selfieUris: JSON.stringify(selfieUris),
        selfieUri: selfieUris[0] || '',
        templateId: selectedTemplate?.id || '',
        templateName: selectedTemplate?.name || 'Studio Aesthetic',
        templatePreview: selectedTemplate?.previewUrl || '',
        aspectRatio,
        styleStrength,
        resolution,
        additionalPrompt: additionalPrompt.trim() || '',
      },
    });
  };

  // Submit Template
  const handleSubmitTemplate = () => {
    if (!newTemplateImage) {
      showAlert({
        title: 'Template Image Required',
        message: 'Please upload an image that will serve as the cover for this style.',
        type: 'warning',
        icon: 'image-outline',
      });
      return;
    }

    if (!newTemplateName.trim()) {
      showAlert({
        title: 'Template Title Required',
        message: 'Please provide a title for your custom style template.',
        type: 'warning',
        icon: 'text-outline',
      });
      return;
    }

    addTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || 'A signature portrait style crafted by creator.',
      category: newTemplateCategory || 'General',
      previewUrl: newTemplateImage,
      promptGuidance: `${newTemplateName.trim()} studio lighting and aesthetic.`,
    });

    logger.action('template_published', { name: newTemplateName.trim(), category: newTemplateCategory });
    setTemplateSubmitted(true);
  };

  // Dynamic preview height so it fills the screen generously on mobile while keeping controls accessible
  const heroPreviewHeight = Math.min(height * 0.44, 350);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* ============================================================ */}
        {/* MODE: GENERATE AI PHOTO                                     */}
        {/* ============================================================ */}
        {mode === 'generate' && (
          <View style={styles.flowWrapper}>
            {/* ----------------- STEP 1: UPLOAD PORTRAITS ----------------- */}
            {genStep === 1 && (
              <View style={styles.stepOneContainer}>
                {/* Step 1 Header */}
                <View style={styles.navHeaderRow}>
                  {/* Template Picker Pill */}
                  <Pressable
                    onPress={() => router.push('/(tabs)/templates')}
                    style={[
                      styles.templatePill,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}>
                    {selectedTemplate?.previewUrl ? (
                      <Image
                        source={{ uri: selectedTemplate.previewUrl }}
                        style={styles.templatePillThumb}
                      />
                    ) : (
                      <Ionicons name="sparkles" size={14} color="#3B82F6" />
                    )}
                    <View style={{ maxWidth: 140 }}>
                      <Text style={[styles.templatePillName, { color: colors.text }]} numberOfLines={1}>
                        {selectedTemplate?.name || 'Select Style'}
                      </Text>
                    </View>
                    <Ionicons name="swap-horizontal" size={14} color={colors.textSecondary} />
                  </Pressable>

                  {/* Step Progress Pill */}
                  <View
                    style={[
                      styles.stepProgressBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}>
                    <Text style={[styles.stepProgressText, { color: colors.text }]}>
                      Step 1 of 2
                    </Text>
                  </View>

                  {/* History Action */}
                  <Pressable
                    hitSlop={8}
                    onPress={() => setIsHistoryModalVisible(true)}
                    accessibilityLabel="Generation History"
                    style={[
                      styles.iconHeaderBtn,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}>
                    <Ionicons name="time-outline" size={18} color={colors.text} />
                  </Pressable>
                </View>

                {/* Hero Preview: Almost Covering the Entire Screen */}
                <View style={[styles.heroPreviewCard, { height: heroPreviewHeight }]}>
                  {activeHeroImage ? (
                    <View style={styles.heroImageContainer}>
                      <Image
                        source={{ uri: activeHeroImage }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />

                      {/* Top Badges */}
                      <View style={styles.heroTopOverlay}>
                        <View style={styles.heroCountBadge}>
                          <Ionicons name="image-outline" size={12} color="#FFFFFF" />
                          <Text style={styles.heroCountText}>
                            Photo {activePhotoIndex + 1} of {selfieUris.length}
                          </Text>
                        </View>

                        <Pressable
                          hitSlop={10}
                          onPress={() => removePhoto(activePhotoIndex)}
                          style={styles.heroDeleteBtn}>
                          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        </Pressable>
                      </View>

                      {/* Bottom Overlay Info */}
                      <View style={[styles.heroBottomOverlay, { justifyContent: 'flex-end' }]}>
                        <Pressable
                          hitSlop={8}
                          onPress={() => openImageViewer(activeHeroImage)}
                          style={styles.heroExpandBtn}>
                          <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    /* Empty Hero State */
                    <View
                      style={[
                        styles.heroEmptyDropzone,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                        <Ionicons name="camera-outline" size={36} color="#3B82F6" />
                      </View>
                      <Text style={[styles.emptyDropTitle, { color: colors.text }]}>
                        Upload Your Portrait
                      </Text>
                      <Text style={[styles.emptyDropSub, { color: colors.textSecondary }]}>
                        Front-facing portraits with clear lighting work best. Upload up to 5 photos.
                      </Text>

                      <View style={styles.emptyButtonsRow}>
                        <Button
                          variant="primary"
                          size="md"
                          icon={<Ionicons name="images-outline" size={16} color="#FFFFFF" />}
                          onPress={pickFromGallery}>
                          Choose from Gallery
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          icon={<Ionicons name="camera-outline" size={16} color={colors.text} />}
                          onPress={takeSelfie}>
                          Take Selfie
                        </Button>
                      </View>
                    </View>
                  )}
                </View>

                {/* Horizontal Thumbnails List & Add Button */}
                <View style={styles.bottomListArea}>
                  <View style={styles.bottomListHeader}>
                    <Text style={[styles.bottomListLabel, { color: colors.text }]}>
                      Selected Portraits ({selfieUris.length}/5)
                    </Text>
                    <Text style={[styles.bottomListHint, { color: colors.textSecondary }]}>
                      Tap thumbnail to preview
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalThumbnailsScroll}>
                    {/* "+" Add Photo Button */}
                    {selfieUris.length < 5 && (
                      <Pressable
                        onPress={() => {
                          showAlert({
                            title: 'Add Portrait',
                            message: 'Select a photo source for AI synthesis',
                            icon: 'image-outline',
                            buttons: [
                              { text: 'Gallery', onPress: pickFromGallery, icon: 'images-outline' },
                              { text: 'Take Photo', onPress: takeSelfie, icon: 'camera-outline' },
                              { text: 'Cancel', style: 'cancel' },
                            ],
                          });
                        }}
                        style={[
                          styles.addThumbnailTile,
                          {
                            backgroundColor: colors.backgroundElement,
                            borderColor: colors.border,
                          },
                        ]}>
                        <View style={[styles.addPlusIcon, { backgroundColor: colors.text }]}>
                          <Ionicons name="add" size={18} color={colors.background} />
                        </View>
                        <Text style={[styles.addTileText, { color: colors.text }]}>Add</Text>
                      </Pressable>
                    )}

                    {/* Selected Thumbnails */}
                    {selfieUris.map((uri, idx) => {
                      const isActive = idx === activePhotoIndex;
                      return (
                        <Pressable
                          key={uri + idx}
                          onPress={() => setActivePhotoIndex(idx)}
                          style={[
                            styles.thumbnailWrapper,
                            {
                              borderColor: isActive ? colors.text : 'transparent',
                            },
                          ]}>
                          <Image source={{ uri }} style={styles.thumbnailImg} />

                          {isActive && (
                            <View style={[styles.activeDotBadge, { backgroundColor: colors.text }]}>
                              <Ionicons name="checkmark" size={10} color={colors.background} />
                            </View>
                          )}

                          <Pressable
                            hitSlop={6}
                            onPress={() => removePhoto(idx)}
                            style={styles.thumbDeleteBtn}>
                            <Ionicons name="close-circle" size={16} color="#EF4444" />
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Sample portraits test bar */}
                  <View style={styles.sampleBar}>
                    <Text style={[styles.sampleBarText, { color: colors.textSecondary }]}>
                      Or test instantly with a sample:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sampleList}>
                      {SAMPLE_SELFIES.map((sample) => {
                        const isSelected = selfieUris.includes(sample.uri);
                        return (
                          <Pressable
                            key={sample.id}
                            onPress={() => {
                              if (isSelected) {
                                setSelfieUris((prev) => prev.filter((u) => u !== sample.uri));
                              } else {
                                setSelfieUris((prev) => {
                                  const next = prev.length >= 5 ? [sample.uri] : [...prev, sample.uri];
                                  setActivePhotoIndex(next.length - 1);
                                  return next;
                                });
                              }
                            }}
                            style={[
                              styles.samplePill,
                              isSelected && { borderColor: colors.text, borderWidth: 1.5 },
                            ]}>
                            <Image source={{ uri: sample.uri }} style={styles.samplePillImg} />
                            <Text style={[styles.samplePillName, { color: colors.text }]}>
                              {sample.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Continue Button */}
                  <Button
                    size="lg"
                    variant="primary"
                    disabled={selfieUris.length === 0}
                    onPress={() => setGenStep(2)}
                    style={styles.continueStepBtn}>
                    Continue to Output Config →
                  </Button>
                </View>
              </View>
            )}

            {/* ----------------- STEP 2: OUTPUT CONFIGURATION ----------------- */}
            {genStep === 2 && (
              <View style={styles.stepTwoContainer}>
                {/* Step 2 Top Bar */}
                <View style={styles.navHeaderRow}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Ionicons name="arrow-back" size={16} color={colors.text} />}
                    onPress={() => setGenStep(1)}>
                    Back
                  </Button>

                  <View
                    style={[
                      styles.stepProgressBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}>
                    <Text style={[styles.stepProgressText, { color: colors.text }]}>
                      Step 2 of 2: Output Config
                    </Text>
                  </View>

                  <View style={styles.summaryMiniThumbWrap}>
                    {selectedTemplate?.previewUrl && (
                      <Image
                        source={{ uri: selectedTemplate.previewUrl }}
                        style={styles.summaryMiniThumb}
                      />
                    )}
                  </View>
                </View>

                {/* Config Summary Card */}
                <Card bordered padding="md" style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Image
                      source={{ uri: selectedTemplate?.previewUrl || '' }}
                      style={styles.summaryStyleImg}
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={1}>
                        {selectedTemplate?.name}
                      </Text>
                      <Text style={[styles.summaryCategory, { color: colors.textSecondary }]}>
                        {selectedTemplate?.category} • {selfieUris.length} source{' '}
                        {selfieUris.length === 1 ? 'photo' : 'photos'} attached
                      </Text>
                    </View>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => router.push('/(tabs)/templates')}>
                      Change Style
                    </Button>
                  </View>
                </Card>

                {/* 1. Aspect Ratio */}
                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>Aspect Ratio</Text>
                  <View style={styles.aspectRatioGrid}>
                    {[
                      { id: '4:5', label: '4:5', sub: 'Instagram / Feed', icon: 'tablet-portrait-outline' },
                      { id: '1:1', label: '1:1', sub: 'Square / Profile', icon: 'square-outline' },
                      { id: '9:16', label: '9:16', sub: 'Story / Reel', icon: 'phone-portrait-outline' },
                    ].map((item) => {
                      const isSelected = aspectRatio === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => setAspectRatio(item.id as AspectRatio)}
                          style={[
                            styles.aspectCard,
                            {
                              backgroundColor: isSelected
                                ? isDark
                                  ? 'rgba(255, 255, 255, 0.12)'
                                  : 'rgba(0, 0, 0, 0.06)'
                                : colors.backgroundElement,
                              borderColor: isSelected ? colors.text : colors.border,
                            },
                          ]}>
                          <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={isSelected ? colors.text : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.aspectTitle,
                              { color: isSelected ? colors.text : colors.textSecondary },
                            ]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.aspectSub, { color: colors.textSecondary }]}>
                            {item.sub}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Style Strength */}
                <View style={styles.configSection}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.configLabel, { color: colors.text }]}>Style Strength</Text>
                    <Text style={[styles.labelBadge, { color: colors.primary }]}>{styleStrength}</Text>
                  </View>
                  <View style={styles.strengthPillRow}>
                    {[
                      { id: 'Natural', desc: '100% face likeness, subtle style' },
                      { id: 'Balanced', desc: 'Ideal studio harmony (Recommended)' },
                      { id: 'Intense', desc: 'Deep editorial artistic transformation' },
                    ].map((item) => {
                      const isSelected = styleStrength === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => setStyleStrength(item.id as StyleStrength)}
                          style={[
                            styles.strengthOption,
                            {
                              backgroundColor: isSelected
                                ? isDark
                                  ? 'rgba(255, 255, 255, 0.12)'
                                  : 'rgba(0, 0, 0, 0.06)'
                                : colors.backgroundElement,
                              borderColor: isSelected ? colors.text : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.strengthOptionTitle,
                              { color: isSelected ? colors.text : colors.textSecondary },
                            ]}>
                            {item.id}
                          </Text>
                          <Text style={[styles.strengthOptionDesc, { color: colors.textSecondary }]}>
                            {item.desc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Output Resolution */}
                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>Output Resolution</Text>
                  <View style={styles.resolutionRow}>
                    {(['0.5K', '1K', '2K', '4K'] as Resolution[]).map((res) => {
                      const isSelected = resolution === res;
                      return (
                        <Pressable
                          key={res}
                          onPress={() => setResolution(res)}
                          style={[
                            styles.resPill,
                            {
                              backgroundColor: isSelected
                                ? isDark
                                  ? 'rgba(255, 255, 255, 0.14)'
                                  : 'rgba(0, 0, 0, 0.08)'
                                : colors.backgroundElement,
                              borderColor: isSelected ? colors.text : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.resText,
                              { color: isSelected ? colors.text : colors.textSecondary },
                            ]}>
                            {res}
                          </Text>
                          {res === '2K' && (
                            <View style={styles.resMiniBadge}>
                              <Text style={styles.resMiniBadgeText}>HD</Text>
                            </View>
                          )}
                          {res === '4K' && (
                            <View style={[styles.resMiniBadge, { backgroundColor: '#8B5CF6' }]}>
                              <Text style={styles.resMiniBadgeText}>MAX</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Face Enhancement */}
                <View
                  style={[
                    styles.toggleCard,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>
                      Face Likeness Detail Enhancement
                    </Text>
                    <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                      Neural facial restoration keeps eye color, skin texture, and expressions authentic.
                    </Text>
                  </View>
                  <Switch
                    value={enhanceFace}
                    onValueChange={setEnhanceFace}
                    trackColor={{ false: '#374151', true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* 5. Custom Prompt */}
                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>
                    Custom Prompt / Creative Instructions (Optional)
                  </Text>
                  <Input
                    placeholder="e.g., golden hour lighting, cinematic rim light, dark studio background..."
                    value={additionalPrompt}
                    onChangeText={setAdditionalPrompt}
                    multiline
                    numberOfLines={3}
                  />

                  {/* Suggestion Chips */}
                  <View style={styles.chipWrap}>
                    {PROMPT_INSPIRATIONS.map((chip) => (
                      <Pressable
                        key={chip}
                        onPress={() => {
                          setAdditionalPrompt((prev) =>
                            prev ? `${prev.trim()}, ${chip}` : chip
                          );
                        }}
                        style={[
                          styles.promptChip,
                          {
                            backgroundColor: colors.backgroundElement,
                            borderColor: colors.border,
                          },
                        ]}>
                        <Text style={[styles.promptChipText, { color: colors.textSecondary }]}>
                          + {chip}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Fixed Bottom Generation CTA */}
                <View
                  style={[
                    styles.generateBottomBar,
                    {
                      backgroundColor: isDark
                        ? 'rgba(18, 18, 20, 0.98)'
                        : 'rgba(248, 247, 244, 0.98)',
                      borderTopColor: colors.border,
                    },
                  ]}>
                  <View style={styles.creditsCounterRow}>
                    <View style={styles.creditsInfoWrap}>
                      <Ionicons name="flash" size={14} color="#F59E0B" />
                      <Text style={[styles.creditsText, { color: colors.text }]}>
                        Cost: 5 Credits
                      </Text>
                    </View>
                    <Text style={[styles.creditsBalance, { color: colors.textSecondary }]}>
                      Balance: {currentUser.credits} Credits
                    </Text>
                  </View>

                  <Button
                    size="lg"
                    variant="primary"
                    icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
                    onPress={startGeneration}
                    style={styles.generateActionBtn}>
                    Generate AI Portrait
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ============================================================ */}
        {/* MODE: CREATE TEMPLATE                                        */}
        {/* ============================================================ */}
        {mode === 'createTemplate' && (
          <View style={styles.flowWrapper}>
            {/* ----------------- STEP 1: COVER PHOTO ----------------- */}
            {tplStep === 1 && (
              <View style={styles.stepOneContainer}>
                {/* Step 1 Header */}
                <View style={styles.navHeaderRow}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Ionicons name="arrow-back" size={16} color={colors.text} />}
                    onPress={() => setMode('generate')}>
                    Studio Photo
                  </Button>

                  <View
                    style={[
                      styles.stepProgressBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}>
                    <Text style={[styles.stepProgressText, { color: colors.text }]}>
                      Step 1 of 2: Style Cover
                    </Text>
                  </View>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!newTemplateImage}
                    onPress={() => setTplStep(2)}>
                    Next →
                  </Button>
                </View>

                {/* Hero Preview: Almost Covering the Entire Screen */}
                <View style={[styles.heroPreviewCard, { height: heroPreviewHeight }]}>
                  {newTemplateImage ? (
                    <View style={styles.heroImageContainer}>
                      <Image
                        source={{ uri: newTemplateImage }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />

                      <View style={styles.heroTopOverlay}>
                        <View style={styles.heroCountBadge}>
                          <Ionicons name="color-wand" size={12} color="#FFFFFF" />
                          <Text style={styles.heroCountText}>Style Cover Preview</Text>
                        </View>

                        <Pressable
                          hitSlop={10}
                          onPress={() => setNewTemplateImage(null)}
                          style={styles.heroDeleteBtn}>
                          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        </Pressable>
                      </View>

                      <View style={[styles.heroBottomOverlay, { justifyContent: 'flex-end' }]}>
                        <Pressable
                          hitSlop={8}
                          onPress={() => openImageViewer(newTemplateImage)}
                          style={styles.heroExpandBtn}>
                          <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    /* Empty Template Cover Dropzone */
                    <View
                      style={[
                        styles.heroEmptyDropzone,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                        <Ionicons name="color-wand" size={36} color="#8B5CF6" />
                      </View>
                      <Text style={[styles.emptyDropTitle, { color: colors.text }]}>
                        Upload Style Reference Image
                      </Text>
                      <Text style={[styles.emptyDropSub, { color: colors.textSecondary }]}>
                        This cover image sets the lighting, composition, and mood for your template.
                      </Text>

                      <View style={styles.emptyButtonsRow}>
                        <Button
                          variant="primary"
                          size="md"
                          icon={<Ionicons name="images-outline" size={16} color="#FFFFFF" />}
                          onPress={() => handlePickCoverImage(false)}>
                          Choose from Gallery
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          icon={<Ionicons name="camera-outline" size={16} color={colors.text} />}
                          onPress={() => handlePickCoverImage(true)}>
                          Take Photo
                        </Button>
                      </View>
                    </View>
                  )}
                </View>

                {/* Bottom List Area */}
                <View style={styles.bottomListArea}>
                  <View style={styles.bottomListHeader}>
                    <Text style={[styles.bottomListLabel, { color: colors.text }]}>
                      Cover Photo or Inspiration Preset
                    </Text>
                    <Text style={[styles.bottomListHint, { color: colors.textSecondary }]}>
                      Tap inspiration to apply
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalThumbnailsScroll}>
                    <Pressable
                      onPress={() => handlePickCoverImage(false)}
                      style={[
                        styles.addThumbnailTile,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View style={[styles.addPlusIcon, { backgroundColor: '#8B5CF6' }]}>
                        <Ionicons name="camera" size={18} color="#FFFFFF" />
                      </View>
                      <Text style={[styles.addTileText, { color: colors.text }]}>Pick</Text>
                    </Pressable>

                    {SAMPLE_STYLE_COVERS.map((sample) => {
                      const isActive = newTemplateImage === sample.uri;
                      return (
                        <Pressable
                          key={sample.id}
                          onPress={() => setNewTemplateImage(sample.uri)}
                          style={[
                            styles.thumbnailWrapper,
                            {
                              borderColor: isActive ? '#8B5CF6' : 'transparent',
                            },
                          ]}>
                          <Image source={{ uri: sample.uri }} style={styles.thumbnailImg} />
                          {isActive && (
                            <View style={[styles.activeDotBadge, { backgroundColor: '#8B5CF6' }]}>
                              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <Button
                    size="lg"
                    variant="primary"
                    disabled={!newTemplateImage}
                    onPress={() => setTplStep(2)}
                    style={styles.continueStepBtn}>
                    Continue to Template Info →
                  </Button>
                </View>
              </View>
            )}

            {/* ----------------- STEP 2: TEMPLATE DETAILS ----------------- */}
            {tplStep === 2 && (
              <View style={styles.stepTwoContainer}>
                {/* Step 2 Top Bar */}
                <View style={styles.navHeaderRow}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Ionicons name="arrow-back" size={16} color={colors.text} />}
                    onPress={() => setTplStep(1)}>
                    Back
                  </Button>

                  <View
                    style={[
                      styles.stepProgressBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}>
                    <Text style={[styles.stepProgressText, { color: colors.text }]}>
                      Step 2 of 2: Template Info
                    </Text>
                  </View>

                  <View style={styles.summaryMiniThumbWrap}>
                    {newTemplateImage && (
                      <Image source={{ uri: newTemplateImage }} style={styles.summaryMiniThumb} />
                    )}
                  </View>
                </View>

                {/* Form Fields */}
                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>Template Title</Text>
                  <Input
                    placeholder="e.g., 90s Vintage Film, Golden Hour Noir..."
                    value={newTemplateName}
                    onChangeText={setNewTemplateName}
                  />
                </View>

                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsRow}>
                    {TEMPLATE_CATEGORIES.map((cat) => {
                      const isSelected = newTemplateCategory === cat;
                      return (
                        <Badge
                          key={cat}
                          variant={isSelected ? 'active' : 'secondary'}
                          onPress={() => setNewTemplateCategory(cat)}
                          style={styles.categoryBadge}>
                          {cat}
                        </Badge>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>Description</Text>
                  <Input
                    placeholder="Tell other creators what makes this style signature and how to use it..."
                    value={newTemplateDesc}
                    onChangeText={setNewTemplateDesc}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Live Card Preview */}
                <View style={styles.configSection}>
                  <Text style={[styles.configLabel, { color: colors.text }]}>
                    Live Catalog Preview
                  </Text>
                  <Card bordered padding="md" style={styles.previewCardMini}>
                    <View style={styles.summaryRow}>
                      {newTemplateImage && (
                        <Image source={{ uri: newTemplateImage }} style={styles.summaryStyleImg} />
                      )}
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.summaryTitle, { color: colors.text }]}>
                          {newTemplateName.trim() || 'Your Template Title'}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <Badge variant="primary">{newTemplateCategory}</Badge>
                          <Badge variant="default">By @{currentUser.username}</Badge>
                        </View>
                      </View>
                    </View>
                  </Card>
                </View>

                {/* Bottom Publish CTA */}
                <View
                  style={[
                    styles.generateBottomBar,
                    {
                      backgroundColor: isDark
                        ? 'rgba(18, 18, 20, 0.98)'
                        : 'rgba(248, 247, 244, 0.98)',
                      borderTopColor: colors.border,
                    },
                  ]}>
                  <Button
                    size="lg"
                    variant="primary"
                    icon={<Ionicons name="color-wand" size={18} color="#FFFFFF" />}
                    onPress={handleSubmitTemplate}
                    style={styles.generateActionBtn}>
                    Publish Template to Community
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ============================================================ */}
        {/* TEMPLATE SUBMISSION SUCCESS MODAL                            */}
        {/* ============================================================ */}
        <Modal
          visible={templateSubmitted}
          title="Template Published!"
          onClose={() => setTemplateSubmitted(false)}>
          <View style={styles.successModalContent}>
            <View style={[styles.successIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={[styles.successModalTitle, { color: colors.text }]}>
              {`"${newTemplateName}" is now Live!`}
            </Text>
            <Text style={[styles.successModalSub, { color: colors.textSecondary }]}>
              Your custom style template has been added to the catalog and is ready to generate portraits.
            </Text>

            <View style={styles.successModalButtons}>
              <Button
                variant="primary"
                onPress={() => {
                  setTemplateSubmitted(false);
                  setMode('generate');
                  setGenStep(1);
                }}>
                Generate Photo with this Style
              </Button>
              <Button
                variant="outline"
                onPress={() => {
                  setTemplateSubmitted(false);
                  router.push('/(tabs)/templates');
                }}>
                View in Templates Catalog
              </Button>
            </View>
          </View>
        </Modal>

        {/* ============================================================ */}
        {/* GENERATION HISTORY MODAL                                     */}
        {/* ============================================================ */}
        <Modal
          visible={isHistoryModalVisible}
          title={`Generation History (${generatedPhotos.length})`}
          onClose={() => setIsHistoryModalVisible(false)}>
          <View style={{ maxHeight: 420 }}>
            {generatedPhotos.length === 0 ? (
              <View style={styles.historyEmpty}>
                <Ionicons name="images-outline" size={36} color={colors.textSecondary} />
                <Text style={[styles.historyEmptyText, { color: colors.textSecondary }]}>
                  No studio portraits generated yet. Start your first creation!
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
                {generatedPhotos.map((photo) => (
                  <Pressable
                    key={photo.id}
                    onPress={() => {
                      setIsHistoryModalVisible(false);
                      router.push({
                        pathname: '/generation-result',
                        params: {
                          photoUri: photo.uri,
                          templateName: photo.templateName || 'Studio Aesthetic',
                          aspectRatio: photo.aspectRatio,
                          resolution: photo.resolution,
                        },
                      });
                    }}
                    style={[
                      styles.historyItemRow,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}>
                    <Image source={{ uri: photo.uri }} style={styles.historyThumb} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.historyName, { color: colors.text }]}>
                        {photo.templateName || 'Studio Portrait'}
                      </Text>
                      <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>
                        {photo.aspectRatio} • {photo.resolution}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flowWrapper: {
    flex: 1,
  },
  stepOneContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 12,
  },
  stepTwoContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 16,
  },
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  templatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  templatePillThumb: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  templatePillName: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepProgressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  stepProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconHeaderBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Preview
  heroPreviewCard: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTopOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  heroCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  heroCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBottomOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  heroExpandBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty Hero Dropzone
  heroEmptyDropzone: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDropTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDropSub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // Bottom List Area
  bottomListArea: {
    gap: 10,
  },
  bottomListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bottomListLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomListHint: {
    fontSize: 11,
  },
  horizontalThumbnailsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  addThumbnailTile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPlusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTileText: {
    fontSize: 11,
    fontWeight: '700',
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2.5,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  activeDotBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbDeleteBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
  },

  // Sample Bar
  sampleBar: {
    gap: 6,
    marginTop: 4,
  },
  sampleBarText: {
    fontSize: 11,
  },
  sampleList: {
    gap: 8,
    paddingVertical: 2,
  },
  samplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
  },
  samplePillImg: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  samplePillName: {
    fontSize: 11,
    fontWeight: '600',
  },
  continueStepBtn: {
    marginTop: 6,
  },

  // Step 2 Styles
  summaryMiniThumbWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    overflow: 'hidden',
  },
  summaryMiniThumb: {
    width: '100%',
    height: '100%',
  },
  summaryCard: {
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryStyleImg: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryCategory: {
    fontSize: 12,
  },
  configSection: {
    gap: 8,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelBadge: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Aspect Ratio Grid
  aspectRatioGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  aspectCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  aspectTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  aspectSub: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Strength Row
  strengthPillRow: {
    gap: 8,
  },
  strengthOption: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  strengthOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  strengthOptionDesc: {
    fontSize: 12,
  },

  // Resolution Row
  resolutionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  resText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resMiniBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  resMiniBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },

  // Toggle Card
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  // Prompt Chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Generate Fixed Bottom Bar
  generateBottomBar: {
    paddingTop: 12,
    gap: 10,
  },
  creditsCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  creditsInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  creditsBalance: {
    fontSize: 12,
  },
  generateActionBtn: {
    width: '100%',
  },

  // Template Creation Step 2
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewCardMini: {
    marginTop: 4,
  },

  // Modals
  successModalContent: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  successModalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  successModalButtons: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  historyEmpty: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  historyEmptyText: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  historyList: {
    gap: 8,
    paddingVertical: 4,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyMeta: {
    fontSize: 12,
  },
});
